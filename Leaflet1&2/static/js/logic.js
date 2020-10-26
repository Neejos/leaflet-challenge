var geourl ="https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Creating map object
var myMap = L.map("map", {
    center: [45.52, -122.67],
    zoom: 5
  });
  
  // Adding  tile layers (the background map images) to our map
  // We use the addTo method to add objects to our map
  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  }).addTo(myMap);

  var GrayScale = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY
})
var Satellite =  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY
}).addTo(myMap)
var Outdoors =  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: API_KEY
})
// Create a baseMaps object
var baseMaps = {
  "Satellite": Satellite,
  "GrayScale": GrayScale,
  "Outdoors": Outdoors
};

// L.control.layers(baseMaps).addTo(myMap);

  // Define a markerSize function that will give each city a different radius based on its population
// function markerSize(magnitude) {
//     return magnitude;
//   }


  d3.json(geourl,function(data){
    console.log(data)
    var quakegeometry=[]
    var quakecoord=[]
    var mag=[]
    var depth =[]
    var locations=[]
    var places=[]
    
    

    for (var i=0;i<data.features.length;i++){
        
        quakegeometry.push(data.features[i].geometry.coordinates)
        mag.push(data.features[i].properties.mag)  
        places.push(data.features[i].properties.place)          
    }

    for (var j=0;j<quakegeometry.length;j++){
        quakecoord.push([quakegeometry[j][1],quakegeometry[j][0]])
        depth.push([quakegeometry[j][2]]) // used to set marker colors
    }
    for (var m=0;m<depth.length;m++){

        var color = "";
    
        if (depth[m] > 90) {
            color = "'#800026'";
        }
        else if (depth[m] > 70 && depth[m]<90 ) {
            color = "#BD0026";
        }
        else if (depth[m] > 50 && depth[m]<70) {
            color = "#E31A1C";
        }
        else if (depth[m] > 30 && depth[m]<50) {
            color = "#FC4E2A";
        } 
        else if (depth[m] > 10 && depth[m]<30) {
            color = "#FEB24C";
        }
        else{
            color = "#FFEDA0"
        }
    
    
    
       locations.push( L.circle(quakecoord[m],{
                fillOpacity: depth[m],
                color: "white",
                fillColor: color,
                stroke : false,
      // Setting our circle's radius equal to the output of the magnitide
      // This will make our marker's size proportionate to its magnitude 
                radius: mag[m]*10000
        }))
   
    }
    //plate tectonics
    //Link to perform a call to the github repo to get tectonic plate boundaries
    var plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

    //access data and create layer
    d3.json(plates_url, function(response) {
      //create geoJSON layer and add to map
      var geoPlates = L.geoJSON(response, {
        style: {
            color: "orange",
            weight: 2,
            opacity: .005
        }
      });
      console.log(geoPlates)
      var earthquake=L.layerGroup(locations)
      var tectonic_plates=L.layerGroup(geoPlates)
      var overlaymaps={
        "Earthquake":earthquake,
        "Tectonic Plates": tectonic_plates
      }
    
      // Create a new marker cluster group
      var markers = L.markerClusterGroup();
     // Loop through the quakecoord array and create one marker for each earthquake co-ord object and bind labels tot the markers
      for (var l=0;l<quakecoord.length;l++){
        
        markers.addLayer(L.marker(quakecoord[l]).bindPopup("<h1>" + places[l] + "</h1>"));
      }  
    
    // Pass our map layers into our layer control
    // Add the layer control to the map
    L.control.layers(baseMaps,overlaymaps,{
      collapsed:false
    }).addTo(myMap);
    myMap.addLayer(markers)
    })
  })

  function getColor(d) {
  return d === '90' ? '#800026' :
         d === '70-90'  ? '#BD0026' :
         d === '50-70'  ? '#E31A1C' :
         d === '30-50' ? '#FC4E2A' :
      //    d > 10  ? '#FD8D3C' :
         d === '10-30'   ? '#FEB24C' :
      //    d > 10   ? '#FED976' :
                    '#FFEDA0';
  }




//plate tectonics
//Link to perform a call to the github repo to get tectonic plate boundaries
// var plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

//access data and create layer
// d3.json(plates_url, function(response) {
//     //create geoJSON layer and add to map
//     geoPlates = L.geoJSON(response, {
//         style: {
//             color: "orange",
//             weight: 2,
//             opacity: 1
//         }
//     }).addTo(myMap);

//     //add as an overlay map
//     controlLayers.addOverlay(geoPlates, "Tectonic Plates");
// });


var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
var div = L.DomUtil.create('div', 'info legend');
labels = ['<strong>Depths</strong>'],
categories = ['90','70-90','50-70','30-50','10-30','0-10'];
for (var i = 0; i < categories.length; i++) {
    div.innerHTML += 
    labels.push(
        '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' +
    (categories[i] ? categories[i] : '+'));
}
div.innerHTML = labels.join('<br>');
return div;
};
legend.addTo(myMap);


// https://gis.stackexchange.com/questions/133630/adding-leaflet-legend
// https://leafletjs.com/examples/choropleth/