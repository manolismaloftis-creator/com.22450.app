/**
 * Back button handler για 22450.gr
 *
 * - Όταν έχεις κάνει scroll προς τα κάτω: πάτα Back → scroll προς τα πάνω (δεν βγαίνει από εφαρμογή)
 * - Όταν είσαι πάνω πάνω: πάτα Back → προηγούμενη σελίδα (ή έξοδος αν δεν υπάρχει)
 *
 * Χρήση: Προσθήκη στο 22450.gr:
 * <script src="/path/to/22450-back-handler.js"></script>
 */
(function() {
  var SCROLL_THRESHOLD = 80;
  var hasPushedState = false;

  function getScrollTop() {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    hasPushedState = false;
  }

  function onScroll() {
    var y = getScrollTop();
    if (y > SCROLL_THRESHOLD && !hasPushedState) {
      try {
        history.pushState({ scrolled: true }, '', location.href);
        hasPushedState = true;
      } catch (_) {}
    } else if (y <= SCROLL_THRESHOLD) {
      hasPushedState = false;
    }
  }

  function onPopState() {
    if (hasPushedState) scrollToTop();
  }

  var scrollTimer;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(onScroll, 100);
  }, { passive: true });

  window.addEventListener('popstate', onPopState);
})();
