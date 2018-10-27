const kafka = require('kafka-node');

const mongoose = require('mongoose');

// Connect to Mongo
mongoose.connect('mongodb://mongo/test');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Opening database");
});

// Generate order model
const orderSchema = new mongoose.Schema({
    status: String
});
const Order = mongoose.model('Order', orderSchema);

//const dataContext = require('./data-context');

// Initialize producer
const Producer = kafka.Producer,
    producerClient = new kafka.Client(),
    producer = new Producer(producerClient);     

producer.on('error', function (err) {
    console.log(err);
});

// Initialize orders consumer
const Consumer = kafka.Consumer,
    ordersConsumerClient = new kafka.Client(),
    ordersConsumer = new Consumer(
        ordersConsumerClient,
        [
            { topic: 'orders'}
        ],
        {
            autoCommit: true
        }
    );

ordersConsumer.on('message', function (message) {
    const value = JSON.parse(message.value);
    const type = value.type;

    if(type === "order-requested")
    {
        console.log(message);

        const order = new dataContext.Order({ status: 'Requested' });
        order.save(function (err, order) {
            if (err) return console.error(err);
            console.log("order saved");
        });

        const payloads =  [{ topic: 'orders', messages: '{ "type":"order-validated" }' }]
        producer.send(payloads, function (err, data) {
            console.log("Producing order-validated:" + data);
        });
    }
});

ordersConsumer.on('error', function (err) {
    console.log(err);
});

// Initialize payments consumer
const paymentsConsumerClient = new kafka.Client(),
    paymentsConsumer = new Consumer(
        paymentsConsumerClient,
        [
            { topic: 'payments'}
        ],
        {
            autoCommit: true
        }
    );

paymentsConsumer.on('message', function (message) {
    const value = JSON.parse(message.value);
    const type = value.type;

    if(type === "payment-processed")
    {
        console.log(message);
        const payloads =  [{ topic: 'orders', messages: '{ "type":"order-confirmed" }' }]
        producer.send(payloads, function (err, data) {
            console.log("Producing order-confirmed:" +data);
        });
    }
});

paymentsConsumer.on('error', function (err) {
    console.log(err);
});

// Initialize shipments consumer
const shipmentsConsumerClient = new kafka.Client(),
    shipmentsConsumer = new Consumer(
        shipmentsConsumerClient,
        [
            { topic: 'shipments'}
        ],
        {
            autoCommit: true
        }
    );   
 
shipmentsConsumer.on('message', function (message) {
    const value = JSON.parse(message.value);
    const type = value.type;

    if(type === "shipment-delivered")
    {
        console.log(message);
        const payloads =  [{ topic: 'orders', messages: '{ "type":"order-completed" }' }]
        producer.send(payloads, function (err, data) {
            console.log("Producing order-completed:" +data);
        });
    }
});

shipmentsConsumer.on('error', function (err) {
    console.log(err);
});
