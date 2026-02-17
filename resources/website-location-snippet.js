/**
 * Συνιστώμενο snippet για το site 22450.gr
 * Προσθέστε αυτό το script στην αρχή του site για να ζητά άδεια τοποθεσίας
 *
 * Χρήση: <script src="website-location-snippet.js"></script>
 * ή ενσωματώστε το περιεχόμενο στο head του HTML
 */
(function() {
  if (!navigator.geolocation) return;

  // Ζήτα τοποθεσία στην πρώτη φόρτωση
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      // Αποθήκευση για χρήση στο site (προαιρετικό)
      sessionStorage.setItem('locationAsked', '1');
      if (typeof window.onLocationReady === 'function') {
        window.onLocationReady(pos);
      }
    },
    function() {
      sessionStorage.setItem('locationAsked', '1');
      if (typeof window.onLocationDenied === 'function') {
        window.onLocationDenied();
      }
    },
    { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
  );
})();
