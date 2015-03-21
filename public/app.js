var map;

$(function() {
	initializeMap();
});

function initializeMap() {
	map = L.map('route', {
		maxZoom: 15,
		center: [52.37948444,4.62993827] 
	})

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	search();
};

function clearMap(map) {
	if (!map) {
		return;
	}

	for (i in map._layers) {
        if (map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            }
            catch(e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }
};

function search(segments) {
	clearMap(map);

	var url = '/rides/' + day + '.js';
	
	$.getJSON(url, function(json) {
		var rideLayer = L.geoJson(json, {
			"color": "#e10b29",
			"weight": 5,
			"opacity": 0.65
		}).addTo(map),
			i;

		// for (i = 0; i < json.length; i++) {
		// 	rideLayer.addData(json[i]);
		// }

		map.fitBounds(rideLayer.getBounds());
	});
};
