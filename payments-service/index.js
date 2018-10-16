const kafka = require('kafka-node');

const Consumer = kafka.Consumer,
    consumerClient = new kafka.Client(),
    consumer = new Consumer(
        consumerClient,
        [
            { topic: 'orders'}
        ],
        {
            autoCommit: true
        }
    );

const Producer = kafka.Producer,
    producerClient = new kafka.Client(),
    producer = new Producer(producerClient);       

consumer.on('message', function (message) {
    const value = JSON.parse(message.value);
    const type = value.type;

    if(type === "order-validated")
    {
        console.log(message);
        const payloads =  [{ topic: 'payments', messages: '{ "type":"payment-processed" }' }]
        producer.send(payloads, function (err, data) {
            console.log("Producing payment-processed:" + data);
        });
    }
});

consumer.on('error', function (err) {
    console.log(err);
});
 

producer.on('error', function (err) {
    console.log(err);
});

