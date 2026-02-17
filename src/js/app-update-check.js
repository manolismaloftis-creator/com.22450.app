/**
 * Έλεγχος ενημερώσεων εφαρμογής - εμφανίζει μήνυμα αν υπάρχει νέα έκδοση στο Play Store / App Store
 * Χρησιμοποιεί το @capawesome/capacitor-app-update (μόνο native app)
 */

import { APP_CONFIG } from './app-config.js';

const STORAGE_SKIP_KEY = 'app22450_updateSkipUntil';
const SKIP_DAYS = 1; // Μην ξαναρωτάς για update για 1 ημέρα αν πει "Όχι"

/**
 * Έλεγχος για διαθέσιμη ενημέρωση και εμφάνιση μηνύματος
 */
export async function checkForAppUpdate() {
  if (typeof window.Capacitor === 'undefined' || !window.Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const { AppUpdate, AppUpdateAvailability } = await import('@capawesome/capacitor-app-update');
    const { Capacitor } = await import('@capacitor/core');

    const result = await AppUpdate.getAppUpdateInfo();

    if (result.updateAvailability !== AppUpdateAvailability.UPDATE_AVAILABLE) {
      return;
    }

    // Αν ο χρήστης είχε πει "Όχι" πρόσφατα, μην ενοχλείς
    try {
      const skipUntil = parseInt(localStorage.getItem(STORAGE_SKIP_KEY) || '0', 10);
      if (Date.now() < skipUntil) return;
    } catch (_) {}

    const version = result.availableVersionName || result.availableVersionCode || '';
    const msg = version
      ? `Υπάρχει νέα έκδοση (${version}). Θέλετε να κάνετε λήψη;`
      : 'Υπάρχει νέα έκδοση της εφαρμογής. Θέλετε να κάνετε λήψη;';

    const userWants = window.confirm(msg);
    if (!userWants) {
      localStorage.setItem(STORAGE_SKIP_KEY, (Date.now() + SKIP_DAYS * 24 * 60 * 60 * 1000).toString());
      return;
    }

    // Android: immediate update αν επιτρέπεται, αλλιώς Play Store
    if (Capacitor.getPlatform() === 'android') {
      if (result.immediateUpdateAllowed) {
        await AppUpdate.performImmediateUpdate();
        return;
      }
      if (result.flexibleUpdateAllowed) {
        await AppUpdate.startFlexibleUpdate();
        // Ο χρήστης κάνει download στο background - μπορεί να κλείσει μετά
        return;
      }
    }

    // iOS: απαιτείται APP_STORE_ID (Apple ID από https://apps.apple.com/app/id123456789)
    if (Capacitor.getPlatform() === 'ios') {
      if (!APP_CONFIG.APP_STORE_ID) {
        console.warn('App update: Ρυθμίστε APP_STORE_ID στο app-config.js για να ανοίξει το App Store στο iOS');
        return;
      }
      await AppUpdate.openAppStore({ appId: APP_CONFIG.APP_STORE_ID });
    } else {
      await AppUpdate.openAppStore();
    }
  } catch (e) {
    // Εφαρμογή δεν στο store, ή network error, ή άλλο - αγνόησε
    console.warn('App update check:', e?.message || e);
  }
}
