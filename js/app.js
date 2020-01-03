//Extend L.GeoJSON -- add setOptions method
L.GeoJSON = L.GeoJSON.extend({
    setOptions: function(opts) {
        //save original json data
        this._data = this._data || this.toGeoJSON();
        //destory layer group
        this.clearLayers();
        L.setOptions(this, opts);
        //recreate layer group
        this.addData(this._data);
    },
    //return polygon layers that contain the given point
    identify: function(latlng) {
        var geopoint = {
                type: 'Point',
                coordinates: [latlng.lng, latlng.lat]
            },
            features = new L.FeatureGroup();
        this.eachLayer(function(layer) {
            if (gju.pointInPolygon(geopoint, layer.feature.geometry)) {
                features.addLayer(layer);
            }
        });
        return features;
    }
});

function legendraw(element) {
    $("#Reduce").modal("show");
}

function legendraw2(element) {
    $("#Increase").modal("show");
}

function legendraw3(element) {
    $("#Rebuild").modal("show");
}

function legendraw4(element) {
    $("#Crash").modal("show");
}

function legendraw5(element) {
    $("#Secure").modal("show");
}

function legendraw6(element) {
    $("#Support").modal("show");
}
var map;
var mapLayers = [], identifyLayers = [];
var cmp_PNT;
var tg = 0;
var layer_ids = [];
var resetData = true;
var resetInfo = true;

//OPEN ABOUT DIALOG
// $('#aboutModal').modal();
//   $('#slidercase').appendTo('#map');

$(window).resize(function() {
    $('.tt-dropdown-menu').css('max-height', $('#container').height() - $('.navbar').height() - 20);
});

// Toggle individual corridor layers
$('input:checkbox[name="overlayLayers"]').on('change', function() {
    var layers = [];
    $('input:checkbox[name="overlayLayers"]').each(function() {
        // Remove all overlay layers
        hideLayer($(this).attr('id'));
        $('#infosidebar').html('');
        if ($('#' + $(this).attr('id')).is(':checked')) {
            // Add checked layers to array for sorting
            showLayer($(this).attr('id'));
            layers.push($(this).attr('id'));
        }
    });
    identifyLayers = layers;
});

//Document Ready
$(document).ready(function() {
    //layer group check all functionality
    $('input.checked_all').on('change', function() {
        //var listPanel = $(this)
        var $element = $(this);
        if ($element.prop('checked') == true) {
            $element.siblings('.checkbox').find('input').prop('checked', true).change();
        } else {
            $element.siblings('.checkbox').find('input').prop('checked', false).change();
        }
    });

 //   $("#PMBtn").click(function() {
 //       $('#PMModal').modal('show');
 //   });

});

$('#PMModal').on('hide.bs.modal', function() {
    // $(this).data('modal', null);
    $('#PMModal').remove();
})

//Populate new Layer groups
function onEachFeature(feature, featureLayer) {
    //does layerGroup already exist? if not create it and add to map
    var lg = mapLayers[feature.properties.WEB_ID];
    if (lg === undefined) {
        lg = new L.layerGroup();
        //add the layer to the map
        lg.addTo(map);
        //store layer
        mapLayers[feature.properties.WEB_ID] = lg;
    }
    featureLayer.on({
        click: CMPID,
        mouseover: hover,
        mouseout: resetHighlight,
        dblclick: zoomToFeature
    });
    featureLayer.bindTooltip(feature.properties.NAME + ' (' + feature.properties.GIS_ID + ')', {
        sticky: false,
        className: "popup",
        direction: 'auto'
    });
    //add the feature to the layer
    lg.addLayer(featureLayer);
    identifyLayers.push(feature.properties.WEB_ID);
}
/*
 * show/hide layerGroup   
 */
function showLayer(id) {
    var lg = mapLayers[id];
    map.addLayer(lg);
}

function hideLayer(id) {
    var lg = mapLayers[id];
    map.removeLayer(lg);
}

function activateTooltip() {
    $("[data-toggle=infotooltip]").tooltip({
        placement: 'left'
    });
}

var map;
map = L.map("map", {
    minZoom: 9,
    zoomControl: true,
});

// Basemap Layers

var Mapbox_dark = L.tileLayer.provider('MapBox.crvanpollard.hghkafl4')
//     var Mapbox_dark = L.tileLayer(mapboxUrl, {id: 'MapBox.crvanpollard.hghkafl4', attribution: mapboxAttribution});

var Mapbox_Imagery = L.tileLayer(
    'https://api.mapbox.com/styles/v1/crvanpollard/cimpi6q3l00geahm71yhzxjek/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiY3J2YW5wb2xsYXJkIiwiYSI6Ii00ZklVS28ifQ.Ht4KwAM3ZUjo1dT2Erskgg', {
        tileSize: 512,
        zoomOffset: -1,
        attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
});

// set view to leeds, and add layer. method chaining, yumm.
map.addLayer(CartoDB_Positron);

// Overlay Layers
var tile_group = L.layerGroup().addTo(map);
//   tile_group.addLayer(cmp_PNT);
//   checkIfLoaded(); 


$('input[type=radio][name=optradio]').on('change', function() {
    var layer_ids = $(this).attr('data-value').split(',');
    var layers = $(this).attr('data-value');
    cmp_PNT = L.esri.dynamicMapLayer ({
        url: 'https://arcgis.dvrpc.org/arcgis/rest/services/AppData/CMP_Performance/MapServer',
        layers: [layer_ids[0], layer_ids[1]]
    })
    //add new tiles to overlay group
    tile_group.clearLayers().addLayer(cmp_PNT);
    checkIfLoaded();
    layers_pm_id = 'top:'+layers;

});

function checkIfLoaded() {
    $('.loading-panel').fadeIn();
    cmp_PNT.on("load", function() {
        $('.loading-panel').fadeOut();
    });
}

var identifiedFeature;
var pane = document.getElementById('selectedFeatures');
var cmp_PNT_ID = L.esri.dynamicMapLayer ({
    url: 'https://arcgis.dvrpc.org/arcgis/rest/services/AppData/CMP_Performance/MapServer'
});

var layers_pm_id = ('top:98,99');

map.on('click', function(e) {
    //    pane.innerHTML = 'oading';
    (resetData)? $('#infosidebar').html('') : resetData = true;
    (resetInfo)? $('#cmp_info').hide() : resetInfo = true;
    if (identifiedFeature) {
        map.removeLayer(identifiedFeature);
    }
    cmp_PNT_ID.identify()
        .on(map)
        .at(e.latlng)
        .layers(layers_pm_id)
        .run(function(error, featureCollection) {
            if (featureCollection.features.length > 0) {
                identifiedFeature = L.geoJson(featureCollection.features[0]).addTo(map);
                var props = featureCollection.features[0].properties;
                var content = '<div id="pm_info"><h3 style="background-color:#E0E0E0"><i class="glyphicon glyphicon-stats"></i>&nbsp; Performance Measures</h3>The scores below are for the selected roadway segments<br>' +
                    'Functional Classification: <b>' + (props['Functional Classification']) + '</b>' +
                    '<br>AADT: <b>' + numeral(props.AADT).format('0,0') + '</b>' +
                    '<br>Lanes: <b>' + (props.Lanes) + '</b></div>' +
                    '<a href="https://maps.google.com/maps?q=&layer=c&cbll=' + e.latlng.lat + ', ' + e.latlng.lng +'&cbp=" target="_new">Launch Google Streetview near this location</a>'+
                    '<table id="crashtable">' +
                    '<tbody>' +
                    '<tr class="odd">' +
                    '<th>Travel Time Index (TTI)</th><td>' + (props.TTI) + '</td>' +
                    '<tr class="even">' +
                    '<th>Peak-Hour Volume/Capacity (V/C) Ratios</th><td>' + (props.VC_Score) + '</td>' +
                    '<tr class="odd">' +
                    '<th>Anticipated Growth in V/C</th><td>' + (props.VC_Growth) + '</td>' +
                    '<tr class="even">' +
                    '<th>Transit Score and Rail Stations</th><td>' + (props['Transit Score']) + '</td>' +
                    '<tr class="odd">' +
                    '<th>Planning Time Index (PTI)</th><td>' + (props.PTI) + '</td>' +
                    '<tr class="even">' +
                    '<th>Core Transportation Network</th><td>' + (props.NHS) + '</td>' +
                    '<tr class="odd">' +
                    '<th>Existing Transit</th><td>' + (props.Transit) + '</td>' +
                    '<tr class="even">' +
                    '<th>Crash Rate</th><td>' + (props['2 times Crash Rate']) + '</td>' +
                    '<tr class="odd">' +
                    '<th>Transportation Security</th><td>' + (props['Security Score']) + '</td>' +
                    '<tr class="even">' +
                    '<th>Special Evacuation Concern</th><td>' + (props['Security Score']) + '</td>' +
                    '<tr class="odd">' +
                    '<th>Green Infrastructure Screening Tool Score</th><td>' + (props['Environmental Index']) + '</td>' +
                    '<tr class="even">' +
                    '<th>Infill and Redevelopment areas, Emerging Growth areas</th><td>' + (props.Developed) + '</td>' +
                    '<tr class="odd">' +
                    '<th>2040 Land Use Centers</th><td>' + (props['Long Range Plan Score']) + '</td>' +
                    '</tbody>' +
                    '<table>';

                pane.innerHTML = content;;
            } else {
                //  pane.innerHTML = 'No roadway features selected.';
                pane.innerHTML = '';
            }
        });
});
// Static 2015 CMP subcorridor layer
var CMP = L.geoJson(null, {
    style: function(feature) {
        switch (feature.properties.WEB_ID) {
            case 'NJ1':
                return {
                    fillColor: "#82D4F2",
                    fill: true,
                    color: '#0E50A3',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ2':
                return {
                    fillColor: "#37C2F1",
                    fill: true,
                    color: '#3B62AE',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ3':
                return {
                    fillColor: "#B57DB6",
                    fill: true,
                    color: '#4C266F',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ4':
                return {
                    fillColor: "#92D3C8",
                    fill: true,
                    color: '#00A884',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ5':
                return {
                    fillColor: "#D7C19E",
                    fill: true,
                    color: '#895A45',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ6':
                return {
                    fillColor: "#F9BDBF",
                    fill: true,
                    color: '#E41E26',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ7':
                return {
                    fillColor: "#8BC867",
                    fill: true,
                    color: '#2A7439',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ8':
                return {
                    fillColor: "#FEEAAE",
                    fill: true,
                    color: '#898944',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ9':
                return {
                    fillColor: "#D7B09E",
                    fill: true,
                    color: '#724E1F',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ10':
                return {
                    fillColor: "#FFD380",
                    fill: true,
                    color: '#A73B23',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ11':
                return {
                    fillColor: "#92D3C8",
                    fill: true,
                    color: '#00734D',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ12':
                return {
                    fillColor: "#F4C0D9",
                    fill: true,
                    color: '#D33694',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ13':
                return {
                    fillColor: "#DABEDB",
                    fill: true,
                    color: '#7E3092',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'NJ14':
                return {
                    fillColor: "#F5CA7A",
                    fill: true,
                    color: '#894445',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
             case 'NJ15':
            return {
                fillColor: "#D3FFBE",
                fill: true,
                color: '#55FF00',
                weight: 1.5,
                opacity: 1,
                fillOpacity: 0.65,
                clickable: true
            }; case 'NJ16':
            return {
                fillColor: "#00E6A9",
                fill: true,
                color: '#00A884',
                weight: 1.5,
                opacity: 1,
                fillOpacity: 0.65,
                clickable: true
            }; case 'NJ17':
            return {
                fillColor: "#FFFF00",
                fill: true,
                color: '#737300',
                weight: 1.5,
                opacity: 1,
                fillOpacity: 0.65,
                clickable: true
            };
            case 'PA1':
                return {
                    fillColor: "#92D3C8",
                    fill: true,
                    color: '#00A884',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA2':
                return {
                    fillColor: "#F37D80",
                    fill: true,
                    color: '#E41E26',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA3':
                return {
                    fillColor: "#FBF7C0",
                    fill: true,
                    color: '#A6A836',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA4':
                return {
                    fillColor: "#F9BDBF",
                    fill: true,
                    color: '#F37D80',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA5':
                return {
                    fillColor: "#FFD380",
                    fill: true,
                    color: '#A7722A',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA6':
                return {
                    fillColor: "#C7E6DC",
                    fill: true,
                    color: '#00A884',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA7':
                return {
                    fillColor: "#D7C19E",
                    fill: true,
                    color: '#897045',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA8':
                return {
                    fillColor: "#82D4F2",
                    fill: true,
                    color: '#37C2F1',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA9':
                return {
                    fillColor: "#DABEDB",
                    fill: true,
                    color: '#9351A0',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA10':
                return {
                    fillColor: "#B57DB6",
                    fill: true,
                    color: '#4C266F',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA11':
                return {
                    fillColor: "#FAF078",
                    fill: true,
                    color: '#727430',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA12':
                return {
                    fillColor: "#DB7DB3",
                    fill: true,
                    color: '#D33694',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA13':
                return {
                    fillColor: "#D7D79E",
                    fill: true,
                    color: '#895A45',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA14':
                return {
                    fillColor: "#80AEDD",
                    fill: true,
                    color: '#0E50A3',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA15':
                return {
                    fillColor: "#9DCB3B",
                    fill: true,
                    color: '#00734D',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA16':
                return {
                    fillColor: "#FFEBBE",
                    fill: true,
                    color: '#F6881F',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
            case 'PA17':
                return {
                    fillColor: "#39BF7C",
                    fill: true,
                    color: '#38A800',
                    weight: 1.5,
                    opacity: 1,
                    fillOpacity: 0.65,
                    clickable: true
                };
        }
    },
    onEachFeature: onEachFeature
});
$.getJSON("data/CMPMASTER.js", function(data) {
    CMP.addData(data);
});

var DVRPC = L.geoJson(null, {
    style: {
        stroke: true,
        fillColor: 'none',
        color: '#282828',
        weight: 3,
        fill: true,
        opacity: 1,
        fillOpacity: 0.70,
        clickable: false
    },
    onEachFeature: function(feature, layer) {}
});
$.getJSON("data/CountyDVRPC.js", function(data) {
    DVRPC.addData(data);
}).complete(function() {
    map.fitBounds(DVRPC.getBounds());
});

(CMP).addTo(map);
(DVRPC).addTo(map);

var baseLayers = {
    "Streets (Dark)": Mapbox_dark,
    "Streets (Grey)": CartoDB_Positron,
    "Satellite": Mapbox_Imagery
};

var layerControl = L.control.layers(baseLayers).addTo(map);

var viewCenter = new L.Control.ViewCenter();
map.addControl(viewCenter);

var scaleControl = L.control.scale({
    position: 'bottomright'
});

var searchControl = new L.esri.Controls.Geosearch().addTo(map);

// create an empty layer group to store the results and add it to the map
var results = new L.LayerGroup().addTo(map);

// listen for the results event and add every result to the map
searchControl.on("results", function(data) {
    results.clearLayers();
    for (var i = data.results.length - 1; i >= 0; i--) {
        results.addLayer(L.circleMarker(data.results[i].latlng));
    }
});

//Action on feature selections////////////
function zoomToPoint(e) {
    var layer = e.target;
    var latLng = layer.getLatLng();
    map.setView(latLng, 15);
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function createView(layer) {
    var props = layer.feature.properties;
    var info = '<h4 style="color:white;background-color:' + (props.BANCOLOR) + '"><div class="label"><img class="shield" src="' + (props.SHIELD) + ' ">' + (props.NAME) + '</div></h4>' + "<div class='labelfield'><b>Subcorridor ID/Name: </b>" + (props.CMP_ID) + (props.SUB_ID) + " - " + (props.SUBNAME) + "<br>" + "<div class='labelfield'><b>Priority Subcorridor: </b>" + (props.PRIORITY) + "</div>";

    var content = '<img style="margin:0px 0px 5px 0px" src="https://www.dvrpc.org/asp/TIPsearch/2015/PA/img/document.png"/>&nbsp; - <a class="one" href="' + (props.REPORT) + '" target="_blank"> ' + "View Subcorridor Information" + "</a><br>" +
        //  +'<a href="#" class="one" onclick="map.setView(new L.LatLng( ' + (props.LAT)+ ' , ' + (props.LONG) + ' ),12);">'
        //    +'Zoom to' + '</a>'
        '<a href="#" id="zoomToBtn" class="btn btn-primary" onclick="map.setView(new L.LatLng( ' + (props.LAT) + ' , ' + (props.LONG) + ' ),12); return false;">Zoom To Subcorridor</a>' + "</div>" + "<br></br>";

    $('#infosidebar').append(info);
    $('#infosidebar').append(content);
    $('#myTab a[href="#Results"]').tab('show');
    length++;
}

function CMPID(e) {
  //  console.log(e.target.feature.properties);
  //  if (e.target.feature.properties.Shape_Leng < 0) {
  //  alert("You clicked the map at " + e.latlng);
  //  }
    resetData = false
    resetInfo = false
    $('#click_help').hide();
    $('#cmp_info').show();
    $('#infosidebar').html('');
    var layers = CMP.identify(e.latlng);

    layers.eachLayer(function(f) {
        if (identifyLayers.indexOf(f.feature.properties.WEB_ID) > -1) {
            createView(f);
        }
    });
}


//function onMapClick(e) {
  //  alert("You clicked the map at " + e.latlng);
 //   alert("<a href='http://maps.googleapis.com/maps/api/streetview?size=300x190&location=" + e.latlng.lat + ", " + e.latlng.lng +"&sensor=false&fov=110' target='_new'>Get Streetview</a>");
//}
// http://maps.google.com/maps?q=&layer=c&cbll=31.33519,-89.28720

// <a href="javascript:void(0)" onclick="getSTV('+ (props.LATITUDE) +','+ (props.LONGITUDE) +','+ (props.HEADING) +')">  Get Streetview</a><br>'

//map.on('click', function(e) { 
//    if (map.hasLayer(CMP)) {
      //  alert("You clicked the map at " + e.latlng);
//    }
//    else {
//alert("You clicked the map at " + e.latlng); 
//    }

//})

 // map.on('click', onMapClick);

//Opacity slide -- preventing map dragging/panning
$('#slide').on('mouseover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    map.dragging.disable();
});

$('#slide').on('mouseout', function() {
    map.dragging.enable();
});

$('#slide').slider({
    reversed: false
}).on('slide', function(e) {
    e.preventDefault();
    e.stopPropagation();
    map.dragging.disable();
    var sliderVal = e.value;
    CMP.setStyle({
        fillOpacity: sliderVal / 100
    });
});

$('#slide').slider({
    reversed: false
}).on('slideStop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    map.dragging.enable();
});

function hover(e) {
    var layer = e.target;
    var props = layer.feature.properties;
    layer.setStyle({
        weight: 3
        //   color: 'red'
        //   opacity:1
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
};

function resetHighlight(e) {
    var layer = e.target;
    //return layer to back of map
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToBack();
    }
    //  CMP.resetStyle(e.target);
    layer.setStyle({
        weight: 1.5
        //   color: 'red'
        //   opacity:1
    });
}

// Placeholder hack for IE
if (navigator.appName == "Microsoft Internet Explorer") {
    $("input").each(function() {
        if ($(this).val() == "" && $(this).attr("placeholder") != "") {
            $(this).val($(this).attr("placeholder"));
            $(this).focus(function() {
                if ($(this).val() == $(this).attr("placeholder")) $(this).val("");
            });
            $(this).blur(function() {
                if ($(this).val() == "") $(this).val($(this).attr("placeholder"));
            });
        }
    });
}