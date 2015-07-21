var EventSource = require('eventsource');
var express = require('express');

var DEVICE_ID = process.env.DEVICE_ID;
var TOKEN = process.env.TOKEN;

if (!DEVICE_ID) {
    console.error('Missing DEVICE_ID');
    process.exit(1);
}

if (!TOKEN) {
    console.error('Missing TOKEN');
    process.exit(1);
}

function Listener() {
    this.current = {};
}

Listener.prototype.start = function () {
    var current = this.current;    
    var uri = 'https://api.particle.io/v1/devices/' + DEVICE_ID + '/events/temperature';
    var auth = {
        headers: {
            Authorization: 'Bearer ' + TOKEN
        }
    };
    var es = new EventSource(uri, auth);
    es.addEventListener('temperature', function (e) {
        var data = JSON.parse(e.data);
        var fields = data.data.split(':');
        current.temperature = parseInt(fields[0]);
        current.humidity = parseInt(fields[1]);
    });
};

var listener = new Listener();

var app = express();

app.get('/', function (req, res) {
    var current = listener.current;
    if (!current.temperature) {
        return res.json({});
    }
    var result = {
        temperature: {
            type: 'integer',
            value: current.temperature,
            label: 'Temperature',
            order: 0
        },
        humidity: {
            type: 'integer',
            value: current.humidity,
            label: 'Humidity',
            order: 1
        }
    };
    res.json(result);
});

app.get('/temperature', function (req, res) {
    var current = listener.current;
    if (!current.temperature) {
        return res.json({});
    }
    var result = {
        temperature: {
            type: 'integer',
            value: current.temperature,
            label: 'Temperature',
        }
    };
    res.json(result);
});

app.get('/humidity', function (req, res) {
    var current = listener.current;
    if (!current.temperature) {
        return res.json({});
    }
    var result = {
        humidity: {
            type: 'integer',
            value: current.humidity,
            label: 'Humidity',
        }
    };
    res.json(result);
});

listener.start();
app.listen(8000, function () {
   console.log('Listening on port 8000');
});
