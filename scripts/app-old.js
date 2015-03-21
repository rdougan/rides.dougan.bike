var directionsService = new google.maps.DirectionsService(),
	directionsDisplays = [],
	map;

$(function() {
	

	// $.getJSON('ride.json', function(data) {
	// 	console.log(data.vehicleEvents);

	// 	var events = data.vehicleEvents,
	// 		locationEvents = [],
	// 		waypoints = [],
	// 		limit = 10,
	// 		i;

	// 	// sort events
	// 	events.sort(function(a, b) {
	// 		if (a.eventTime < b.eventTime) {
	// 		     return -1;
	// 		}

	// 		if (a.eventTime > b.eventTime) {
	// 			return 1;
	// 		}

	// 		return 0;
	// 	});

	// 	var csv = "";

	// 	for (i = 0; i < data.vehicleEvents.length; i++) {
	// 		if (data.vehicleEvents[i].eventType == "Location_Report") {
	// 			locationEvents.push(data.vehicleEvents[i]);
	// 		}
	// 	}

	// 	// var chunks = [],
	// 	// 	currentChunk = [];

	// 	for (i = 0; i < locationEvents.length; i++) {
	// 		var e = locationEvents[i];

	// 		csv += e.eventTime + "," + e.longitude + "," + e.latitude + "," + e.eventTime +"\n";
	// 	}

	// 	$.ajax({
	// 		type: "POST",
	// 		url: "http://test.roadmatching.com/rest/mapmatch/?app_id=4b9817a8&app_key=01c8413cd0c6fead413fd9bf34410f2d",
	// 		contentType: "text/csv",
	// 		data: csv,
	// 		success: function(data) {
	// 			debugger;
	// 		}
	// 	});

	// 	console.log(csv);

	// 	// 	if (currentChunk.length >= limit) {
	// 	// 		chunks.push(currentChunk);
	// 	// 		currentChunk = [];
	// 	// 	}

	// 	// 	currentChunk.push(locationEvents[i]);
	// 	// }

	// 	// if (currentChunk.length) {
	// 	// 	chunks.push(currentChunk);
	// 	// }

	// 	// fa1c5150fbd7d812c98a2f1025af6aba

	// 	// addDirectionsForEvents(chunks[1]);

	// 	// for (i = 0; i < chunks.length; i++) {
	// 	// 	addDirectionsForEvents(chunks[i]);
	// 	// }
	// });
	
	$.getJSON('output.json', function(result) {
		
		for (var i=0; i < result.diary.entries.length; i++) {
			entry = result.diary.entries[i];
			// console.log(entry);

			for (var j = 0; j < entry.route.links.length; j++) {  
				// console.log(entry.route.links[j].geometry);
		 		L.geoJson(JSON.parse(entry.route.links[j].geometry)).addTo(map);
			}   
		}

	});
	

	initializeMap();
});

function latLngForEvent(e) {
	return e.latitude + "," + e.longitude;
};

// function addDirectionsForEvents(events) {
// 	var waypoints = [];

// 	for (var i = 1; i < events.length - 1; i++) {
//         waypoints.push({
//             location: latLngForEvent(events[i]),
//             stopover: true
//         });
// 	}

// 	var start = latLngForEvent(events[0]),
//   		end = latLngForEvent(events[events.length - 1]);

//   	var request = {
//     	origin: start,
//     	destination: end,
//     	waypoints: waypoints,
//     	travelMode: google.maps.TravelMode.DRIVING
//   	};

//   	directionsService.route(request, function(result, status) {
//     	if (status == google.maps.DirectionsStatus.OK) {
//     		var directionsDisplay = new google.maps.DirectionsRenderer();
//     		directionsDisplay.setOptions({
//     			suppressMarkers: true
//     		});

//     		directionsDisplay.setMap(map);
//       		directionsDisplay.setDirections(result);

//       		directionsDisplays.push(directionsDisplay);
//     	}
// 	});
// };

function initializeMap() {
	map = L.map('map').setView([52.37948444,4.62993827], 13);

	// add an OpenStreetMap tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
};
// function initializeMap() {
//  	var chicago = new google.maps.LatLng(41.850033, -87.6500523),
//   		mapOptions;

//   	mapOptions = {
//     	zoom:7,
//     	center: chicago
// 	};

// 	map = new google.maps.Map(document.getElementById("map"), mapOptions);
// };
