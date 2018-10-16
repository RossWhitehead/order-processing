const kafka = require('kafka-node');

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
    const value = JSON.parse(message.value);
    const type = value.type;

    if(type === "order-confirmed")
    {
        console.log(message);
        const payloads =  [{ topic: 'shipments', messages: '{ "type":"shipment-prepared" }' }]
        producer.send(payloads, function (err, data) {
            console.log("Producing shipment-prepared:" + data);
        });
    }
});

ordersConsumer.on('error', function (err) {
    console.log(err);
});

shipmentsConsumer.on('message', function (message) {
    const value = JSON.parse(message.value);
    const type = value.type;

    if(type === "shipment-prepared")
    {
        console.log(message);
        const payloads =  [{ topic: 'shipments', messages: '{ "type":"shipment-dispatched" }' }]
        producer.send(payloads, function (err, data) {
            console.log("Producing shipment-dispatched:" + data);
        });
    }
    else if(type === "shipment-dispatched")
    {
        console.log(message);
        const payloads =  [{ topic: 'shipments', messages: '{ "type":"shipment-delivered" }' }]
        producer.send(payloads, function (err, data) {
            console.log("Producing shipment-delivered:" + data);
        });
    }
});

shipmentsConsumer.on('error', function (err) {
    console.log(err);
});
 

producer.on('error', function (err) {
    console.log(err);
});

