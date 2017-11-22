var express = require('express')
  , logger = require('morgan')
  , mongodb = require('mongodb')
  , mongoose = require('mongoose')
  , appPort = 8080

var app = express();

mongoose.connect('localhost', 'test');
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
var www_static_dir = 'www_static';
var indexHtml = 'index.html';
var awsDir = '/home/ec2-user/www/';
var localDir = __dirname + "/../";
var www_dir;
if (fs.existsSync(path.join(localDir, www_static_dir, indexHtml))) {
    www_dir = localDir;
} else {
    www_dir = awsDir;
}
www_dir = path.normalize(www_dir);
console.log('www_dir: ' + www_dir);

// configure Express
app.set('port', appPort || process.env.PORT);

app.use(logger('dev', { stream: expressLogFile }));

// ROUTES
var router = express.Router();

router.get('/units/si', function (req, res, next) {

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
});

