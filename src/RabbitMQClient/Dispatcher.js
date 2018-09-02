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

        logDebug("Dispatcher is running...")
    }

    _registerHandler(messageType, callback) {
        this._handlers[messageType] = callback;
    }

    _onMessage(message) {
        
        try {
            
            let messageType = message.properties.headers["Type"];
            let json = message.content.toString();            

            if(!messageType)
                logError(`Could not determine message type. Message: ${json}.`)

            let messageObject = JSON.parse(json);
            delete messageObject.$messageType;
            let handler = this._handlers[messageType];    
            
            handler(messageObject, message.properties);
            this._client._channel.ack(message);
        } catch (e) {
            // TODO: place a retry limit and jitter backoff alg and move to error 
            // queue if we can't process it
            logError(`Handler failed ${e.message}. Nacking the message...`)
            this._client._channel.nack(message);
        }
    }
}

function logError(message) {
    console.error(`[AMQP-Dispatcher] ${message}`);
}

function logDebug(message) {
    console.debug(`[AMQP-Dispatcher] ${message}`);
}

module.exports = Dispatcher;