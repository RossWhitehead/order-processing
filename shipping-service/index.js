const kafka = require('kafka-node');
const dataContext = require('./data-context');

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
    ),
    shipmentsConsumerClient = new kafka.Client(),    
    shipmentsConsumer = new Consumer(
        shipmentsConsumerClient,
        [
            { topic: 'shipments'}
        ],
        {
            autoCommit: true
        }
    );   

const Producer = kafka.Producer,
    producerClient = new kafka.Client(),
    producer = new Producer(producerClient);       

ordersConsumer.on('message', function (message) {
    let value, type;

    try {
        value = JSON.parse(message.value);
      } catch(e) {
        console.log("Invalid JSON Error:", message.value);
        return;
      }

    type = value.type;

    if(type === "order-confirmed")
    {
        console.log('Consuming order-confirmed event.');

        const shipment = new dataContext.Shipment({ orderId: value.id, shipmentDate: Date.now(), status: 'Shipped' });

        shipment.save(function (err, shipment) {
            if (err) return console.error(err);
            console.log("Creating shipment document, ", shipment._id);
        });

        const payloads =  [{ topic: 'shipments', messages: '{ "id":"' + shipment._id + '", "orderId":"'+ value.id + '", "type":"shipment-prepared" }' }]
 
        producer.send(payloads, function (err, data) {
            console.log('Producing shipment-prepared event.');
        });
    }
});

ordersConsumer.on('error', function (err) {
    console.log(err);
});

shipmentsConsumer.on('message', function (message) {
    let value, type;

    try {
        value = JSON.parse(message.value);
      } catch(e) {
        console.log("Invalid JSON Error:", message.value);
        return;
      }

    type = value.type;

    if(type === "shipment-prepared")
    {
        console.log('Consuming shipment-prepared event.');

        dataContext.Shipment.updateOne({ _id: value.id }, { $set: { status: 'dispatched' }}, function (err) {
            if (err) return console.error(err);
            console.log("Updating shipment document status to dispatched, ", value.id);
        });

        const payloads =  [{ topic: 'shipments', messages: '{ "id":"'+ value.id + '", "type":"shipment-dispatched" }' }]
 
        producer.send(payloads, function (err, data) {
            console.log('Producing shipment-dispatched event.');
        });
    }
    else if(type === "shipment-dispatched")
    {
        console.log('Consuming shipment-dispatched event.');

        dataContext.Shipment.updateOne({ _id: value.id }, { $set: { status: 'delivered' }}, function (err) {
            if (err) return console.error(err);
            console.log("Updating shipment document status to delivered, ", value.id);
        });

        const payloads =  [{ topic: 'shipments', messages: '{ "id":"'+ value.id + '", "type":"shipment-delivered" }' }]

        producer.send(payloads, function (err, data) {
            console.log('Producing shipment-delivered event.');
        });
    }
});

shipmentsConsumer.on('error', function (err) {
    console.log(err);
});
 

producer.on('error', function (err) {
    console.log(err);
});

