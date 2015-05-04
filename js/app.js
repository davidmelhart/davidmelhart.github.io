// VIEWMODEL Start //

function NavigatonViewModel() {
	this.currentFilter = ko.observable("");
	this.currentLocation = ko.observable("");
	this.getData = function() {
		currentFilter = ko.observable($("#filter:input").val());
		currentLocation = ko.observable($("#location:input").val());
	}

};



// VIEWMODEL End //

ko.applyBindings(new NavigatonViewModel());


// MODEL Start //

function initialize() {

  var markers = [];
  var center = new google.maps.LatLng(50, 8);
  var mapOptions = {
			zoom: 5,
			center: center,
			zoomControl: true,
		    zoomControlOptions: {
		        style: google.maps.ZoomControlStyle.LARGE,
		        position: google.maps.ControlPosition.LEFT_BOTTOM
		    },
		    scaleControl: true,
		    streetViewControl: true,
		    streetViewControlOptions: {
		        position: google.maps.ControlPosition.LEFT_BOTTOM
		    },
		    panControl: false,
		    mapTypeControl: false,
			MapTypeId: google.maps.MapTypeId.TERRAIN
		};
	var map = new google.maps.Map(document.getElementById("google-map"), mapOptions);

  	var defaultBounds = new google.maps.LatLngBounds(
      	new google.maps.LatLng(-33.8902, 151.1759),
    	new google.maps.LatLng(-33.8474, 151.2631));
  	map.fitBounds(defaultBounds);
	
	// Setting custom navigation //

	var naviForm = (document.getElementById("navi-form"));
	naviForm.index = 1;
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(naviForm);

 	// Create the search box and link it to the UI element.
  	var locationInput = /** @type {HTMLInputElement} */(
    	document.getElementById("location"));
 	
 	// NOT USED ---> map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  	var searchBox = new google.maps.places.SearchBox(
    /** @type {HTMLInputElement} */(locationInput));

  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item.
  	document.getElementById("submit-btn").addEventListener("click", function(){
    	var places = searchBox.getPlaces();

    	if (places.length == 0) {
      		return;
    	}
    	for (var i = 0, marker; marker = markers[i]; i++) {
      		marker.setMap(null);
    	}

    // For each place, get the icon, place name, and location.
    	markers = [];
    	var bounds = new google.maps.LatLngBounds();
    	for (var i = 0, place; place = places[i]; i++) {
	      	var image = {
		        url: place.icon,
		        size: new google.maps.Size(71, 71),
		        origin: new google.maps.Point(0, 0),
		        anchor: new google.maps.Point(17, 34),
		        scaledSize: new google.maps.Size(25, 25)
	      	};

	      // Create a marker for each place.
	      	var marker = new google.maps.Marker({
		        map: map,
		        icon: image,
		        title: place.name,
		        position: place.geometry.location
	      	});

	      	markers.push(marker);

	      	bounds.extend(place.geometry.location);
    	}

    	map.fitBounds(bounds);
  	});

  // Bias the SearchBox results towards places that are within the bounds of the
  // current map's viewport.
  google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
  });
}

google.maps.event.addDomListener(window, 'load', initialize);



/* function mapRender() {
	var center = new google.maps.LatLng(50, 8);
		var mapOptions = {
			zoom: 5,
			center: center,
			zoomControl: true,
		    zoomControlOptions: {
		        style: google.maps.ZoomControlStyle.LARGE,
		        position: google.maps.ControlPosition.LEFT_BOTTOM
		    },
		    scaleControl: true,
		    streetViewControl: true,
		    streetViewControlOptions: {
		        position: google.maps.ControlPosition.LEFT_BOTTOM
		    },
		    panControl: false,
		    mapTypeControl: false,
			MapTypeId: google.maps.MapTypeId.TERRAIN
		};
		var map = new google.maps.Map(document.getElementById("google-map"), mapOptions);
		
		// Setting custom navigation //

		var naviForm = (document.getElementById("navi-form"));
		naviForm.index = 1;
    	map.controls[google.maps.ControlPosition.TOP_LEFT].push(naviForm);
};

//Initializing the map//

google.maps.event.addDomListener(window, 'load', mapRender);

*/



// MODEL End //
