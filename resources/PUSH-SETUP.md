# Ρύθμιση Push Notifications

## Android (Firebase)

1. Δημιουργήστε project στο [Firebase Console](https://console.firebase.google.com)
2. Προσθέστε Android εφαρμογή με package name: `gr.studiom.app22450`
3. Κατεβάστε το `google-services.json`
4. Τοποθετήστε το σε: `android/app/google-services.json`
5. Εκτελέστε: `npx cap sync android`

## iOS

1. Ενεργοποιήστε Push Notifications capability στο Xcode
2. Απαιτείται Apple Developer account (πληρωμένο)

## API Backend

Ορίστε τα URLs στο `src/js/app-config.js`:

- **NOTIFICATIONS_API_URL**: GET - επιστρέφει JSON με `{ notifications: [...] }` ή πίνακα
- **REGISTER_DEVICE_URL**: POST - δέχεται `{ token, platform, appId }` για εγγραφή FCM/APNs token

## Διαφημίσεις στο 22450.gr

Για ενημέρωση όταν ο χρήστης επιστρέφει στην εφαρμογή, προσθέστε το
`22450-website-foreground-refresh.js` στο site 22450.gr.

Οι ειδοποιήσεις αποθηκεύονται στο `localStorage` με key `app22450_notifications`.
