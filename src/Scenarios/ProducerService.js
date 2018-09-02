const rmq = require("../RabbitMQClient/DASRabbitMQClient")
const NotificationRequest = require("./NotificationRequest")
const NotificationSentEvent = require("./NotificationSentEvent")
const NotificationActivity = require("./NotificationActivity")
const ProcessConfirmationRequest = require("./ProcessConfirmationRequest")

const client = new rmq("amqp://user:bitnami@localhost", "js-producer");
client.start().then(r => {
    console.debug("Producer is started.")

    // subscriptions
    client.declareTopic("js-notifications-stats-topic"); // we're going to be publishing to this topic but not consuming
    client.subscribeTopic("js-notifications-topic", {routingKey: "#.response"});      
    
    // register handlers
    client.registerHandler(NotificationSentEvent.$messageType, handleNotificationSentEvent);
    client.registerHandler(ProcessConfirmationRequest.$messageType, handleProcessConfirmation);

    // run example over and over
    setInterval(() => {
        sendAnEmail("jon@winterfell.we", "You know nothing...");
    }, 2000)    
});

function sendAnEmail(destination, body) {
    let notificationRequest = new NotificationRequest(destination, body, "Email");
    client.send("js-notification-service", notificationRequest) 
}

/** HANDLERS */

function handleNotificationSentEvent(message, properties) {
    
    // defer the processing of this request until we have time (simulate a busy service)
    let deferralRequest = new ProcessConfirmationRequest(message.sentDate);
    client.publishLocal(deferralRequest, properties);
}

function handleProcessConfirmation(message, properties) {
    console.debug(`Email ${properties.correlationId} was sent at ${message.sentDate}`);

    // publish to stats stream
    let activity = new NotificationActivity("OriginatorReceivedConfirmation", new Date(Date.now()))
    client.publish("js-notifications-stats-topic", activity, {
        routingKey: "producer.notifications.confirmation.received",
        correlationId: properties.correlationId
    });
}
