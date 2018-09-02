const rmq = require("../RabbitMQClient/DASRabbitMQClient");
const activityEvent = require("../Scenarios/NotificationActivity");

const client = new rmq("amqp://user:bitnami@localhost", "js-stats-consumer");

client.start().then(r => {
    console.debug("Stats consumer is started.");

    // subscriptions
    client.subscribeTopic("js-notifications-stats-topic", {routingKey: "#"});

    // register handlers
    client.registerHandler(activityEvent.$messageType, handleActivityEvent);
})

/** HANDLERS */

function handleActivityEvent(message, properties) {
    console.debug(`Handled ${message.activityType} for sequence ${properties.correlationId} ActivityTimeStamp: ${message.timestamp}`);
}