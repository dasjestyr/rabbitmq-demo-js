const DASRabbitMQClient = require("./DASRabbitMQClient")

class Dispatcher {
    /**
     * 
     * @param {DASRabbitMQClient} client 
     */
    constructor(client) {
        this._client = client;
        this._handlers = {}
    }

    /**
     * Setup the listeners and begin consuming the queue.
     */
    start() {
        this._client._channel.consume(
            this._client._serviceName, 
            message => this._onMessage(message), 
            { noAck: false }); // require an ack
        console.debug("Dispatcher is running...")
    }

    /**
     * Registers a handler to run when a message of a particular type is received.
     * @param {string} messageType - The type of message that was serialized into the MessageType header.
     * @param {Function} callback - Function that will be called with the consumed message.
     */
    registerHandler(messageType, callback) {
        this._handlers[messageType] = callback;
    }

    _onMessage(message) {
        
        try {
            let headers = message.properties.headers;
            let messageType = headers["Type"];
            let json = message.content.toString();            

            if(!messageType)
                console.error(`Could not determine message type. Message: ${json}.`)

            let messageObject = JSON.parse(json);
            delete messageObject.$messageType;
            let handler = this._handlers[messageType];            
            handler(messageObject);
            this._client._channel.ack(message);
        } catch (e) {
            // TODO: place a retry limit and jitter backoff alg and move to error 
            // queue if we can't process it
            console.error(`Handler failed ${e.message}. Nacking the message...`)
            this._client._channel.nack(message);
        }
    }
}

module.exports = Dispatcher;