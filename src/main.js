const RabbitClient = require('./RabbitMQClient/DASRabbitMQClient')
const MessageTypeA = require('./MessageTypeA')

// create the client
var client = new RabbitClient("amqp://user:bitnami@localhost", "js-test");

// start the client
client.start().then(r => {    
    console.debug(`[AMQP] client is ${r}`);
    
    // setup topic subscriptions
    client.subscribeTopic("js-topic-1", {routingKey: "#"});

    // register handlers    
    client.Dispatcher.registerHandler(MessageTypeA.$messageType, messageTypeAHandler)
    client.Dispatcher.registerHandler("TypeB", messageTypeBHandler)

    // TESTS: publish to ourselves and see the handlers work

    // NOTE: use the metadata property type $messageType to describe your message
    // it will be used to find the correct handler. Here are a couple examples using
    // strong and weak types:

    // strong type
    let message = new MessageTypeA("Strong Type", "Hello World!");        
    client.publishLocal(message);

    // anononymous type
    client.publishLocal({$messageType: "TypeB", Prop1: "Anonymous Type", Prop2: "Hello world!"});
});

function messageTypeAHandler(message) {
    console.log(`Received message: ${JSON.stringify(message)}`);
}

function messageTypeBHandler(message) {
    console.log(`Received message: ${JSON.stringify(message)}`);
}