/**
 * Ρυθμίσεις εφαρμογής - ορίστε το URL του API για διαφημίσεις/ειδοποιήσεις
 *
 * ΣΗΜΑΝΤΙΚΟ: Για Push Notifications χρειάζεται google-services.json (Firebase).
 * Αν δεν έχετε ρυθμίσει Firebase, αφήστε PUSH_ENABLED: false.
 */
export const APP_CONFIG = {
  // Apple App Store ID για iOS (αριθμός από το URL: https://apps.apple.com/app/id123456789)
  // Αφήστε '' μέχρι να δημοσιεύσετε την εφαρμογή στο App Store
  APP_STORE_ID: '',
  // Βασικό URL του API για ενημερώσεις (αλλάξτε με το δικό σας - ή '' αν δεν υπάρχει ακόμα)
  NOTIFICATIONS_API_URL: '',
  // Endpoint για εγγραφή push token (αφήστε '' αν δεν έχετε backend)
  REGISTER_DEVICE_URL: '',
  // Ορίστε true ΜΟΝΟ μετά την προσθήκη του google-services.json (Firebase)
  PUSH_ENABLED: false,
};

// Key στο localStorage για την τοποθεσία του χρήστη (χρησιμοποιείται στον χάρτη)
export const USER_LOCATION_STORAGE_KEY = 'app22450_userLocation';
