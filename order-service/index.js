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
    paymentsConsumerClient = new kafka.Client(),
    paymentsConsumer = new Consumer(
        paymentsConsumerClient,
        [
            { topic: 'payments'}
        ],
        {
            autoCommit: true
        }
    ),
    shippingsConsumerClient = new kafka.Client(),
    shipmentsConsumer = new Consumer(
        shippingsConsumerClient,
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

    if(type === "order-requested")
    {
        console.log(message);
        const payloads =  [{ topic: 'orders', messages: '{ "type":"order-validated" }' }]
        producer.send(payloads, function (err, data) {
            console.log("Producing order-validated:" +data);
        });
    }
});

ordersConsumer.on('error', function (err) {
    console.log(err);
});

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

producer.on('error', function (err) {
    console.log(err);
});

