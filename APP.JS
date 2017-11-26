var express = require('express')
  , logger = require('morgan')
  , mongodb = require('mongodb')
  , mongoose = require('mongoose')
  , fs = require('fs')
  , path = require('path')
  , appPort = 8081

var app = express();

mongoose.connect('mongodb://localhost/test', {useMongoClient: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
  console.log('Connected to DB');
});

// Units
var UnitsSchema = mongoose.Schema({
  name: { type: String},
  symbol: { type: String},
  type: { type: String},
  conversion: {type: String},
  created: { type: Date },
  updated: { type: Date }
});

UnitsSchema.pre('save', function(next){
  now = new Date();
  this.created = now;
  this.updated = now;
  next();
});

UnitsSchema.index({name: 1, symbol: 1}, {unique: true});

var Unit = mongoose.model('Unit', UnitsSchema);

var expressLogFile = fs.createWriteStream('./expressLogFile.log', {flags: 'w'}); //use {flags: 'w'} to open in write mode

// find path www_dir to index.html
var indexHtml = 'index.html';
var awsDir = '/home/ec2-user/www/';
var localDir = __dirname + "/../";
var www_dir;
if (fs.existsSync(path.join(localDir, indexHtml))) {
    www_dir = localDir;
} else {
    www_dir = awsDir;
}
www_dir = path.normalize(www_dir);
console.log('www_dir: ' + www_dir);

// configure Express
app.set('port', appPort || process.env.PORT);
app.use(express.static(www_dir));
app.use(logger('dev', { stream: expressLogFile }));

// ROUTES
var router = express.Router();

router.get('/units/add', function (req, res) {
  console.log(req.query.name);
  Unit.findOne({ symbol: req.query.symbol }, function(err, unit) {
      if(!unit) {
        var unit = new Unit({ name: '', symbol: req.query.symbol, type: req.query.type,
          conversion: req.query.conversion });
        unit.save(function(err) {
          console.log('Adding new unit to DB: name: ' + unit.name +
            ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
        });
      } else {
        console.log('Found unit in DB: name: ' + unit.name +
          ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
        unit.name = (typeof req.query.name === 'undefined') ? unit.name : req.query.name;
        unit.symbol = (typeof req.query.symbol === 'undefined') ? unit.symbol : req.query.symbol;
        unit.type = (typeof req.query.type === 'undefined') ? unit.type : req.query.type;
        unit.conversion = (typeof req.query.conversion === 'number') ? req.query.conversion : unit.conversion;
        unit.save(function(err) {
          console.log('Updated unit in DB: name: ' + unit.name +
            ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
        });
      }
  });
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ "name": req.query.name, "symbol": req.query.symbol, "type": req.query.type,
    "SI_Unit_Conversion": req.query.conversion }));
})

router.get('/units/si', function (req, res) {

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "unit_name": "rad/s", "multiplication_factor": 0.00029088820867 }));
})

app.use('/', router);

// ERROR HANDLING
// custom 404 page
app.use(function (req, res) {
    console.log('404: ' + req.url);
    res.type('text/html');
    res.status(404);
    res.send('<h1>404 - Not Found</h1>');
});

// APP LISTEN
var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port: ' + app.get('port'));
    // Add units to DB
    Unit.findOne({ name: 'minute' }, function(err, unit) {
        if(!unit) {
          var unit = new Unit({ name: 'minute', symbol: 'min', type: 'time', conversion: 60 });
          unit.save(function(err) {
           console.log('Adding new unit to DB: name: ' + unit.name +
             ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
          });
        } else {
          console.log('Found unit in DB: name: ' + unit.name +
            ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
        }
    });
    Unit.findOne({ name: 'hour' }, function(err, unit) {
        if(!unit) {
          var unit = new Unit({ name: 'hour', symbol: 'h', type: 'time', conversion: 3600 });
          unit.save(function(err) {
           console.log('Adding new unit to DB: name: ' + unit.name +
             ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
          });
        } else {
          console.log('Found unit in DB: name: ' + unit.name +
            ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
        }
    });
    Unit.findOne({ name: 'day' }, function(err, unit) {
        if(!unit) {
          var unit = new Unit({ name: 'day', symbol: 'd', type: 'time', conversion: 86400 });
          unit.save(function(err) {
           console.log('Adding new unit to DB: name: ' + unit.name +
             ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
          });
        } else {
          console.log('Found unit in DB: name: ' + unit.name +
            ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
        }
    });
    Unit.findOne({ name: 'degree' }, function(err, unit) {
        if(!unit) {
          var unit = new Unit({ name: 'degree', symbol: '°', type: 'Plane angle', conversion: Math.PI/180 });
          unit.save(function(err) {
           console.log('Adding new unit to DB: name: ' + unit.name +
             ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
          });
        } else {
          console.log('Found unit in DB: name: ' + unit.name +
            ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
        }
    });
    Unit.findOne({ symbol: '\'' }, function(err, unit) {
        if(!unit) {
          var unit = new Unit({ name: '', symbol: '\'', type: 'Plane angle', conversion: Math.PI/10800 });
          unit.save(function(err) {
           console.log('Adding new unit to DB: name: ' + unit.name +
             ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
          });
        } else {
          console.log('Found unit in DB: name: ' + unit.name +
            ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
        }
    });
    Unit.findOne({ name: 'second' }, function(err, unit) {
        if(!unit) {
          var unit = new Unit({ name: 'second', symbol: '"', type: 'Plane angle', conversion: Math.PI/648000 });
          unit.save(function(err) {
           console.log('Adding new unit to DB: name: ' + unit.name +
             ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
          });
        } else {
          console.log('Found unit in DB: name: ' + unit.name +
            ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
        }
    });
    Unit.findOne({ name: 'hectare' }, function(err, unit) {
        if(!unit) {
          var unit = new Unit({ name: 'hectare', symbol: 'ha', type: 'area', conversion: 10000 });
          unit.save(function(err) {
           console.log('Adding new unit to DB: name: ' + unit.name +
             ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
          });
        } else {
          console.log('Found unit in DB: name: ' + unit.name +
            ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
        }
    });
    Unit.findOne({ name: 'litre' }, function(err, unit) {
        if(!unit) {
          var unit = new Unit({ name: 'litre', symbol: 'L', type: 'volume', conversion: 0.001 });
          unit.save(function(err) {
           console.log('Adding new unit to DB: name: ' + unit.name +
             ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
          });
        } else {
          console.log('Found unit in DB: name: ' + unit.name +
            ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
        }
    });
    Unit.findOne({ name: 'tonne' }, function(err, unit) {
        if(!unit) {
          var unit = new Unit({ name: 'tonne', symbol: 't', type: 'mass', conversion: 1000 });
          unit.save(function(err) {
           console.log('Adding new unit to DB: name: ' + unit.name +
             ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
          });
        } else {
          console.log('Found unit in DB: name: ' + unit.name +
            ' symbol: ' + unit.symbol + ' type: ' + unit.type +' conversion factor: ' + unit.conversion);
        }
    });
});
