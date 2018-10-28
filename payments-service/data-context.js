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
const paymentSchema = new mongoose.Schema({
    orderId: String,
    amount: Number,
    status: String
});

module.exports.Payment = mongoose.model('Payment', paymentSchema);
