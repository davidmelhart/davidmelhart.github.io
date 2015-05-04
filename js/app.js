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

var map;
var service;
var infowindow;

function mapRender() {
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
		map = new google.maps.Map(document.getElementById("google-map"), mapOptions);
		
		// Setting custom navigation //

		var naviForm = (document.getElementById("navi-form"));
		naviForm.index = 1;
    	map.controls[google.maps.ControlPosition.TOP_LEFT].push(naviForm);
};

//Initializing the map//

window.addEventListener('load', mapRender);




// MODEL End //
