const kafka = require('kafka-node');
const dataContext = require('./data-context');

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
    let value, type;

    try {
        value = JSON.parse(message.value);
      } catch(e) {
        console.log("Invalid JSON Error:", message.value);
        return;
      }

    type = value.type;

    if(type === "order-validated")
    {
        console.log('Consuming order-validated event.');

        console.log('Processing payment.');

        const payment = new dataContext.Payment({ orderId: value.id, amount: 0.99, status: 'Success' });

        payment.save(function (err, payment) {
            if (err) return console.error(err);
            console.log("Creating payment document ", payment._id);
        });

        const payloads =  [{ topic: 'payments', messages: '{ "id":"'+ value.id + '", "type":"payment-processed" }' }]
 
        producer.send(payloads, function (err, data) {
            console.log('Producing payment-processed event.');
        });
    }
});

consumer.on('error', function (err) {
    console.log(err);
});
 

producer.on('error', function (err) {
    console.log(err);
});

