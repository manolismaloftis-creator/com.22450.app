/**
 * Location Gate - Ζητά άδεια τοποθεσίας στην έναρξη (Native App, PWA, Web)
 * Αποθηκεύει την τοποθεσία για χρήση στον χάρτη στο 22450.gr
 * Αυτόματη ενημέρωση διαφημίσεων από τη βάση
 * Μετά την απάντηση του χρήστη, ανακατευθύνει στο 22450.gr
 */

import { runUpdateOnAppOpen } from './notification-update.js';
import { USER_LOCATION_STORAGE_KEY } from './app-config.js';

const TARGET_URL = 'https://www.22450.gr';

function saveUserLocation(lat, lng) {
  try {
    localStorage.setItem(USER_LOCATION_STORAGE_KEY, JSON.stringify({ lat, lng, updated: Date.now() }));
  } catch (_) {}
}

async function requestLocationAndRedirect() {
  const statusEl = document.getElementById('location-status');
  const spinnerEl = document.getElementById('location-spinner');

  const setStatus = (text) => {
    if (statusEl) statusEl.textContent = text;
  };

  const redirect = () => {
    if (sessionStorage.getItem('app22450_mapDemoRequested')) {
      sessionStorage.removeItem('app22450_mapDemoRequested');
      return; // Ο χρήστης πάτησε Δοκιμή χάρτη - μην αντικαταστήσεις
    }
    if (spinnerEl) spinnerEl.style.display = 'none';
    setStatus('Πρόσβαση στο 22450.gr...');
    window.location.replace(TARGET_URL);
  };

  try {
    setStatus('Ενημέρωση...');

    // Αυτόματη ενημέρωση διαφημίσεων από τη βάση (κάθε φορά που ανοίγει η εφαρμογή)
    await runUpdateOnAppOpen().catch(() => {});

    setStatus('Αίτηση άδειας τοποθεσίας...');

    const isNative = typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform();

    if (isNative) {
      // Native app (Capacitor)
      const { SplashScreen } = await import('@capacitor/splash-screen');
      SplashScreen.hide();

      const { Geolocation } = await import('@capacitor/geolocation');
      try {
        await Geolocation.requestPermissions();
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false });
        if (pos?.coords) {
          saveUserLocation(pos.coords.latitude, pos.coords.longitude);
        }
      } catch (e) {
        // Χρήστης αρνήθηκε ή σφάλμα - συνεχίζουμε όπως και να 'χει
      }
    } else {
      // PWA / Web - Χρήση των standard Geolocation APIs
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (p) => resolve(p),
              () => resolve(null),
              { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
            );
          });
          if (pos?.coords) {
            saveUserLocation(pos.coords.latitude, pos.coords.longitude);
          }
        } catch (e) {
          console.warn('Location:', e);
        }
      }
    }
  } catch (e) {
    console.warn('Location gate:', e);
  }

  redirect();
}

// Έναρξη μόλις φορτώσει η σελίδα
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', requestLocationAndRedirect);
} else {
  requestLocationAndRedirect();
}
