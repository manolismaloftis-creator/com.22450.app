/**
 * Προσθήκη στο site 22450.gr για αυτόματη ενημέρωση όταν η εφαρμογή έρχεται στο προσκήνιο
 *
 * Χρήση: Βάλτε αυτό το script στο 22450.gr ώστε όταν ο χρήστης επιστρέψει
 * στην εφαρμογή (από background), να γίνεται fetch νέων διαφημίσεων
 */
(function() {
  const API_URL = 'https://www.22450.gr/api/notifications';
  const STORAGE_KEY = 'app22450_notifications';

  function fetchNotifications() {
    if (!API_URL) return;
    fetch(API_URL, { headers: { Accept: 'application/json' } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && (Array.isArray(data) || data.notifications)) {
          const list = Array.isArray(data) ? data : (data.notifications || []);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
            if (typeof window.onNotificationsUpdated === 'function') {
              window.onNotificationsUpdated(list);
            }
          } catch (_) {}
        }
      })
      .catch(() => {});
  }

  // Όταν η σελίδα γίνεται ξανά ορατή (επιστροφή στην εφαρμογή / από background)
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
      fetchNotifications();
    }
  });
})();
