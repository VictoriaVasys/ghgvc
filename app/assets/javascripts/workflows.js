

function initalize_google_map(lat, lng, zoom){
  var type = $(document).find('.map_type_selector.active').html().toLowerCase();
  console.log('initalize_google_map: '+ type);

  var minZoomLevel = 2;
  var geocoder;
  var address;
  var latlng = new google.maps.LatLng(31,-15);
  var myOptions = {
    zoom: minZoomLevel,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var overlayOptions = {
    opacity: 0.6,
  }

  // Google coordinate plane increases in the positive number direction left to right
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  // setup of globalbiomes map  
  var globalbiomes_bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-92,-179 ), // south-west
    new google.maps.LatLng(84.8,178.7) // north-east
  );
  var globalbiomes = new google.maps.GroundOverlay( 'globalbiomes_overlay.png', globalbiomes_bounds, overlayOptions);
  // setup of vegtype map  
  var vegtype_bounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(-59,-176.8), // south-west
    new google.maps.LatLng(84,179) // north-east
  );
  var vegtype = new google.maps.GroundOverlay( 'vegtype_overlay.png', vegtype_bounds, overlayOptions );
 
  // clear out existing biome matches
  //$('div[id*="_biomes"]').hide();
  $('div[id*="_biomes"]').find('.biomes').html("");
  
  if (type == "vegtype" ){
    vegtype.setMap(map);
  } else if (type == "globalbiomes" ) {
    globalbiomes.setMap(map);
  } else {
    // no map overlay
  }
  
  //overlay = [];
  
  // Bounds for North America
   var strictBounds = new google.maps.LatLngBounds(
     new google.maps.LatLng(-70, -170), // bottom-left
     new google.maps.LatLng(70, 170)   // top-right
   );

   // Listen for the map click events
   google.maps.event.addListener(map, 'dragend', function() {
     if (strictBounds.contains(map.getCenter())) return;

     // We're out of bounds - Move the map back within the bounds
     var c = map.getCenter(),
         x = c.lng(),
         y = c.lat(),
         maxX = strictBounds.getNorthEast().lng(),
         maxY = strictBounds.getNorthEast().lat(),
         minX = strictBounds.getSouthWest().lng(),
         minY = strictBounds.getSouthWest().lat();

     if (x < minX) x = minX;
     if (x > maxX) x = maxX;
     if (y < minY) y = minY;
     if (y > maxY) y = maxY;

     map.setCenter(new google.maps.LatLng(y, x));
   });

   // Limit the zoom level
   google.maps.event.addListener(map, 'zoom_changed', function() {
     if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
   });
  
  google.maps.event.addListener(vegtype, "click", function(event) {
    console.log("google maps addListener triggered");

    //if ( overlay.length > 0 ) { overlay[0].setMap(null); overlay.length = 0; }

    var radius = $('#radius').val();
    var lat = event.latLng.lat();
    var lon = event.latLng.lng();

    var latOffset = radius/(69.1);
    var lonOffset = radius/(53.0);
    
    



    // clear out existing biome matches
    $('#biome_input_container').find('div.well:not(.inactive_site)').find('div[class*="_biomes"]').find('.biome_list').html("");

    // Ajax post to get the biome number
    $.get("get_biome", { lng: Math.round(lon), lat: Math.round(lat) }, function(data) {



      console.log(data["native"]);
      console.log(data["biofuels"]);
      
      // Tag the site w the given lat and lng
      $('div.well:not(.inactive_site)').find('.site_latlng').text("( "+ lat.toFixed(2) + ", " + lon.toFixed(2) + " )");
      
      if (data["native"] != undefined ) {
        $('div.well:not(.inactive_site)').find('.native_biomes').find('.biome_list').append(
          '<label class="checkbox"><input type="checkbox">' + data["native"].name + '</input></label>'
        );
      }
      
      if (data["biofuels"] != undefined &&  data["biofuels"].name.split(",").length == 5 ) { // treat as South East US
        $('div.well:not(.inactive_site)').find('.biofuels_biomes').find('.biome_list').append(
          '<label class="checkbox"><input type="checkbox">' + "corn" + '</input></label>' +
          '<label class="checkbox"><input type="checkbox">' + "mxg" + '</input></label>' +
          '<label class="checkbox"><input type="checkbox">' + "soybean" + '</input></label>' +
          '<label class="checkbox"><input type="checkbox">' + "spring wheat" + '</input></label>' +
          '<label class="checkbox"><input type="checkbox">' + "switchgrass" + '</input></label>'
        );
      }
      
      if (data["biofuels"] != undefined &&  data["biofuels"].name.split(",").length == 2 ) { // treat as Brazil
        $('div.well:not(.inactive_site)').find('.biofuels_biomes').find('.biome_list').append(
          '<label class="checkbox"><input type="checkbox">' + "soybean" + '</input></label>' +
          '<label class="checkbox"><input type="checkbox">' + "sugarcane" + '</input></label>'
        );
      }
      
    });


    console.log("lon: " + lon + " lat: " + lat );
    //console.log("TopLeftCoord:     " + (lat + latOffset) + ", " + (lon + lonOffset) );
    //console.log("BottomRightCoord: " + (lat - latOffset) + ", " + (lon - lonOffset) );

    // 5 points are used to create a square
    // 4 corners and then a 5th point at the
    // exact coords of the first completing the shape
    var paths = [
       new google.maps.LatLng(lat + latOffset, lon + lonOffset), // top right
       new google.maps.LatLng(lat - latOffset, lon + lonOffset), // bottom right
       new google.maps.LatLng(lat - latOffset, lon - lonOffset), // bottom left
       new google.maps.LatLng(lat + latOffset, lon - lonOffset), // top left
       new google.maps.LatLng(lat + latOffset, lon + lonOffset)  // top right
    ];

    // Sends out the square object to google maps to be drawn
    //overlay.push( new google.maps.Polygon({
    //  paths: paths,
    //  strokeColor: "#ff0000",
    //  strokeWeight: 0,
    //  strokeOpacity: 1,
    //  fillColor: "#ff0000",
    //  fillOpacity: 0.2,
    //  clickable: false,
    //  map: map
    //}))

  });
  
}


function open_previous_biome_site(){
  console.log('opening previous site');
  $('#biome_input_container').find('div.well').first().removeClass('inactive_site');
};

$(document).ready(function() {
  initalize_google_map();

  $('#add_additional_biome_site').on('click', function(){
    // All other biome lists
    
    $('#biome_input_container').find('div.well').addClass('inactive_site');

    // Add in new biome site
    $('#biome_input_container').prepend(
      '<div class="well well-small collapsed">' +
      '  <div class="biome_site_header inline-block"><h4>Site Lat/Lng: <span class="site_latlng">( -- , -- )</span></h4></div>' + 
      '  <div class="remove_biome_site btn btn-small btn-danger inline-block pull-right">' + 
      '    <i class="icon-search icon-remove"></i> Remove Site' +
      '  </div>' + '  <br />' + '<hr/>' +
      '  <div class="native_biomes inline-table">' + '    <b>Native:</b>' + '    <div class="biome_list"></div>' + '  </div>' +
      '  <div class="aggrading_biomes inline-table">' + '    <b>Aggrading:</b>' + '    <div class="biome_list"></div>' + '  </div>' +
      '  <div class="agroecosystems_biomes inline-table">' + '    <b>Agroecosystems:</b>' + '    <div class="biome_list"></div>' + '  </div>' +
      '  <div class="biofuels_biomes inline-table">' + '    <b>Biofuels:</b>' + '    <div class="biome_list"></div>' + '  </div>' +
      '</div>'
    ).delegate(".remove_biome_site", "click", function() {
      //$(this).toggleClass("chosen");
      $(this).parent().remove();
      open_previous_biome_site();
    });
  
  });
  // Add inital biome list using above code:
  $('#add_additional_biome_site').trigger('click');

  
  // handles reactivating a site when selected
  $('#biome_input_container').on("click", ".inactive_site" , function(){
    $('#biome_input_container').find('div.well').addClass('inactive_site');
    $(this).removeClass('inactive_site');
  });
  
  
  

  $('.map_type_selector').on('click', function () {
    $(document).find('.map_type_selector').removeClass('active');
    $(this).addClass('active');
    
    // clear out existing biome matches
    $('div[id*="_biomes"]').hide();
    $('div[id*="_biomes"]').find('.biomes').html("");
  
    console.log(map.getZoom());
    console.log("lat: " + map.getCenter().lat() );
    console.log("lng: " + map.getCenter().lng() );
    
    initalize_google_map();
  });
  
});
