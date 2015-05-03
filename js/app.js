// VIEWMODEL Start //

function NavigatonViewModel() {
	this.locationValue = ko.observable();
	this.filter = ko.observable();
	this.updateLocation = function() {
		ko.computed(function(){
			console.log($("#filter:input").val());
			console.log($("#location:input").val());
		}, this);	
	}

};



// VIEWMODEL End //

ko.applyBindings(new NavigatonViewModel());


// MODEL Start //
function mapRender() {
	var center = new google.maps.LatLng(50, 8);
		var mapOptions = {
			zoom: 4,
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
		var naviForm = (document.getElementById("navi-form"));
		naviForm.index = 1;
    	map.controls[google.maps.ControlPosition.TOP_LEFT].push(naviForm);
};

window.addEventListener('load', mapRender);



// MODEL End //
