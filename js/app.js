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

	var mapOptions = {

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
    	new google.maps.LatLng(28.70, -127.50), 
    	new google.maps.LatLng(48.85, -55.90)
	);
	map.fitBounds(defaultBounds);

	// Setting custom navigation //
	var naviForm = (document.getElementById("navi-form"));
	naviForm.index = 1;
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(naviForm);

	// Create the search box and link it to the UI element.
	var locationInput = document.getElementById("location");

	var searchBox = new google.maps.places.SearchBox(locationInput);


	markersArray = [];
	function pinMaker(places){
		// For each place creating a marker //
		var marker = new google.maps.Marker({
			map: map,
			position: new google.maps.LatLng((places[place].geometry.location.A),(places[place].geometry.location.F)),
			title: places[place].name
		});
		markersArray.push(marker);

		// For each place creating an infowindow //
		
		var infoWindow = new google.maps.InfoWindow({
			content: "<b>" + places[place].name + "</b></br>" + places[place].formatted_address
			});
			google.maps.event.addListener(marker, "click", function() {
				infoWindow.open(map, marker);
			});
	}
	// Adding a click event listener to open the info boxes //

	google.maps.event.addListener(searchBox, 'places_changed', function() {
		// Clearing all previous requests //
		clearOverlays();
		
		var bounds = new google.maps.LatLngBounds();
		var places = searchBox.getPlaces();
		console.log(places);
		
	// Calling pinMaker for each place //		
		for (place in places) {
			pinMaker(places);
		// Setting the map to fit into the bounds defined by the marker pins //
		bounds.extend(places[place].geometry.location);
		map.fitBounds(bounds);	
		}

	});
// Following code is snatched from http://stackoverflow.com/questions/1544739/google-maps-api-v3-how-to-remove-all-markers
// It clears all previous pins when called.
	function clearOverlays() {
	  for (var i = 0; i < markersArray.length; i++ ) {
	    markersArray[i].setMap(null);
	  }
	  markersArray.length = 0;
	}

};

google.maps.event.addDomListener(window, 'load', initialize);