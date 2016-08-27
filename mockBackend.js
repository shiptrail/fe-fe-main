var http = require('http');
var sys = require('sys');
var fs = require('fs');
var trackData = require('./src/assets/mockBackend/174922453_175335558.json');

http.createServer(function(req, res) {
  if (req.headers.accept && req.headers.accept == 'text/event-stream') {
    if (req.url == '/events') {
      sendSSE(req, res);
    } else {
      res.writeHead(404);
      res.end();
    }
  }
}).listen(8000);

var time = 0;
var nextCoordinateI = 0;

function sendSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Sends a SSE every 5 seconds on a single connection.
  setInterval(function() {
    time += 0.5;
    if(trackData['174922453'].coordinates[nextCoordinateI][2] <= time){
      constructSSE(res, 'add', JSON.stringify([{trackId: '1234', type: 'coordinates', coordinates: [trackData['174922453'].coordinates[nextCoordinateI]]}]));
      nextCoordinateI++;
    }
  }, 200);
}

function constructSSE(res, event, data) {
  res.write('event: ' + event + '\n');
  res.write("data: " + data + '\n\n');
}
