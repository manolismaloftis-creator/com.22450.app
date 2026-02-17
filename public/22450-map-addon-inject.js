(function(){var attempts=0;var maxAttempts=100;function w(){attempts++;if(typeof L==='undefined'){if(attempts<maxAttempts)setTimeout(w,100);return;}
var S='app22450_userLocation',D=[35.5076,27.2122],Z=14;
function g(){try{var t=localStorage.getItem(S);if(t){var d=JSON.parse(t);if(d&&typeof d.lat==='number'&&typeof d.lng==='number')return{lat:d.lat,lng:d.lng};}}catch(e){}return null;}
function s(lat,lng){try{localStorage.setItem(S,JSON.stringify({lat:lat,lng:lng,updated:Date.now()}));}catch(e){}}
function createIcon(){return L.divIcon({className:'user-location-marker',html:'<div style="width:24px;height:24px;border-radius:50%;background:#2DB8B8;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',iconSize:[24,24],iconAnchor:[12,12]});}
function enhanceMap(map){if(!map||map._22450Enhanced)return;try{map._22450Enhanced=true;
var um=null,ll=L.layerGroup().addTo(map),vb=null,dr={lat:D[0],lng:D[1],zoom:Z};
function show(){var loc=g();if(!loc){if(navigator.geolocation){navigator.geolocation.getCurrentPosition(function(p){var lat=p.coords.latitude,lng=p.coords.longitude;s(lat,lng);go(lat,lng);},function(){},{enableHighAccuracy:false,timeout:8000,maximumAge:300000});}return;}go(loc.lat,loc.lng);}
function go(lat,lng){var ctr=map.getCenter();var aa=Math.abs(ctr.lat-lat)<0.002&&Math.abs(ctr.lng-lng)<0.002;vb=aa?dr:{lat:ctr.lat,lng:ctr.lng,zoom:map.getZoom()};ll.clearLayers();um=L.marker([lat,lng],{icon:createIcon()}).bindPopup('Η τοποθεσία σας').addTo(ll);map.setView([lat,lng],15);}
function hide(){var r=vb||dr;if(r){map.setView([r.lat,r.lng],r.zoom);vb=null;}ll.clearLayers();um=null;}
function toggle(checked){if(checked)show();else hide();}
var cn=map.getContainer(),id='map-addon-'+(cn?(cn.id||'m'):'x')+'-'+Date.now();
var ctrl=L.control({position:'topright'});
ctrl.onAdd=function(){var d=L.DomUtil.create('div','user-location-control');d.style.cssText='background:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.35);font-size:14px;border:2px solid #2DB8B8;cursor:pointer;min-width:120px';d.innerHTML='<div style="font-weight:700;color:#2DB8B8;font-size:16px;margin-bottom:6px;letter-spacing:0.5px">GPS</div><label style="display:flex;align-items:center;gap:8px;cursor:pointer;white-space:nowrap"><input type="checkbox" id="'+id+'" style="width:18px;height:18px;cursor:pointer"> Δείξε την τοποθεσία μου</label>';L.DomEvent.disableClickPropagation(d);d.querySelector('input[type="checkbox"]').addEventListener('change',function(){toggle(this.checked);});return d;};
ctrl.addTo(map);}catch(err){map._22450Enhanced=false;}}
var OrigMap=L.Map;
L.Map=function(container,options){var m=new OrigMap(container,options);setTimeout(function(){enhanceMap(m);},10);return m;};
L.Map.prototype=OrigMap.prototype;
var origLmap=L.map;
if(typeof origLmap==='function'){L.map=function(container,opts){var m=origLmap.call(L,container,opts);setTimeout(function(){enhanceMap(m);},10);return m;};}
function tryExisting(){var els=document.querySelectorAll('.leaflet-container');for(var i=0;i<els.length;i++){var el=els[i];if(el&&!el.querySelector('.user-location-control')){try{for(var k in window){var v=window[k];if(v&&v._container===el&&typeof v.setView==='function'){enhanceMap(v);break;}}}catch(x){}}}}
tryExisting();
setTimeout(tryExisting,500);
setTimeout(tryExisting,1500);
setTimeout(tryExisting,3000);
function setupObserver(){if(typeof MutationObserver==='undefined'||!document.body)return;var obs=new MutationObserver(function(){tryExisting();});obs.observe(document.body,{childList:true,subtree:true});setTimeout(function(){obs.disconnect();},10000);}
if(document.body)setupObserver();else document.addEventListener('DOMContentLoaded',setupObserver);
window.enhanceLeafletMapWith22450=enhanceMap;}
w();})();
