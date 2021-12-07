window.alert("Refresh the page if map markers do not show up! Press OK.");
var bigpopup = new mapboxgl.Popup({
  className: "clickbox"
});

function toggleSidebar(id) {
  var elem = document.getElementById(id);
  var classes = elem.className.split(" ");
  var collapsed = classes.indexOf("collapsed") !== -1;

  var padding = {};

  if (collapsed) {
    // Remove the 'collapsed' class from the class list of the element, this sets it back to the expanded state.
    classes.splice(classes.indexOf("collapsed"), 1);
    bigpopup.remove();
    padding[id] = 550; // In px, matches the width of the sidebars set in .sidebar CSS class
    map.easeTo({
      padding: padding,
      duration: 1000 // In ms, CSS transition duration property for the sidebar matches this value
    });
  } else {
    padding[id] = 0;
    // Add the 'collapsed' class to the class list of the element
    classes.push("collapsed");

    map.easeTo({
      padding: padding,
      duration: 1000
    });
  }

  // Update the class list on the element
  elem.className = classes.join(" ");
}

function collapseSidebar(id) {
  var elem = document.getElementById(id);
  var classes = elem.className.split(" ");
  var collapsed = classes.indexOf("collapsed") !== -1;

  var padding = {};

  if (!collapsed) {
    padding[id] = 0;
    // Add the 'collapsed' class to the class list of the element
    classes.push("collapsed");

    map.easeTo({
      padding: padding,
      duration: 1000
    });
  }
  elem.className = classes.join(" ");
}

function changeLearnMore(id, text) {
  var elem = document.getElementById(id);
  elem.innerHTML = text;
}

function myFunction() {
  var x = document.getElementById("myDIV");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}
var transformRequest = (url, resourceType) => {
  var isMapboxRequest =
    url.slice(8, 22) === "api.mapbox.com" ||
    url.slice(10, 26) === "tiles.mapbox.com";
  return {
    url: isMapboxRequest ? url.replace("?", "?pluginName=sheetMapper&") : url
  };
};

mapboxgl.accessToken =
  "pk.eyJ1IjoianVhbnJjYXN0YW5lZGEiLCJhIjoiY2t3OXoweDNnMWtpdTJxbzh5dzh6ZnVtMSJ9.IycGC3Ibxv5QLMuiVnXyDg"; //Mapbox token

var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/juanrcastaneda/ckw9z2eg12hav14p6phf7ae4d", // choose a style: https://docs.mapbox.com/api/maps/#styles
  center: [-122.411, 37.785], // starting position [lng, lat]
  zoom: -1, // starting zoom
  transformRequest: transformRequest
});

window.googleDocCallback = function () { return true; };

$(document).ready(function() {
  $.ajax({
    type: "GET",
    url:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYRQ1z5J8iKFrIgnmCNMv5Q8oJj_68a4W9YRqhrT0Ghh_eSgQnvl0Vi_hEdDQyQ9uoH4ZNZEI7Yeft/pub?gid=510825251&single=true&output=csv",
    dataType: "text",
    success: function(csvData) {
      console.log('success');
      makeGeoJSON(csvData);
    }
  });

function makeGeoJSON(csvData) {
  csv2geojson.csv2geojson(
    csvData,
    {
      latfield: "Latitude",
      lonfield: "Longitude",
      delimiter: ","
    },
    function(err, data) {
      map.on("load", function() {
        //Add the the layer to the map
        map.addLayer({
          id: "csvData",
          type: "circle",
          source: {
            type: "geojson",
            data: data
          },
          paint: {
            "circle-radius": 8,
            "circle-color": "#000000",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#FFFFFF"
          }
        });


// When a click event occurs on a feature in the csvData layer, open a popup at the
// location of the feature, with description HTML from its properties.
map.on("click", "csvData", function(e) {
  collapseSidebar("right");
  var coordinates = e.features[0].geometry.coordinates.slice();
  moreText =
    `<img id="sidebar-img" src="` + e.features[0].properties.Img + `">` +
    `<div>` + `<h3>` + e.features[0].properties.Location + `</h3>` + `</div>` + 
    `<h5>` + e.features[0].properties.Ambassador + `</h5>` +
    `<h7>` + e.features[0].properties.Description + `</h7>`;
  
  // var popupCoord = [0,0];
  // Ensure that if the map is zoomed out such that multiple
  // copies of the feature are visible, the popup appears
  // over the copy being pointed to.
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  // set popup text
  // You can adjust the values of the popup to match the headers of your CSV.
  // For example: e.features[0].properties.Name is retrieving information from the field Name in the original CSV.
  var description =
    `<div class="row">` + 
    `<div class="column">` + `<h3>` + e.features[0].properties.Ambassador + `</h3>` + `</div>` + 
    `<div class="column">` + `<h5>` + e.features[0].properties.Location + `</h5>` + `</div>` +
    `</div>` +
    `<div class="row">` +
    `<div class="column"> <img id="popup-img" src="` + e.features[0].properties.Img + `">` + `</div>` +
    `<div class="column">` + `<h4>` + e.features[0].properties.Description  + `</h4>` +
    `<div>` + `<a href="https://thegivingblock.com/donate/Womens-Entrepreneurship-Day-Organization-Celebration/" target="_blank">` +  `<button>Support Our Cause</button>` + `</a>` + `</div>`  +
    `</div>` +
    `</div>`;
  // added quote underneath image to test how it would look -sel
  
  //put the big popup on the map
  bigpopup
    .setLngLat(coordinates)
    .addTo(map)
    .setHTML(description);

  //remove hover popup
  popup.remove();
});

/*
HOVER STATE
*/
        
var popup = new mapboxgl.Popup({
  className: "hoverbox",
  closeButton: false,
  closeOnClick: false
});

map.on("mouseenter", "csvData", function(e) {
  // Change the cursor to a pointer when the mouse is over the places layer.
  map.getCanvas().style.cursor = "pointer";
  var coordinates = e.features[0].geometry.coordinates.slice();
  var hoverDescription =
    "<p1>" + e.features[0].properties.Ambassador + " | "+ e.features[0].properties.Location + "</p1>"; //+ '<p1>' + e.features[0].properties.Country + '</p1>';
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  popup
    .setLngLat(coordinates)
    .setHTML(hoverDescription)
    .addTo(map);
});

// Change it back to normal when it leaves.
map.on("mouseleave", "csvData", function() {
  map.getCanvas().style.cursor = "";
  popup.remove();
});

var bbox = turf.bbox(data);
map.fitBounds(bbox, { padding: 50 });
});
      }
    );
  }
});
