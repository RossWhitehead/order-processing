const mongoose = require('mongoose');

// Connection URL
const url = 'mongodb://root:example@localhost/test?authSource=admin';

// Connect to Mongo
mongoose.connect(url);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  console.log("Opening database");
});

// Generate order model
const shipmentSchema = new mongoose.Schema({
  orderId: String,
  shipmentDate: Date,
  status: String
});

module.exports.Shipment = mongoose.model('Shipment', shipmentSchema);
