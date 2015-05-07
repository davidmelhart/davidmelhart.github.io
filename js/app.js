// VIEWMODEL Start //

// Viewmodel for the navigation //
function navViewModel ()) {
	var self= this;

	// Somehow knockout didn't want to get the full value of the google search box, only the typed in characters. This is an improvised workaround. //
	currentLocation : function(){
		var location = $("#location:input").val();
		return location;
	}
	self.currentFilter = ko.observable();
	self.placesList = ko.observableArray([]);
	self.people = ko.observableArray([
            { name: 'Rod', age: 123 },
            { name: 'Jane', age: 125 },
        ]);
}

ko.applyBindings(new navViewModel());

// Creating the map and its functionalities //
var markersArray = [];
function mapRender() {

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
	
	// Setting custom list-view rendering //
	var listOfPlaces = (document.getElementById("places-list"));
	listOfPlaces.index = 2;
	map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(listOfPlaces);

	// Setting custom navigation //
	var naviForm = (document.getElementById("navigation"));
	naviForm.index = 1;
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(naviForm);

	// Create the search box and link it to the UI element.
	var locationInput = document.getElementById("location");

	var searchBox = new google.maps.places.SearchBox(locationInput);

	function pinMaker(places){
		// For each place creating a marker //
		console.log("X:" + (places[place].location.coordinate.latitude) + " Y:" + (places[place].location.coordinate.longitude));

		var marker = new google.maps.Marker({
			map: map,
			position: new google.maps.LatLng((places[place].location.coordinate.latitude),(places[place].location.coordinate.longitude)),
			title: places[place].name
		});
		markersArray.push(marker);

		// For each place creating an infowindow //
		var infoWindow = new google.maps.InfoWindow({
			content: "<b>" + places[place].name + "</b></br>" + "<img src=" + places[place].image_url + "></br>" + places[place].location.display_address[0] + ", " + places[place].location.display_address[2]
			});
		// Adding a click event listener to open the info boxes //
			google.maps.event.addListener(marker, "click", function() {
				infoWindow.open(map, marker);
			});
	}

	document.getElementById("nav-btn").addEventListener("click", function() {
		// Clearing all previous requests //
		clearOverlays();
		yelpRequest();
		// Giving time for the yelp request to arrive //
		setTimeout(function(){
			var bounds = new google.maps.LatLngBounds();
			var places = placesArray()[0];
			console.log(places);
			console.log(places[0])
		// Calling pinMaker for each place //		
			for (place in placesArray()[0]) {
				pinMaker(places);
				placesList().push(placesArray()[0][place]);
		// Setting the map to fit into the bounds defined by the marker pins //
			bounds.extend(markersArray[place].position);
			map.fitBounds(bounds);
			}
		}, 1200);
	});
	
// Following code was snatched from http://stackoverflow.com/questions/1544739/google-maps-api-v3-how-to-remove-all-markers
// It clears all previous pins when called.
	function clearOverlays() {
	  for (var i = 0; i < markersArray.length; i++ ) {
	    markersArray[i].setMap(null);
	  }
	  markersArray.length = 0;
	  placesArray().length = 0;
	}
}

google.maps.event.addDomListener(window, 'load', mapRender);


// VIEWMODEL End //




// MODEL Start //

// Yelp API request for creating the Model of the presented places.
// The code was taken from http://forum.jquery.com/topic/hiding-oauth-secrets-in-jquery, with gratitude to Jim(coldfusionguy).
// As they point out this is not an optimal way to handle consumer keys as they can be compromised, but I wanted to build the app without server side work.
var placesArray = ko.observableArray([]);
function yelpRequest (){
	var auth = {
	  consumerKey: "g7KMBGwZ20TQgGzl6JV9SQ", 
	  consumerSecret: "bw6Ky0YXuSj_eaRO9hNFBrzFeTw",
	  accessToken: "syyIWypoKYS0cPVnd5KdCYpCj5dBfb84",
	  accessTokenSecret: "2VRqfefVBC-umOCo-exlSLDZXik",
	  serviceProvider: { 
	    signatureMethod: "HMAC-SHA1"
	  }
	};

	var terms = navViewModel.currentFilter();
	var near = navViewModel.currentLocation();

	var accessor = {
	  consumerSecret: auth.consumerSecret,
	  tokenSecret: auth.accessTokenSecret
	};

	parameters = [];
	parameters.push(['term', terms]);
	parameters.push(['location', near]);
	parameters.push(['callback', 'cb']);
	parameters.push(['oauth_consumer_key', auth.consumerKey]);
	parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
	parameters.push(['oauth_token', auth.accessToken]);
	parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

	var message = { 
	  'action': 'http://api.yelp.com/v2/search',
	  'method': 'GET',
	  'parameters': parameters 
	};

	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);

	var parameterMap = OAuth.getParameterMap(message.parameters);
	parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
	console.log(parameterMap);

	$.ajax({
	  'url': message.action,
	  'data': parameterMap,
	  'cache': true,
	  'dataType': 'jsonp',
	  'jsonpCallback': 'cb',
	  'success': function(data, textStats, XMLHttpRequest) {
	   console.log(data.businesses);
	   placesArray().push(data.businesses);
	  }
	});
}

var placesList = ko.observableArray([]);



// MODEL End //
