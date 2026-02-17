/**
 * Χάρτης με τοποθεσία χρήστη για το 22450.gr
 *
 * Όταν ενεργοποιείς την τοποθεσία: κεντράρει στο σημείο σου.
 * Όταν απενεργοποιείς (uncheck): επιστρέφει στην προηγούμενη θέση/zoom.
 *
 * Χρήση:
 * 1. Προσθέστε στο HTML: <div id="map" style="height:400px"></div>
 * 2. Φορτώστε Leaflet: <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
 *    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
 * 3. Φορτώστε αυτό το script: <script src="22450-map-user-location.js"></script>
 * 4. Κλήση: window.initUserLocationMap('map') ή initUserLocationMap('map')
 *
 * Εναλλακτικά: το script ψάχνει αυτόματα για #map ή .user-location-map
 */
(function() {
  var STORAGE_KEY = 'app22450_userLocation';
  var DEFAULT_CENTER = [35.5076, 27.2122]; // Βώρα / Κάρπαθος (22450)
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

  function initUserLocationMap(containerIdOrElement) {
    var container = typeof containerIdOrElement === 'string'
      ? document.getElementById(containerIdOrElement)
      : containerIdOrElement;
    if (!container || typeof L === 'undefined') return null;

    var stored = getUserLocation();
    var initialCenter = stored ? [stored.lat, stored.lng] : DEFAULT_CENTER;

    var map = L.map(container).setView(initialCenter, DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

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
              var lat = pos.coords.latitude;
              var lng = pos.coords.longitude;
              saveUserLocation(lat, lng);
              goToUserLocation(lat, lng);
            },
            function() { /* άρνηση */ },
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
      userMarker = L.marker([lat, lng], { icon: createUserMarkerIcon() })
        .bindPopup('Η τοποθεσία σας')
        .addTo(locationLayerGroup);
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
      if (checked) {
        showMyLocation();
      } else {
        hideMyLocation();
      }
    }

    var locChkId = 'map-show-loc-' + (container.id || 'm') + '-' + Date.now();
    var control = L.control({ position: 'topright' });
    control.onAdd = function() {
      var div = L.DomUtil.create('div', 'user-location-control');
      div.style.cssText = 'background:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.35);font-size:14px;border:2px solid #2DB8B8;cursor:pointer;min-width:120px';
      div.innerHTML = '<div style="font-weight:700;color:#2DB8B8;font-size:16px;margin-bottom:6px;letter-spacing:0.5px">GPS</div><label style="display:flex;align-items:center;gap:8px;cursor:pointer;white-space:nowrap"><input type="checkbox" id="' + locChkId + '" style="width:18px;height:18px;cursor:pointer"> Δείξε την τοποθεσία μου</label>';
      L.DomEvent.disableClickPropagation(div);
      var chk = div.querySelector('input[type="checkbox"]');
      chk.addEventListener('change', function() {
        toggleMyLocation(chk.checked);
      });
      return div;
    };
    control.addTo(map);

    function getCenterCoords() {
      var c = map.getCenter();
      return { lat: c.lat, lng: c.lng, zoom: map.getZoom() };
    }

    function updateCoordsDisplay() {
      var c = getCenterCoords();
      if (coordsEl) coordsEl.textContent = c.lat.toFixed(5) + ', ' + c.lng.toFixed(5);
    }

    var coordsEl = null;
    var coordsControl = L.control({ position: 'bottomleft' });
    coordsControl.onAdd = function() {
      var div = L.DomUtil.create('div', 'map-coords-display');
      div.style.cssText = 'background:#fff;padding:6px 10px;border-radius:4px;box-shadow:0 1px 5px rgba(0,0,0,0.3);font-size:12px;font-family:monospace';
      coordsEl = div;
      updateCoordsDisplay();
      map.on('moveend', updateCoordsDisplay);
      return div;
    };
    coordsControl.addTo(map);

    // Όταν υπάρχει αποθηκευμένη τοποθεσία, μπορεί ο χρήστης να έχει ήδη κάνει check - δεν το κάνουμε auto
    if (stored && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(pos) {
          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          saveUserLocation(lat, lng);
          if (userMarker) {
            userMarker.setLatLng([lat, lng]);
          }
        },
        function() {},
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    }

    var api = {
      map: map,
      showMyLocation: showMyLocation,
      hideMyLocation: hideMyLocation,
      toggleMyLocation: toggleMyLocation,
      getCenterCoords: getCenterCoords,
      getUserLocation: getUserLocation
    };

    if (typeof window.onUserLocationMapReady === 'function') {
      window.onUserLocationMapReady(map, api);
    }
    return api;
  }

  window.initUserLocationMap = initUserLocationMap;

  function autoInitMaps() {
    var selectors = ['#map', '#home-map', '#main-map', '.user-location-map', '.home-map', '.main-map', '[data-22450-map]'];
    var seen = {};
    for (var i = 0; i < selectors.length; i++) {
      var list = document.querySelectorAll(selectors[i]);
      for (var j = 0; j < list.length; j++) {
        var el = list[j];
        if (el && !seen[el]) {
          seen[el] = 1;
          initUserLocationMap(el);
        }
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitMaps);
  } else {
    autoInitMaps();
  }
})();
