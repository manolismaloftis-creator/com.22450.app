/**
 * Αυτόματη ενημέρωση διαφημίσεων/ειδοποιήσεων από τη βάση όταν ανοίγει η εφαρμογή
 */

import { APP_CONFIG } from './app-config.js';
import { checkForAppUpdate } from './app-update-check.js';

const STORAGE_KEY = 'app22450_notifications';
const LAST_FETCH_KEY = 'app22450_lastFetch';

/** AbortSignal με timeout - fallback για παλιά browsers χωρίς AbortSignal.timeout */
function abortSignalWithTimeout(ms) {
  if (typeof AbortSignal?.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

/**
 * Ανάκτηση νέων ειδοποιήσεων από το API
 */
export async function fetchNotificationsFromApi() {
  const url = APP_CONFIG.NOTIFICATIONS_API_URL;
  if (!url) return null;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: abortSignalWithTimeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && (Array.isArray(data) || data.notifications)) {
      const list = Array.isArray(data) ? data : data.notifications || [];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      localStorage.setItem(LAST_FETCH_KEY, Date.now().toString());
      return list;
    }
    return null;
  } catch (e) {
    console.warn('Notification fetch:', e);
    return null;
  }
}

/**
 * Εγγραφή push token στο backend (native app)
 */
export async function registerPushToken(token) {
  const url = APP_CONFIG.REGISTER_DEVICE_URL;
  if (!url) return;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        token,
        platform: navigator.userAgent.includes('Android') ? 'android' : 'ios',
        appId: 'gr.studiom.app22450',
      }),
      signal: abortSignalWithTimeout(5000),
    });
    if (!res.ok) {
      console.warn('Register device: HTTP', res.status);
    }
  } catch (e) {
    console.warn('Register device:', e);
  }
}

/**
 * Ρύθμιση Push Notifications και event listeners (μόνο native)
 * Απαιτεί Firebase (google-services.json) - αλλιώς κρασάρει!
 */
export async function setupPushNotifications() {
  if (!APP_CONFIG.PUSH_ENABLED) return;
  if (typeof window.Capacitor === 'undefined' || !window.Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications');

    // Ζήτα άδεια (Android 13+)
    const perm = await PushNotifications.checkPermissions();
    if (perm.receive === 'prompt') {
      await PushNotifications.requestPermissions();
    }

    // Εγγραφή για push
    await PushNotifications.register();

    // Ακούει το token για αποστολή στο backend
    PushNotifications.addListener(
      'registration',
      async (ev) => {
        const token = ev.value;
        if (token) await registerPushToken(token);
      }
    );

    // Όταν φτάνει ειδοποίηση ενώ η εφαρμογή είναι ανοιχτή
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push received:', notification);
      // Αποθήκευση για παρουσίαση στο 22450.gr
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        stored.unshift({
          ...notification,
          receivedAt: Date.now(),
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.slice(0, 50)));
      } catch (_) {}
    });

    // Όταν ο χρήστης πατήσει την ειδοποίηση
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push action:', action);
    });
  } catch (e) {
    // Firebase δεν είναι ρυθμισμένο ή άλλο σφάλμα - συνεχίζουμε χωρίς push
    if (!String(e?.message || e).includes('Firebase')) {
      console.warn('Push setup:', e);
    }
  }
}

/**
 * Κύριο: Εκτέλεση ενημέρωσης κατά το άνοιγμα της εφαρμογής
 */
export async function runUpdateOnAppOpen() {
  await Promise.all([
    fetchNotificationsFromApi(),
    setupPushNotifications(),
    checkForAppUpdate(),
  ]);
}
