const rmq = require("../RabbitMQClient/DASRabbitMQClient")
const NotificationRequest = require("../Scenarios/NotificationRequest")
const NotificationSentEvent = require("../Scenarios/NotificationSentEvent")

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
    switch(message.deliveryMethod){
        case "Email":
            // ... call Email logic            
            let emailSent = new NotificationSentEvent(new Date(Date.now()), properties.correlationId);
            client.publish("js-notifications-topic", emailSent, {routingKey: "request.email.response"});
            break;
        case "SMS":
            // ... call SMS logic            
            let smsSent = new NotificationSentEvent(new Date(Date.now()), properties.correlationId);
            client.publish("js-notifications-topic", smsSent, {routingKey: "request.sms.response"})    ;        
            break;
        default: 
            console.error(`Unknown delivery method \"${message.deliveryMethod}\"`);
            break;
    }
}