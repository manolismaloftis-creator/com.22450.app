(function(){var attempts=0;function wait(){attempts++;var mb=window.mapboxgl||window.mapbox;
if(!mb||typeof mb.Map!=='function'){if(attempts<80){setTimeout(wait,150);}return;}
var S='app22450_userLocation',D=[27.2122,35.5076],Z=14;
function g(){try{var t=localStorage.getItem(S);if(t){var d=JSON.parse(t);if(d&&typeof d.lat==='number'&&typeof d.lng==='number')return{lat:d.lat,lng:d.lng};}}catch(e){}return null;}
function s(lat,lng){try{localStorage.setItem(S,JSON.stringify({lat:lat,lng:lng,updated:Date.now()}));}catch(e){}}
function enhanceMap(map){if(!map||map._22450Enhanced)return;try{map._22450Enhanced=true;
var vb=null,userMarker=null,dr={lng:D[0],lat:D[1],zoom:Z};
function show(){var loc=g();if(!loc){if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(p){var lat=p.coords.latitude,lng=p.coords.longitude;s(lat,lng);go(lat,lng);},function(){},{enableHighAccuracy:false,timeout:8000,maximumAge:300000});}return;}go(loc.lat,loc.lng);}
function go(lat,lng){var c=map.getCenter();var aa=Math.abs(c.lat-lat)<0.002&&Math.abs(c.lng-lng)<0.002;vb=aa?dr:{lng:c.lng,lat:c.lat,zoom:map.getZoom()};if(userMarker)userMarker.remove();if(mb.Marker)userMarker=new mb.Marker({color:'#2DB8B8'}).setLngLat([lng,lat]).addTo(map);map.flyTo({center:[lng,lat],zoom:15});}
function hide(){if(userMarker){userMarker.remove();userMarker=null;}var r=vb||dr;if(r){map.flyTo({center:[r.lng,r.lat],zoom:r.zoom});vb=null;}}
function toggle(checked){if(checked)show();else hide();}
var id='mapbox-gps-'+Date.now();
var ctrl={onAdd:function(){var d=document.createElement('div');d.className='mapboxgl-ctrl mapboxgl-ctrl-group';d.style.cssText='background:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.35);font-size:14px;border:2px solid #2DB8B8;cursor:pointer;min-width:120px';d.innerHTML='<div style="font-weight:700;color:#2DB8B8;font-size:16px;margin-bottom:6px;letter-spacing:0.5px">GPS</div><label style="display:flex;align-items:center;gap:8px;cursor:pointer;white-space:nowrap"><input type="checkbox" id="'+id+'" style="width:18px;height:18px;cursor:pointer"> Δείξε την τοποθεσία μου</label>';d.querySelector('input').onchange=function(){toggle(this.checked);};return d;},onRemove:function(){}};
map.addControl(ctrl,'top-right');}catch(err){map._22450Enhanced=false;}}
var Orig=mb.Map;
mb.Map=function(opt){var m=new Orig(opt);m.once('load',function(){enhanceMap(m);});if(m.loaded)enhanceMap(m);return m;};
mb.Map.prototype=Orig.prototype;
function findMaps(){try{var names=['map','homeMap','mainMap','mapboxMap','mapMap','_map'];for(var n=0;n<names.length;n++){var v=window[names[n]];if(v&&typeof v.addControl==='function'&&typeof v.getStyle==='function'){enhanceMap(v);}}for(var k in window){var v=window[k];if(v&&typeof v.addControl==='function'&&typeof v.getCenter==='function'&&typeof v.getStyle==='function'){enhanceMap(v);}}}catch(x){}}
for(var i=0;i<16;i++){setTimeout(findMaps,300+i*500);}
window.enhanceMapboxMapWith22450=enhanceMap;}
wait();})();
