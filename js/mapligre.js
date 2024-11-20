const points = {
    "hdmap" : [37.588814, 55.733820],
    "yasenevo": [37.533276, 55.605607],
    "robocity" : [37.53727, 55.74780], 
    "michigan" : [-83.74477, 42.27948],
    "mlhdmap" :  [37.692404, 55.565649],
    "robomaps" : [37.452103, 55.723719],
    "cicdvv" : [37.3911059, 55.8041166],
    "polyana" : [40.257841, 43.684830]
};

const dataGeojson = 'https://api.npoint.io/2e3a5def17556a363238';

function resizeIframe(obj) {
    obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px';
}

function CopyToClipboard(id, myTooltip) {
    var copyText = document.getElementById(id).innerHTML;
    navigator.clipboard.writeText(copyText);

    var tooltip = document.getElementById(myTooltip);
    tooltip.innerHTML = "Copied";
}

function outFunc(myTooltip) {
    var tooltip = document.getElementById(myTooltip);
    tooltip.innerHTML = "Copy to clipboard";
};

function fetchJSONData(butclass) {
    fetch(dataGeojson)
        .then((res) => {
            if (!res.ok) {
                throw new Error
                    (`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) =>
            data.features.forEach(element => {
                if (element.geometry.type == 'Point' && element.properties.project == butclass){
                    var checkDiv = document.getElementById("modal"+element.properties.project+element.properties.type+element.id);
                    if (checkDiv == null){
                        createModalWimdow(element.properties.title, 
                                        element.id,
                                        element.properties.body, 
                                        element.properties.type, 
                                        element.properties.project,
                                        element.properties.urlContent)
                    }
                }
            })
        )
        .catch((error) =>
            console.error("Unable to fetch data:", error));
};

function createModalWimdow(title, feature_id, body, type, project,urlContent) {
    var id = 'modal'+project+type+feature_id;
        var div = document.createElement("div")
        div.setAttribute('id', id);
        div.setAttribute('uk-modal', '');
        var modaContent = id+'content';
        div.innerHTML = '<div id='+modaContent+' class="uk-modal-dialog uk-modal-body uk-text-default">'
            +'<h2 class="uk-modal-title">'+title+'</h2>'
            +body
            +'<button class="uk-modal-close-default" type="button" uk-close></button></div>'
        var main = document.getElementById("mainModal")
        main.appendChild(div);


        if (type == 'telegram') {
            urlContent.forEach(element => {
                downloadTelegramContent(modaContent,element);
            });
        };
        console.log('Element created');

        //Stop video workaround
        document.getElementById(id).addEventListener('hide', function(event){
            frames = div.getElementsByTagName('iframe');
            if (frames){
                for( var i = 0; i < frames.length; i++ ){
                    var iframeSrc = frames[i].src;
                    frames[i].src = iframeSrc;
                };
            }
        });
};

function downloadTelegramContent(id, id_post){
    //Rerurn <script> with content
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('async', 'true');
    s.setAttribute('src', 'https://telegram.org/js/telegram-widget.js?22');
    s.setAttribute('data-telegram-post', id_post);
    s.onload = function handleScriptLoaded() {
        console.log('telegram post has loaded');
    };
    s.onerror = function handleScriptError() {
        console.log('error loading script');
    };
    var div = document.getElementById(id);
    div.appendChild(s);
    };

var block_show = null;

function scrollTracking(){
    var wt = $(window).scrollTop();
    var wh = $(window).height();
    var et = $('.s-works').offset().top;
    var eh = $('.s-works').outerHeight();

    if (wt + wh >= et && wt + wh - eh * 2 <= et + (wh - eh)){
        if (block_show == false) {
            fetchJSONData("hdmap");
        }
        block_show = true;
    } else {
        block_show = false;
    }
};
$(window).scroll(function(){
    scrollTracking();
});
    
$(document).ready(function(){ 
    scrollTracking();
});

const map = new maplibregl.Map({
    container: 'map', // container ID
    style: {
        'version': 8,
        'sources': {
            'raster-tiles': {
                'type': 'raster',
                'tiles': ['https://core-renderer-tiles.maps.yandex.net/tiles?l=map&projection=web_mercator&theme=dark&x={x}&y={y}&z={z}&scale=1&lang=en_US}'],
                'tileSize': 256
            }
        },
        'layers': [
            {
                'id': 'simple-tiles',
                'type': 'raster',
                'source': 'raster-tiles',
                'minzoom': 0,
                'maxzoom': 22,
                'paint' : {
                    'raster-opacity' : 0.8
                }
            }
        ]
    },
    center: points['hdmap'], // starting position
    zoom: 15// starting zoom
});

let hoveredStateId = null;
const buttons = document.querySelectorAll(".but");
const slidebar = document.getElementById('slidebar');
let active = buttons[0];


for( var i = 0; i < buttons.length; i++ ){
    buttons[i].addEventListener('click', function(){
      if( active == this ){
        this.style.border = '5px solid';
      } else {
        active.style.border = '';
        this.style.border = '5px solid';
        
        active = this;
      }
    });
  }

map.on('load', async() => {
    buttons.forEach(function(button) {
        button.addEventListener("click", function(event) {
            // do something when the button is clicked
            fetchJSONData(event.target.id);
            map.flyTo({
                    zoom: event.target.id == "robomaps" ? 10.5 : 15,
                    center: points[event.target.id]
                });
                if (event.target.id == "robomaps"){
                    slidebar.style.display = 'block';
                    map.addLayer({
                        'id': 'areas',
                        'type': 'fill',
                        'source': 'geo',
                        'paint': {
                            'fill-color': '#cf7ada',
                            'fill-opacity': [
                                    'case',
                                    ['boolean', ['feature-state', 'hover'], false],
                                    1,
                                    0.5
                                ]
                        },
                        'minzoom' : 7,
                        'maxzoom' : 15,
                        'filter': ['==', '$type', 'Polygon']
                    });
                }
                else {
                    slidebar.style.display = 'none';
                    if (map.getLayer('areas')) map.removeLayer('areas');
                }
        }); 
    });
    
    const location = await map.loadImage('https://i.postimg.cc/j5RFjpDy/icons8-96.png');
    map.addImage('location', location.data);

    const youtube = await map.loadImage('https://img.icons8.com/color/48/youtube-play.png');
    map.addImage('youtube', youtube.data);

    const telegram = await map.loadImage('https://img.icons8.com/color/48/telegram-app.png');
    map.addImage('telegram', telegram.data);

    const instagram = await map.loadImage('https://img.icons8.com/fluency/48/instagram-new.png');
    map.addImage('instagram', instagram.data);
    
    const project = await map.loadImage('https://img.icons8.com/color/48/project-management.png');
    map.addImage('project', project.data);

    const newspaper = await map.loadImage('https://img.icons8.com/color/48/newspaper-.png');
    map.addImage('newspaper', newspaper.data);

    map.addSource('geo', {
        'type': 'geojson',
        'data': dataGeojson
    });

    map.addLayer({
        'id': 'lines',
        'type': 'line',
        'source': 'geo',
        'paint': {
            'line-color': '#cf1767',
            'line-width': 1
        },
        'minzoom' : 13,
        'filter': ['==', '$type', 'LineString']
    });

    map.addLayer({
        'id': 'places',
        'type': 'symbol',
        'source': 'geo',
        'layout': {
            'icon-image': ['get', 'type'],
            'icon-size' : 1
        },
        'minzoom' : 13,
        'filter': ['==', '$type', 'Point']
    });

    map.on('click', 'places', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const project = e.features[0].properties.project;
        const type = e.features[0].properties.type;
        const id = e.features[0].id;
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
        UIkit.modal('#modal'+project+type+id).show()
    });

    const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mousemove', 'areas', (e) => {
        if (e.features.length > 0) {
            if (hoveredStateId) {
                map.setFeatureState(
                    {source: 'geo', id: hoveredStateId},
                    {hover: false}
                );
            }
            hoveredStateId = e.features[0].id;
            map.setFeatureState(
                {source: 'geo', id: hoveredStateId},
                {hover: true}
            );
        }
    });

    map.on('click', 'areas', (e) => {
         popup.setLngLat(e.lngLat).setHTML(e.features[0].properties.Name).addTo(map);

    });

    map.on('mouseleave', 'areas', () => {
        if (hoveredStateId) {
            map.setFeatureState(
                {source: 'geo', id: hoveredStateId},
                {hover: false}
            );
        }
        hoveredStateId = null;
        popup.remove();
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', () => {
        map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'areas', () => {
        map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'areas', () => {
        map.getCanvas().style.cursor = '';
    });
 
});