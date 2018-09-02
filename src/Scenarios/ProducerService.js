const rmq = require("../RabbitMQClient/DASRabbitMQClient")
const NotificationRequest = require("./NotificationRequest")
const NotificationSentEvent = require("./NotificationSentEvent")

let client = new rmq("amqp://user:bitnami@localhost", "js-producer");
client.start().then(r => {
    console.debug("Producer is started.")

    // subscriptions
    client.subscribeTopic("js-notifications-topic", {routingKey: "#.response"});  
    
    // register handlers
    client.registerHandler(NotificationSentEvent.$messageType, handleNotificationSentEvent)

    runExamples();
});

function runExamples() {
    sendAnEmail("jon@winterfell.we", "You know nothing...")
}

function sendAnEmail(destination, body) {
    let notificationRequest = new NotificationRequest(destination, body, "Email");
    client.send("js-notification-service", notificationRequest) 
}

/** HANDLERS */

function handleNotificationSentEvent(message) {
    console.debug(`Email ${message.correlationId} was sent at ${message.sentDate}`);
}
