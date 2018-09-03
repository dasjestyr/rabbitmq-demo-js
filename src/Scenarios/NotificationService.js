const rmq = require("../RabbitMQClient/DASRabbitMQClient")
const msg = require("./Messages")

let client = new rmq("amqp://user:bitnami@localhost", "js-notification-service")
client.start().then(r => {
    console.debug("Notification service bus started.");

    // subscriptions

    // register handlers
    client.registerHandler(msg.NotificationRequest.$messageType, handleNotificationRequest);
});

/** HANDLERS */

function handleNotificationRequest(message, properties) {
    console.debug(`Processing request ${properties.correlationId}`);
    let timestamp = new Date(Date.now());
    switch(message.deliveryMethod){
        case "Email":
            // ... call Email logic            
            let emailSent = new msg.NotificationSentEvent(timestamp);
            client.publish("js-notifications-topic", emailSent, {
                routingKey: "request.email.response", 
                correlationId: properties.correlationId
            });
            break;
        case "SMS":
            // ... call SMS logic            
            let smsSent = new msg.NotificationSentEvent(timestamp);
            client.publish("js-notifications-topic", smsSent, {
                routingKey: "request.sms.response", 
                correlationId: properties.correlationId
            })    ;        
            break;
        default: 
            throw `Unknown delivery method \"${message.deliveryMethod}\"`;            
    }

    let activity = new msg.NotificationActivity("NotificationServiceSentConfirmation", timestamp);
    client.publish("js-notifications-stats-topic", activity, {
        routingKey: "notifications.email.response",
        correlationId: properties.correlationId
    });
}