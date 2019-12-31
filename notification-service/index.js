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

consumer.on('message', function (message) {
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

        console.log('Sending order confirmed notification.');
    }
});

consumer.on('error', function (err) {
    console.log(err);
});
