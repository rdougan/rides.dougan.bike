var http = require('http'),
	express = require('express');

/**
 * Fetches a segment from the Ride server and parses the JSON and returns only the location
 * events for the segment
 */
var getSegmentEvents = function(segmentId, callback) {
	var url = "http://dash.ridescorpio.com/rides/segments-and-media/" + segmentId;

	http.get(url, function(res) {
	    var body = '';

	    res.on('data', function(chunk) {
	        body += chunk;
	    });

	    res.on('end', function() {
	    	var json = JSON.parse(body),
		    	vehicleEvents = json.vehicleEvents,
	    		events = [],
	    		i;

	    	// Only add vehicle events
	    	for (i = 0; i < vehicleEvents.length; i++) {
	    		if (vehicleEvents[i].eventType == "Location_Report") {
	    			events.push(vehicleEvents[i]);
	    		}
	    	}

	    	// Sort events
	    	events.sort(function(a, b) {
	    		if (a.eventTime < b.eventTime) {
	    		     return -1;
	    		}

	    		if (a.eventTime > b.eventTime) {
	    			return 1;
	    		}

	    		return 0;
	    	});

	    	callback(events);
	    });
	}).on('error', function(e) {
		throw e;
	});
};

/**
 * 
 */
var getTrackMatchingForEvents = function(events, callback) {
	var options = {
		method: 'POST',
		host: 'test.roadmatching.com',
		headers: { 'Content-Type':'application/gpx+xml', 'Accept':'application/json' },
		path: [
			'/rest/mapmatch/',
			'?app_id=4b9817a8',
			'&app_key=01c8413cd0c6fead413fd9bf34410f2d',
			'&output.linkGeometries=true',
			'&output.osmProjection=false',
			'&output.groupByWays=true',
			'&output.linkMatchingError=true',
			'&output.waypoints=false'
		].join('')
	};

	var req = http.request(options, function(res) {
		var body = '';

	    res.on('data', function(chunk) {
	        body += chunk;
	    });

	    res.on('end', function() {
	    	var json = JSON.parse(body),
	    		data = [],
	    		i, j;

	    	for (i = 0; i < json.diary.entries.length; i++) {
	    		entry = json.diary.entries[i];
	    		
	    		for (j = 0; j < entry.route.links.length; j++) {  
	    	 		data.push(JSON.parse(entry.route.links[j].geometry));
	    		}
	    	}

	    	var coordinates = [];
	    	for (i = 0; i < data.length; i++) {
	    		for (j = 0; j < data[i].coordinates.length; j++) {
	    			coordinates.push(data[i].coordinates[j]);
	    		}
	    	}

	    	callback({
	    		type: 'FeatureCollection',
	    		features: [
	    			{
	    				type: 'Feature',
	    				geometry: {
	    					type: 'LineString',
	    					coordinates: coordinates
	    				},
	    				properties: {}
	    			}
	    		]
	    	});
	    });
	});

	req.on('error', function(e) {
		console.log('Error getting track matching', e);
		res.status(500);
	});

	req.write(gpxDataForEvents(events));
	req.end();
};

/**
 * Returns GPX data for the specified events
 */
var gpxDataForEvents = function(events) {
	var data = "",
		i;

	data += '<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"><trk><trkseg>';

	for (i = 0; i < events.length; i++) {
		data += '<trkpt lon="' + events[i].longitude + '" lat="' + events[i].latitude + '"><time>2014-11-08T15:23:33.000Z</time></trkpt>';
	}

	data += '</trkseg></trk></gpx>';

	return data;
};


var app = express();

app.use(express.static(__dirname + '/public'));

app.param('segmentId', function(req, res, next, id) {
	next();
});

app.get('/segment/:segmentId', function(req, res) {
	var segmentId = req.params.segmentId;
	if (!segmentId) {
		res.status(404);
		return;
	}

	getSegmentEvents(segmentId, function(events) {
	  	getTrackMatchingForEvents(events, function(data) {
	  		res.type('json').send(data);
	  	});
	});
});

app.get('/join', function(req, res) {
	var segments = (req.query.segments) ? req.query.segments.split(',') : [];
	if (!segments || !segments.length) {
		res.status(404);
		return;
	}

	var allEvents = [],
		i = 0,
		next, done;

	next = function() {
		if (i < segments.length) {
			getSegmentEvents(segments[i], function(events) {
				allEvents = allEvents.concat(events);
				next();
			});

			i++;

			return;
		}

		done();		
	};

	done = function() {
		getTrackMatchingForEvents(allEvents, function(data) {
	  		res.type('json').send(data);
	  	});
	};

	next();
});

var server = app.listen(process.env.PORT || 1337, function() {
	var host = server.address().address,
		port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
