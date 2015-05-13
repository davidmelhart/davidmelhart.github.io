function ViewModel () {
	var self = this;
	var map;
	var place;
	// Somehow knockout didn't want to get the full value of the google search box, only the typed in characters. This is an improvised workaround. //
	self.currentLocation = function() {
		var location = $("#location:input").val();
		return location;
	};
	self.currentFilter = ko.observable();
	self.placesList = ko.observableArray([]);
	
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

		map = new google.maps.Map(document.getElementById("google-map"), mapOptions);

		var defaultBounds = new google.maps.LatLngBounds(
	    	new google.maps.LatLng(28.70, -127.50), 
	    	new google.maps.LatLng(48.85, -55.90)
		);
		map.fitBounds(defaultBounds);
		
		// Setting custom list-view rendering //
		var listOfPlaces = (document.getElementById("places"));
		listOfPlaces.index = 2;
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(listOfPlaces);

		// Setting custom navigation //
		var naviForm = (document.getElementById("navigation"));
		naviForm.index = 1;
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(naviForm);

		// Create the search box and link it to the UI element.
		var locationInput = document.getElementById("location");

		var searchOptions = {
			types: ['(cities)'],
			componentRestrictions: {country: "us"}
		};

		var searchBox = new google.maps.places.SearchBox(locationInput, searchOptions);

		var placesArray = ko.observableArray([]);

	// The yelp code was taken from http://forum.jquery.com/topic/hiding-oauth-secrets-in-jquery, with gratitude to Jim(coldfusionguy).
	// As they point out this is not an optimal way to handle consumer keys as they can be compromised, but I wanted to build the app without server side work.

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

			var terms = self.currentFilter();
			var near = self.currentLocation();

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
			parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);

			// Request error handler in case someone does not put in, or mistypes a filter or choose a country that is not supported by Yelp //
			var errorHandler = setTimeout(function(){
				alert("Sorry, we were not able to find anything for taste... Try to check your internet connection or try another 'filter' or a city in another country!");
			}, 2000);

			$.ajax({
				'url': message.action,
				'data': parameterMap,
				'cache': true,
				'dataType': 'jsonp',
				'jsonpCallback': 'cb',
				'success': function(data, textStats, XMLHttpRequest) {
					clearTimeout(errorHandler);
					placesArray().push(data.businesses);
				},
				// On completion of the request the function for rendering fires //
				'complete': function () {
				  	var bounds = new google.maps.LatLngBounds();
					var places = placesArray()[0];	
				
				// Calling pinMaker for each place //		
					for (place in placesArray()[0]) {
						pinMaker(places);

						placesArray()[0][place].address = (placesArray()[0][place].location.display_address[0] + ", " + placesArray()[0][place].location.display_address[2]).toString();
				// Creating placeholders for items that does not have a preview image attached //
						if (placesArray()[0][place].image_url === undefined) {
							placesArray()[0][place].image_url = "http://placehold.it/100x100";
						}
						self.placesList.push(placesArray()[0][place]);

				
				// Setting the map to fit into the bounds defined by the marker pins //
						bounds.extend(markersArray[place].position);
						map.fitBounds(bounds);
					}

					
				}
			});
		}

		document.getElementById("nav-btn").addEventListener("click", function() {
			// Clearing all previous requests //
			clearOverlays();
			yelpRequest();
		});

	// Following code was snatched from http://stackoverflow.com/questions/1544739/google-maps-api-v3-how-to-remove-all-markers
	// It clears all previous pins when called.
		function clearOverlays() {
		  for (var i = 0; i < markersArray.length; i++ ) {
		    markersArray[i].setMap(null);
		  }
		  markersArray.length = 0;
		  self.placesList([]);
		  placesArray().length = 0;
		}
	// Map rendering error handler //
		var mapErrorHandler = setTimeout(function(){
			alert("Sorry, we were not able to load the map this time... Try to refresh the page!");
		}, 5000);
	    google.maps.event.addListener(map, 'tilesloaded', function() {
	    	clearTimeout(mapErrorHandler);
	    });
	}

	google.maps.event.addDomListener(window, 'load', mapRender);

	// Creating shared infowidow variable //
	var infoWindow = new google.maps.InfoWindow();
	
	function pinMaker(places){
		
		// For each place creating a marker //
		var marker = new google.maps.Marker({
			id: places[place].id,
			map: map,
			position: new google.maps.LatLng((places[place].location.coordinate.latitude),(places[place].location.coordinate.longitude)),
			title: places[place].name,
			animation: google.maps.Animation.DROP,
		// For each place creating an infowindow content //
			content: "<div style='text-align: center'><b>"
				+ places[place].name + "</b></br>"
				+ "<img src=" + places[place].image_url + "></br>"
				+ places[place].location.display_address[0] + ", " + places[place].location.display_address[2]
				+ "</div>"
		});
		markersArray.push(marker);

		// Adding a click event listener to open the info boxes //
		google.maps.event.addListener(marker, "click", function() {
			infoWindow.setContent(marker.content);
			infoWindow.open(map, this);
			marker.setAnimation(google.maps.Animation.DROP);
		});
	}

	self.listClick = function(place) {
		var marker; 
	// Iterating through the markers, trying to find the one with a matching id to place we clicked upon // 
		for (marker in markersArray) {
			if (markersArray[marker].id === place.id){
	// Setting the chosen marker from the markersArray, then breaking the cycle //			
				marker = markersArray[marker];
				break;
			}
		}
	// Pinning the chosen marker, creating and opening the right info window. The code for the infowindow is a bit modified here //
		map.panTo(marker.position);
		
		var infoContent =
				"<div style='text-align: center'><b>"
				+ place.name + "</b></br>"
				+ "<img src=" + place.image_url + "></br>"
				+ place.address
				+ "</div>";

		infoWindow.open(map, marker);
		infoWindow.setContent(infoContent);
		marker.setAnimation(google.maps.Animation.DROP);
	};
}
ko.applyBindings(new ViewModel());
