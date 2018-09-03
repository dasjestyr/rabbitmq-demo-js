const rmq = require("../RabbitMQClient/DASRabbitMQClient");
const msg = require("./Messages")

const client = new rmq("amqp://user:bitnami@localhost", "js-stats-consumer");

var sentEvents = 0;
var confirmationEvents = 0;

client.start().then(r => {
    console.debug("Stats consumer is started.");

    // subscriptions
    client.subscribeTopic("js-notifications-stats-topic", {routingKey: "#"});

    // register handlers
    client.registerHandler(msg.NotificationActivity.$messageType, handleActivityEvent);
})

/** HANDLERS */

function handleActivityEvent(message, properties) {
    switch(message.activityType) {
        case "OriginatorReceivedConfirmation":
            confirmationEvents++;            
            break;
        case "NotificationServiceSentConfirmation":
            sentEvents++;
            break;
    }

    let confirmationRate = ((confirmationEvents / sentEvents) * 100).toFixed(2) + '%'

    console.debug(`Handled ${message.activityType} for sequence ${properties.correlationId} ActivityTimeStamp: ${message.timestamp}`);
    console.info(`
    :: Notification Statistics: 
            Notifications Sent:     ${sentEvents}
            Confirmations Received: ${confirmationEvents}
            Confirmation Rate       ${confirmationRate}`);
}