const kafka = require('kafka-node');
const dataContext = require('./data-context');

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
    let value, type;

    try {
        value = JSON.parse(message.value);
      } catch(e) {
        console.log("Invalid JSON Error:", message.value);
        return;
      }

    type = value.type;

    if(type === "order-requested") {
        console.log(message);

        // Validate order
        // - products are in product catelog
        // - prices are correct

        const valid = true;

        if (valid) {
            const order = new dataContext.Order({ status: 'Valid' });
            order.save(function (err, order) {
                if (err) return console.error(err);
                console.log("order saved, ", order._id);
            });
    
            const payloads =  [{ topic: 'orders', messages: '{ "id":"'+ order._id + '", "type":"order-validated" }' }]
            producer.send(payloads, function (err, data) {
                console.log("Producing order-validated:" + data);
            });
        } else {
            // Invalid
        }    
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
    let value, type;

    try {
        value = JSON.parse(message.value);
      } catch(e) {
        console.log("Invalid JSON Error:", message.value);
        return;
      }

    type = value.type;

    if(type === "payment-processed")
    {
        console.log(message);

        dataContext.Order.updateOne({ _id: value.id }, { $set: { status: 'confirmed' }}, function (err) {
            if (err) return console.error(err);
            console.log("order updated, ", value.id);
        });

        const payloads =  [{ topic: 'orders', messages: '{ "id":"'+ value.id + '", "type":"order-confirmed" }' }]
 
        producer.send(payloads, function (err, data) {
            console.log("Producing order-confirmed:" + data);
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
    let value, type;

    try {
        value = JSON.parse(message.value);
      } catch(e) {
        console.log("Invalid JSON Error:", message.value);
        return;
      }

    type = value.type;

    if(type === "shipment-delivered")
    {
        console.log(message);

        dataContext.Order.updateOne({ _id: value.id }, { $set: { status: 'completed' }}, function (err) {
            if (err) return console.error(err);
            console.log("order updated, ", value.id);
        });

        const payloads =  [{ topic: 'orders', messages: '{ "id":"'+ value.id + '", "type":"order-completed" }' }]

        producer.send(payloads, function (err, data) {
            console.log("Producing order-completed:" +data);
        });
    }
});

shipmentsConsumer.on('error', function (err) {
    console.log(err);
});
