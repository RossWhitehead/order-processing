# order-processing
Choreographed order processing system using microservices and kafka

## Events
OrderRequested
OrderValidated
PaymentProcessed
OrderConfirmed
ShipmentPrepared
ShipmentDispatched
ShipmentDelivered
OrderCompleted

## Create Kafka topics
./kafka-topics --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic orders
./kafka-topics --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic payments
./kafka-topics --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic shipments
./kafka-console-producer --broker-list localhost:9092 --topic orders
