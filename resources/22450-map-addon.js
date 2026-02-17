/**
 * Addon: Προσθήκη GPS κουμπιού και επαναφοράς σε ΥΠΑΡΧΟΝΤΕΣ Leaflet χάρτες
 * Για την ΑΡΧΙΚΗ ΣΕΛΙΔΑ του 22450.gr που χρησιμοποιεί άλλο script για τον χάρτη
 *
 * Φορτώστε ΜΕΤΑ το Leaflet και ΠΡΙΝ ή ΜΕΤΑ τον χάρτη της αρχικής:
 * <script src="leaflet.js"></script>
 * <script src="22450-map-addon.js"></script>
 *
 * Το addon "τυλίγει" το L.map() ώστε κάθε νέος χάρτης να παίρνει αυτόματα
 * το κουμπί GPS και την επαναφορά στη Βώρα.
 */
(function() {
  if (typeof L === 'undefined') return;

  var STORAGE_KEY = 'app22450_userLocation';
  var DEFAULT_CENTER = [35.5076, 27.2122];
  var DEFAULT_ZOOM = 14;

  function getUserLocation() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var data = JSON.parse(stored);
        if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
          return { lat: data.lat, lng: data.lng };
        }
      }
    } catch (_) {}
    return null;
  }

  function saveUserLocation(lat, lng) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat: lat, lng: lng, updated: Date.now() }));
    } catch (_) {}
  }

  function createUserMarkerIcon() {
    return L.divIcon({
      className: 'user-location-marker',
      html: '<div style="width:24px;height:24px;border-radius:50%;background:#2DB8B8;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  }

  function enhanceMap(map) {
    if (map._22450Enhanced) return;
    map._22450Enhanced = true;

    var userMarker = null;
    var locationLayerGroup = L.layerGroup().addTo(map);
    var viewBeforeLocation = null;
    var defaultRestoreView = { lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1], zoom: DEFAULT_ZOOM };

    function showMyLocation() {
      var loc = getUserLocation();
      if (!loc) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function(pos) {
              var lat = pos.coords.latitude, lng = pos.coords.longitude;
              saveUserLocation(lat, lng);
              goToUserLocation(lat, lng);
            },
            function() {},
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
          );
        }
        return;
      }
      goToUserLocation(loc.lat, loc.lng);
    }

    function goToUserLocation(lat, lng) {
      var c = map.getCenter();
      var alreadyAtUser = Math.abs(c.lat - lat) < 0.002 && Math.abs(c.lng - lng) < 0.002;
      viewBeforeLocation = alreadyAtUser ? defaultRestoreView : { lat: c.lat, lng: c.lng, zoom: map.getZoom() };
      locationLayerGroup.clearLayers();
      userMarker = L.marker([lat, lng], { icon: createUserMarkerIcon() }).bindPopup('Η τοποθεσία σας').addTo(locationLayerGroup);
      map.setView([lat, lng], 15);
    }

    function hideMyLocation() {
      var restore = viewBeforeLocation || defaultRestoreView;
      if (restore) {
        map.setView([restore.lat, restore.lng], restore.zoom);
        viewBeforeLocation = null;
      }
      locationLayerGroup.clearLayers();
      userMarker = null;
    }

    function toggleMyLocation(checked) {
      if (checked) showMyLocation();
      else hideMyLocation();
    }

    var container = map.getContainer();
    var locChkId = 'map-addon-' + (container.id || 'm') + '-' + Date.now();
    var control = L.control({ position: 'topright' });
    control.onAdd = function() {
      var div = L.DomUtil.create('div', 'user-location-control');
      div.style.cssText = 'background:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.35);font-size:14px;border:2px solid #2DB8B8;cursor:pointer;min-width:120px';
      div.innerHTML = '<div style="font-weight:700;color:#2DB8B8;font-size:16px;margin-bottom:6px;letter-spacing:0.5px">GPS</div><label style="display:flex;align-items:center;gap:8px;cursor:pointer;white-space:nowrap"><input type="checkbox" id="' + locChkId + '" style="width:18px;height:18px;cursor:pointer"> Δείξε την τοποθεσία μου</label>';
      L.DomEvent.disableClickPropagation(div);
      div.querySelector('input[type="checkbox"]').addEventListener('change', function() {
        toggleMyLocation(this.checked);
      });
      return div;
    };
    control.addTo(map);
  }

  var origMap = L.map;
  if (typeof origMap === 'function') {
    L.map = function(container, options) {
      var map = origMap.call(L, container, options);
      setTimeout(function() {
        if (map && map.getContainer) enhanceMap(map);
      }, 0);
      return map;
    };
  }

  window.enhanceLeafletMapWith22450 = enhanceMap;
})();
