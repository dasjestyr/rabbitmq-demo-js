const rmq = require("../RabbitMQClient/DASRabbitMQClient")
const msg = require("./Messages.js")

const client = new rmq("amqp://user:bitnami@localhost", "js-producer");
client.start().then(r => {
    console.debug("Producer is started.")

    // subscriptions
    client.declareTopic("js-notifications-stats-topic"); // we're going to be publishing to this topic but not consuming
    client.subscribeTopic("js-notifications-topic", {routingKey: "#.response"});      
    
    // register handlers
    client.registerHandler(msg.NotificationSentEvent.$messageType, handleNotificationSentEvent);
    client.registerHandler(msg.ProcessConfirmationRequest.$messageType, handleProcessConfirmation);

    // run example over and over
    setInterval(() => {
        sendAnEmail("jon@winterfell.we", "You know nothing...");
    }, 2000)    
});

function sendAnEmail(destination, body) {
    let notificationRequest = new msg.NotificationRequest(destination, body, "Email");
    client.send("js-notification-service", notificationRequest) 
}

/** HANDLERS */

function handleNotificationSentEvent(message, properties) {
    
    // defer the processing of this request until we have time (simulate a busy service)
    let deferralRequest = new msg.ProcessConfirmationRequest(message.sentDate);
    client.sendLocal(deferralRequest, properties);
}

function handleProcessConfirmation(message, properties) {
    console.debug(`Email ${properties.correlationId} was sent at ${message.sentDate}`);

    // publish to stats stream
    let activity = new msg.NotificationActivity("OriginatorReceivedConfirmation", new Date(Date.now()))
    client.publish("js-notifications-stats-topic", activity, {
        routingKey: "producer.notifications.confirmation.received",
        correlationId: properties.correlationId
    });
}
