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

 // this is the Survey Modal Call
      function surveylaunch(element) {
     //   $("#SurveyModal").modal("show");
        window.open("https://dvrpcgis.maps.arcgis.com/apps/MapSeries/index.html?appid=732efbf95f76489598277df671b5d6b2");
      }
 
var map;
var mapLayers = [], identifyLayers = [];
// var layer_ids = [];
var resetData = true;
var resetInfo = true;
var TTI_PM,LRP_VC_PM,TransScore_PM,RailPoint_PM,PTI_PM,NHSPoint_PM,TranistPoi_PM,HighCrSev_PM,HighCrFreq_PM, TTTI_PM, HvyTran_PM, Limerick_PM, MajBridge_PM, Bridges_PM, Military_PM, HHDen_PM, EmpDen_PM, StadGathr_PM, Env_PM, InfEmerg_PM, PlanCntr_PM, LOTTR_PM, PHED_PM, TTTR_PM;
var pane = document.getElementById('selectedFeatures');
// query the checkbox
var checkboxTTI = document.getElementById("TTI_PM")
var checkboxLRP_VC = document.getElementById("LRP_VC_PM")
var checkboxTransScore = document.getElementById("TransScore_PM")
var checkboxPTI = document.getElementById("PTI_PM")
var checkboxNHSPoint = document.getElementById("NHSPoint_PM")
var checkboxTransitPoi = document.getElementById("TransitPoi_PM")
var checkboxHighCrSev = document.getElementById("HighCrSev_PM")
var checkboxHighCrFreq = document.getElementById("HighCrFreq_PM")
var checkboxTTTI = document.getElementById("TTTI_PM")
var checkboxHvyTran = document.getElementById("HvyTran_PM")
var checkboxHHDen = document.getElementById("HHDen_PM")
var checkboxEnv = document.getElementById("Env_PM")
var checkboxInfEmerg = document.getElementById("InfEmerg_PM")
var checkboxPlanCntr = document.getElementById("PlanCntr_PM")
var checkboxLOTTR = document.getElementById("LOTTR_PM")
var checkboxPHED = document.getElementById("PHED_PM") 
var checkboxTTTR = document.getElementById("TTTR_PM")   
//OPEN ABOUT DIALOG
// $('#aboutModal').modal();
//   $('#slidercase').appendTo('#map');

$(window).resize(function() {
    $('.tt-dropdown-menu').css('max-height', $('#container').height() - $('.navbar').height() - 20);
});

// Toggle individual CMP corridor layers
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

function relocate_home() {
     location.href = "https://dvrpcgis.maps.arcgis.com/apps/MapSeries/index.html?appid=732efbf95f76489598277df671b5d6b2";
}
 //   $("#PMBtn").click(function() {
 //       $('#PMModal').modal('show');
 //   });

});

$('#PMModal').on('hide.bs.modal', function() {
    // $(this).data('modal', null);
    $('#PMModal').remove();
})

function checkIfLoaded() {
    $('.loading-panel').fadeIn();
    cmp_PNT.on("load", function() {
        $('.loading-panel').fadeOut();
    });
}
var map;
map = L.map("map", {
    minZoom: 9,
    zoomControl: true,
});

// Basemap Layers

var Mapbox_dark  = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19
});
var Mapbox_Imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var CartoDB_Positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
});

map.addLayer(CartoDB_Positron);

//CMP methods
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
    });
}

//map.on('zoomend', function() {
//    if (map.getZoom() <12){
 //           map.removeLayer(TTI_PM);
 //   }
//    else {
//            map.addLayer(TTI_PM);
//        }
//});

$('input[type=radio][name=optradio]').on('change', function(){
    
    if(checkboxTTI.checked){
      TTI_PM.addTo(map);
    } else {
      map.removeLayer(TTI_PM);
    }

    if(checkboxLRP_VC.checked){
      LRP_VC_PM.addTo(map);
    } else {
      map.removeLayer(LRP_VC_PM);
    }

    if(checkboxTransScore.checked){
      TransScore_PM.addTo(map);
      RailPoint_PM.addTo(map);
    } else {
      map.removeLayer(TransScore_PM);
      map.removeLayer(RailPoint_PM);
    }

    if(checkboxPTI.checked){
      PTI_PM.addTo(map);
    } else {
      map.removeLayer(PTI_PM);
    }

    if(checkboxNHSPoint.checked){
      NHSPoint_PM.addTo(map);
      FreightPo_PM.addTo(map);
      RailLinePo_PM.addTo(map);
    } else {
      map.removeLayer(NHSPoint_PM);
      map.removeLayer(FreightPo_PM);
      map.removeLayer(RailLinePo_PM);
    }

     if(checkboxTransitPoi.checked){
      TransitPoi_PM.addTo(map);
    } else {
      map.removeLayer(TransitPoi_PM);
    }

     if(checkboxHighCrSev.checked){
      HighCrSev_PM.addTo(map);
    } else {
      map.removeLayer(HighCrSev_PM);
    }

    if(checkboxHighCrFreq.checked){
      HighCrFreq_PM.addTo(map);
    } else {
      map.removeLayer(HighCrFreq_PM);
    }

    if(checkboxTTTI.checked){
      TTTI_PM.addTo(map);
    } else {
      map.removeLayer(TTTI_PM);
    }

     if(checkboxHvyTran.checked){
      HvyTran_PM.addTo(map);
      Limerick_PM.addTo(map);
      MajBridge_PM.addTo(map);
      Bridges_PM.addTo(map);
      Military_PM.addTo(map);
    } else {
      map.removeLayer(HvyTran_PM);
      map.removeLayer(Limerick_PM);
      map.removeLayer(MajBridge_PM);
      map.removeLayer(Bridges_PM);
      map.removeLayer(Military_PM);
    }

    if(checkboxHHDen.checked){
      HHDen_PM.addTo(map);
      EmpDen_PM.addTo(map);
      StadGathr_PM.addTo(map);
    } else {
      map.removeLayer(HHDen_PM);
      map.removeLayer(EmpDen_PM);
      map.removeLayer(StadGathr_PM);
    }

    if(checkboxEnv.checked){
      Env_PM.addTo(map);
    } else {
      map.removeLayer(Env_PM);
    }

    if(checkboxInfEmerg.checked){
      InfEmerg_PM.addTo(map);
    } else {
      map.removeLayer(InfEmerg_PM);
    }

    if(checkboxPlanCntr.checked){
      PlanCntr_PM.addTo(map);
    } else {
      map.removeLayer(PlanCntr_PM);
    }

   if(checkboxLOTTR.checked){
      LOTTR_PM.addTo(map);
    } else {
      map.removeLayer(LOTTR_PM);
    }

  if(checkboxPHED.checked){
      PHED_PM.addTo(map);
    } else {
      map.removeLayer(PHED_PM);
    }

  if(checkboxTTTR.checked){
      TTTR_PM.addTo(map);
    } else {
      map.removeLayer(TTTR_PM);
    }        
  });

  var TTI_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.TTI) {
        case 0.5:
          c = '#f5b041';
          w = 6;
          o = .4;
          break;
        case 1:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

  var LRP_VC_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.LRP_VC) {
        case 0.5:
          c = '#f5b041';
          w = 6;
          o = .4;
          break;
        case 1:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

  var TransScore_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.TransScore) {
        case 1:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

  var RailPoint_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.RailPoint) {
        case 1:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

  var PTI_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.PTI) {
        case 0.5:
          c = '#f5b041';
          w = 6;
          o = .4;
          break;
        case 1:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

  var NHSPoint_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.NHSPoint) {
       case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

  var FreightPo_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.FreightPo) {
        case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

  var RailLinePo_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.RailLinePo) {
       case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

  var TransitPoi_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.TransitPoi) {
        case 0.5:
          c = '#f5b041';
          w = 6;
          o = .4;
          break;
        case 1:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

  var HighCrSev_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.HighCrSev) {
       case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var HighCrFreq_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.HighCrFreq) {
       case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var TTTI_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.TTTI) {
       case 0.5:
          c = '#f5b041';
          w = 6;
          o = .4;
          break;
        case 1:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var HvyTran_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.HvyTran) {
       case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var Limerick_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.Limerick) {
       case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var MajBridge_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.MajBridge) {
       case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var Bridges_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.Bridges) {
       case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var Military_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.Military) {
       case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var HHDen_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.HHDen) {
          case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var EmpDen_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.EmpDen) {
       case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var StadGathr_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.StadGathr) {
      case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var Env_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.Env) {
      case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var InfEmerg_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.InfEmerg) {
      case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

var PlanCntr_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.PlanCntr) {
      case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

  var LOTTR_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.LOTTR) {
        case 0.5:
          c = '#f5b041';
          w = 6;
          o = .4;
          break;
        case 1:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

  var PHED_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.PHED) {
        case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  });

  var TTTR_PM = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/LWtWv6q6BJyKidj8/ArcGIS/rest/services/CMP_CriteriaNetwork/FeatureServer/0',
     style: function (feature) {
      var c, o, w;
      switch (feature.properties.TTTR) {
        case 0.5:
          c = '#cb4335';
          w = 2;
          o = .8;
          break;
        default:
          w = 0;
      }
      return { color: c, opacity: o, weight: w };
    }
  }); 

map.on('click', function (e) {
  (resetData)? $('#infosidebar').html('') : resetData = true;
  (resetInfo)? $('#cmp_info').hide() : resetInfo = true;
   if (map.hasLayer(TTI_PM)) {
    TTI_PM.query()
      .nearby(e.latlng,100)
      .run(function (error, featureCollection, response) {
  if (error) {
  //  console.log(error);
    return;
  }
   //  if (identifyLayers.indexOf(f.feature.properties.WEB_ID) > -1) {
   //         createView(f);
   //     }
    // make sure at least one feature was identified.
      if (featureCollection.features.length > 0) {
      //  identifiedFeature = L.geoJSON(featureCollection.features[0]).addTo(map);
        console.log(featureCollection.features[0].properties);
          var props = featureCollection.features[0].properties;
                var content = '<div id="pm_info"><h3 style="background-color:#E0E0E0"><i class="glyphicon glyphicon-stats"></i>&nbsp; Performance Measures</h3>The scores below are for the selected roadway segments<br>' +
                    '<a href="https://maps.google.com/maps?q=&layer=c&cbll=' + e.latlng.lat + ', ' + e.latlng.lng +'&cbp=" target="_new">Launch Google Streetview near this location</a>'+
                    '<table id="crashtable">' +
                    '<tbody>' +
                    '<tr class="odd">' +
                    '<th>Travel Time Index (TTI)</th><td>' + (props.TTI) + '</td>' +
                    '<tr class="even">' +
                    '<th>Anticipated Growth in V/C</th><td>' + (props.LRP_VC) + '</td>' +
                    '<tr class="odd">' +
                    '<th>Transit Score and Rail Stations</th><td>' + (props.TransScore) + ' & '+(props.RailPoint)+ '</td>' +
                    '<tr class="even">' +
                    '<th>Planning Time Index (PTI)</th><td>' + (props.PTI) + '</td>' +
                    '<tr class="odd">' +
                    '<th>Core Transportation Network</th><td>' + (props.NHSPoint) + '</td>' +
                    '<tr class="even">' +
                    '<th>Existing Transit</th><td>' + (props.TransitPoi ) + '</td>' +
                    '<tr class="odd">' +
                    '<th>High Crash Severity</th><td>' + (props.HighCrSev) + '</td>' +
                    '<tr class="even">' +
                    '<th>High Crash Frequency</th><td>' + (props.HighCrFreq) + '</td>' +
                     '<tr class="odd">' +
                    '<th>Truck Travel Time Index </th><td>' + (props.TTI) + '</td>' +
                    '<tr class="even">' +
                    '<th>Transportation Security</th><td>' + (props.HvyTran) + '</td>' +
                    '<tr class="odd">' +
                    '<th>Areas of Special Evacuation Concern</th><td>' + (props.HHDen) + '</td>' +
                    '<tr class="even">' +
                    '<th>Low Green Infrastructure Screening Score</th><td>' + (props.Env) + '</td>' +
                    '<tr class="odd">' +
                    '<th>Connections 2045 Infill, Redevelopment and Emerging Growth</th><td>' + (props.InfEmerg) + '</td>' +
                    '<tr class="even">' +
                    '<th>Connections 2045 Land Use Centers</th><td>' + (props.PlanCntr) + '</td>' +
                    '<tr class="odd">' +
                    '<th>Level of Travel Time Reliability </th><td>' + (props.LOTTR) + '</td>' +
                    '<tr class="even">' +
                    '<th>Peak Hour Excessive Delay</th><td>' + (props.PHED) + '</td>' +
                    '<tr class="odd">' +
                    '<th>Truck Travel Time Reliability</th><td>' + (props.TTTR) + '</td>' + 
                    '</tbody>' +
                    '<table>';
                pane.innerHTML = content
             //   length++;
      } 
      else {
        pane.innerHTML = 'No features identified.';
      }
    });
}
 else {
// alert("nope"); 
   }
});

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