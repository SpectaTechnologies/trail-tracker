"use-strict"

var express = require('express');
var router = express.Router(); // get an instance of the express Router
var morgan = require('morgan');
var io = require('./io')

var Post = require('./app/models/post')
var bodyParser = require('body-parser');
var app = express();
var Location = require('./app/models/location')

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {
    flags: 'w'
});
var log_stdout = process.stdout;

console.log = function(d) { //
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};

//app.use(morgan('dev'));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/api/route', router);
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies
app.use(require('./config/auth'))
app.use('/api/posts', require('./app/controllers/api/posts'))
app.use('/api/users', require('./app/controllers/api/users'))
app.use('/api/sessions', require('./app/controllers/api/sessions'))
app.use('/api/vehicle', require('./app/controllers/api/vehicle'))
app.use('/', require('./app/controllers/static'))




var port = process.env.PORT || 3000
var server = app.listen(port, function() {
    console.log('App listening at the ', port);
});

io.attach(server);

/*app.post('/hello/:id', function (req, res) {
        var location = 24;
        io.emit('this_is_it', location)
        console.log("done with this")
});
*/

app.post('/hello/:vehicle_id', function(req, res, next) {
    //res.end(req.params.vehicle_id);

    var location = new Location({
        device_id: req.params.vehicle_id,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        speed: req.body.speed
    })

    location.save(function(err, location) {
        if (err) {
            return res.status(500).send(err);
        }
        // res.send(201)       
        console.log("Got new location")
            //res.json(location);        
        io.emit('location_updated', location)
        console.log("done with this")
        res.send(location, 201)

    })

});


app.post('/test', function(req, res, next) {
    console.log(req);

    var name = 'Magic begins ' + req.body.name
    res.send(name, 200);

});
