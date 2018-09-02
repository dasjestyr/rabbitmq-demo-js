const rmq = require("../RabbitMQClient/DASRabbitMQClient")
const NotificationRequest = require("../Scenarios/NotificationRequest")
const NotificationSentEvent = require("../Scenarios/NotificationSentEvent")
const NotificationActivity = require("../Scenarios/NotificationActivity.js")

let client = new rmq("amqp://user:bitnami@localhost", "js-notification-service")
client.start().then(r => {
    console.debug("Notification service bus started.");

    // subscriptions

    // register handlers
    client.registerHandler(NotificationRequest.$messageType, handleNotificationRequest);
});

/** HANDLERS */

function handleNotificationRequest(message, properties) {
    console.debug(`Processing request ${properties.correlationId}`);
    let timestamp = new Date(Date.now());
    switch(message.deliveryMethod){
        case "Email":
            // ... call Email logic            
            let emailSent = new NotificationSentEvent(timestamp);
            client.publish("js-notifications-topic", emailSent, {
                routingKey: "request.email.response", 
                correlationId: properties.correlationId
            });
            break;
        case "SMS":
            // ... call SMS logic            
            let smsSent = new NotificationSentEvent(timestamp);
            client.publish("js-notifications-topic", smsSent, {
                routingKey: "request.sms.response", 
                correlationId: properties.correlationId
            })    ;        
            break;
        default: 
            throw `Unknown delivery method \"${message.deliveryMethod}\"`;            
    }

    let activity = new NotificationActivity("NotificationServiceSentConfirmation", timestamp);
    client.publish("js-notifications-stats-topic", activity, {
        routingKey: "notifications.email.response",
        correlationId: properties.correlationId
    });
}