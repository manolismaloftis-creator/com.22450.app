# Χάρτης με τοποθεσία χρήστη

## Για το site 22450.gr

### ΣΗΜΑΝΤΙΚΟ: Αρχική σελίδα vs Σελίδες επιχειρήσεων

Υπάρχουν δυο χάρτες: στη **αρχική σελίδα** και στις **σελίδες επιχειρήσεων**. Πρέπει και οι δύο να φορτώσουν το ίδιο script `22450-map-user-location.js`. Αν η αρχική χρησιμοποιεί άλλο script ή container, δώστε στο div του χάρτη ένα από:
- `id="map"` ή `id="home-map"` ή `id="main-map"`
- `class="user-location-map"` ή `class="home-map"` ή `data-22450-map`

Το script αναζητά αυτόματα όλους αυτούς τους containers.

### 1. Προσθήκη στο HTML

```html
<!-- Leaflet CSS & JS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<!-- Container χάρτη -->
<div id="map" style="height: 400px; width: 100%;"></div>

<!-- Script τοποθεσίας χρήστη -->
<script src="/path/to/22450-map-user-location.js"></script>
```

### 2. Αυτόματη έναρξη

Το script ψάχνει για: `#map`, `#home-map`, `#main-map`, `.user-location-map`, `.home-map`, `.main-map`, `[data-22450-map]` και εμφανίζει τον χάρτη με:
- Κεντραρισμό στην τοποθεσία του χρήστη (από localStorage ή αίτηση Geolocation)
- Σημαία (marker) teal για τη θέση του χρήστη
- OpenStreetMap tiles (δωρεάν, χωρίς API key)

### 3. Χειροκίνητη κλήση

```javascript
// Αν το container έχει id="myMap"
initUserLocationMap('myMap');

// Ή με DOM element
initUserLocationMap(document.getElementById('myMap'));
```

### 4. Callback όταν ο χάρτης είναι έτοιμος

```javascript
window.onUserLocationMapReady = function(map) {
  // map = αντικείμενο Leaflet
  // Π.χ. προσθήκη επιπλέον markers
};
```

### localStorage

Η τοποθεσία αποθηκεύεται με key `app22450_userLocation` (από την εφαρμογή 22450 και το location gate).
