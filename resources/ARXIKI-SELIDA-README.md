# Χάρτης στην ΑΡΧΙΚΗ ΣΕΛΙΔΑ – Οδηγίες

Ο χάρτης της αρχικής σελίδας χρησιμοποιεί συνήθως **διαφορετικό** script από τις σελίδες επιχειρήσεων.

**ΣΗΜΑΝΤΙΚΟ:** Η κεντρική σελίδα του 22450.gr χρησιμοποιεί **Mapbox** (όχι Leaflet). Η εφαρμογή εγχύει αυτόματα το `22450-mapbox-addon-inject.js` για Mapbox χάρτες.

---

## Επιλογή 1: Χρήση 22450-map-addon.js (για υπάρχοντα χάρτη)

Αν η αρχική έχει ήδη Leaflet χάρτη με **άλλο** script:

1. Φορτώστε το addon **ΜΕΤΑ** το Leaflet και **ΠΡΙΝ** το script που δημιουργεί τον χάρτη:
   ```html
   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
   <script src="/path/to/22450-map-addon.js"></script>
   <!-- εδώ το script της αρχικής που δημιουργεί τον χάρτη -->
   ```

2. Ή αν ο χάρτης δημιουργείται **πριν** το addon, καλέστε χειροκίνητα:
   ```javascript
   // Αφού δημιουργηθεί ο χάρτης, π.χ.:
   var map = L.map('home-map').setView([35.5, 27.2], 12);
   // ... άλλοι markers κλπ ...
   
   if (window.enhanceLeafletMapWith22450) {
     window.enhanceLeafletMapWith22450(map);
   }
   ```

---

## Επιλογή 2: Αντικατάσταση με 22450-map-user-location.js

Αν θέλετε να χρησιμοποιείτε το **ίδιο** script με τις σελίδες επιχειρήσεων:

1. Αφαιρέστε το παλιό map script της αρχικής.
2. Προσθέστε:
   ```html
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
   <div id="map" style="height:400px;width:100%"></div>
   <script src="/path/to/22450-map-user-location.js"></script>
   ```
3. Το script θα εντοπίσει αυτόματα το `#map`, `#home-map`, κλπ.

---

## Επιλογή 3: Έλεγχος IDs/classes

Βεβαιωθείτε ότι το div του χάρτη έχει ένα από:
- `id="map"` ή `id="home-map"` ή `id="main-map"`
- `class="user-location-map"` ή `class="home-map"`
- `data-22450-map` (attribute)

Αν χρησιμοποιεί κάτι άλλο (π.χ. `id="front-map"`), προσθέστε:
```html
<div id="front-map" data-22450-map style="...">
```

---

## Mapbox (κεντρική σελίδα)

Η κεντρική χρησιμοποιεί **Mapbox GL JS**. Η εφαρμογή (Capacitor) εγχύει αυτόματα το `22450-mapbox-addon-inject.js` που προσθέτει το κουμπί GPS και την επαναφορά στη Βώρα. Δεν απαιτείται τίποτα από τον server.

---

## Τι να ανεβάσετε στον server

Αντιγράψτε στο site:
- `22450-map-user-location.js` – για νέους Leaflet χάρτες
- `22450-map-addon.js` – για ενίσχυση υπαρχόντων Leaflet χαρτών

Και διορθώστε τα paths στα `<script src="...">` ανάλογα με τη δομή του site.
