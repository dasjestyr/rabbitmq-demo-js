const RabbitClient = require('./RabbitMQClient/DASRabbitMQClient')
const MessageTypeA = require('./MessageTypeA')

/* USAGE */

// create the client
var client = new RabbitClient("amqp://user:bitnami@localhost", "js-test");

// start the client - this will install all queues and exchanges as part of the startup
client.start().then(r => {    
    console.debug(`[AMQP] client is ${r}`);
    
    // setup any topic subscriptions
    client.subscribeTopic("js-topic-1", {routingKey: "#"}); // receive all messages

    // register handlers    
    client.Dispatcher.registerHandler(MessageTypeA.$messageType, messageTypeAHandler)
    client.Dispatcher.registerHandler("TypeB", messageTypeBHandler)

    // TESTS: publish to ourselves and see the handlers work

    // NOTE: use the metadata property type $messageType to describe your message
    // it will be used to find the correct handler. Here are a couple examples using
    // strong and weak types:

    // strong type - send to our direct queue
    let message = new MessageTypeA("Strong Type", "Hello World!"); // $messageType is part of the instance   
    client.publishLocal(message);

    // anononymous type - send to our direct queue
    client.publishLocal({$messageType: "TypeB", Prop1: "Anonymous Type", Prop2: "Hello world!"});

    // to topic - shows that our subscription is moving messages from the topic exchange
    // to our exchange. It doesn't matter who writes to the topic. 
    let topicMessage = new MessageTypeA("Topic message", "Hello world!");
    client.publish("js-topic-1", topicMessage, {routingKey: "some.key.you.choose"})
});

function messageTypeAHandler(message) {
    console.log(`Received message: ${JSON.stringify(message)}`);
}

function messageTypeBHandler(message) {
    console.log(`Received message: ${JSON.stringify(message)}`);
}