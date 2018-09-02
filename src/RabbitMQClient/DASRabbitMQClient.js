const Installer = require("./Installer");
const Dispatcher = require("./Dispatcher");
const xid = require("xid-js");

/**
 * The DASRabbitMQClient provides us an abstraction for working with RMQ and
 * meets the following high level requirements:
 *  - The application will install its own queues and exchanges on startup
 *    so that it is ready to go when deployed to any new environment, in a
 *    consistent, repeatable manner.
 *  - It provides a way to create new topics as well as subscribe to 
 *    existing ones.
 *  - It provides a topology that allows for sending messages directly to
 *    a service (through the use of a 1 to 1 exchange/queue default setup).
 *    if you want to send a message to a service, send it direct to that 
 *    service's exchange (same name as queue)
 *  - It provides a way to have more generalized topics to which anyone can
 *    subscribe by binding that service's exchange to the topic exchange.
 *  - It provides a handler registration pattern that allows the developer to
 *    still organize their code in any way they see fit. Handlers/callbacks
 *    simply need to be registered at startup.
 */
class DASRabbitMQClient {
    /**
     * 
     * @param {string} connectionString - The amqp connection string.
     * @param {string} serviceName - A unique name that describes this service. This will be used as the queue and exchange names.
     */
    constructor(connectionString, serviceName) {
        this._amqp = require('amqplib/callback_api');    
        this._connectionString = connectionString;
        this._serviceName = serviceName;    
    }

    /**
     * Ensure topology is configured and start the bus.
     * @return {Promise<string>}
     */
    start() {
        var self = this;        
        return new Promise(function (resolve, reject) {
            self._amqp.connect(self._connectionString, function(err, conn) {
                if(err) {
                    console.error(`[AMQP] ${err.message}`);
                    return setTimeout(() => self.start, 1000); // restart?
                }
    
                conn.on("error", function(err) {
                    if(err.message !== "Connection closing") {
                        console.error(`[AMQP] conn error ${err}`);
                    }
                })
    
                conn.on("close", function() {
                    console.error(`[AMQP] reconnecting`);
                    return setTimeout(() => self.start, 1000);
                })
    
                console.log(`[AMQP] connected!`);
                self._connection = conn;
                self._whenConnected(resolve);
            });
        })
    }

    _whenConnected(resolve) {
        var self = this;
        this._connection.createConfirmChannel(function(err, ch) {
                        
            ch.on("error", function(err) {
                console.error(`[AMQP] channel error ${err}`);
            })

            ch.on("close", function() {
                console.error(`[AMQP] channel closed.`)
            })

            self._channel = ch;

            self._installer = new Installer(self);
            self._installer.install();

            self.Dispatcher = new Dispatcher(self);
            self.Dispatcher.start();

            resolve("Loaded.");
        });
    }

    /**
     * Subscribe this service to a topic exchange
     * @param {string} exchangeName - the name of the topic to subscribe
     * @param {object} options - see RMQ docs for exchange options/args
     * @param {string} exchangeType - topic, fanout, headers, or direct
     */
    subscribeTopic(exchangeName, options, exchangeType = "topic") {
        this._installer.subscribeTopic(exchangeName, options, exchangeType);
    }


    /**
     * Sends a message direct to an exchange. Use this when you expect there to only
     * be a single consumer (commands).
     * @param {string} destination 
     * @param {object} message 
     */
    send(destination, message) {
        // TODO: check that destination is either direct or fanout exchange for semantic protection
        if(!destination || !message) {
            throw "sending requires both a destination and a message";
        }
        this._sendToBus(destination, message);
    }

    /**
     * Sends a message to the specified definition. Use this when you expect there could be more than
     * one consumer (events).
     * @param {string} destination - the name of the exchange to which this will be sent.
     * @param {object} message - the message object. Requires a $messageType metadata property.
     * @param {object} options - see RMQ docs for publish options.
     */
    publish(destination, message, options = {}) {
        // TODO: check that destination is either topic or headers exchange for semantic protection
        if(!destination){
            throw "publishing requires a destination exchange such as a topic";
        }
        if(!options.routingKey && !options.headers)
            throw "publishing requires some form of routing metadata such as routingKey or headers";
        
        this._sendToBus(destination, message, options);
    }    

    /**
     * Convenience method. Sends a message to *this* service's exchange. Use this when you want
     * to defer commands, etc.
     * @param {object} message 
     */
    publishLocal(message) {
        if(!message) {
            throw "cannot send null message";
        }
        this._sendToBus(this._serviceName, message);
    }

    _sendToBus(destination, message, options = {}){
        if(!message.$messageType)
            throw "Missing message type property";
        
        options.persistent = true;
        options.correlationId = xid.next();
        options.headers = {Type: message.$messageType}; // TODO merge with headers that are in options

        let messageJson = JSON.stringify(message);
        try {
            let buffer = Buffer.from(messageJson);
            
            this._channel.publish(
                destination, 
                options.routingKey, 
                buffer, 
                options, 
                function(err) {
                
                // TODO: place a retry limit and jitter backoff alg and move to error 
                // queue if we can't process it
            })
        } catch (e) {
            console.error(`[AMQP] publish error ${e.message}`);
            // TODO: place a retry limit and jitter backoff alg and move to error 
            // queue if we can't process it
        }
    }

    /**
     * Registers a handler to run when a message of a particular type is received.
     * @param {string} messageType - The type of message that was serialized into the MessageType header.
     * @param {Function} callback - Function that will be called with the consumed message.
     */
    registerHandler(messageType, callback) {
        this.Dispatcher._registerHandler(messageType, callback);
    }
}

module.exports = DASRabbitMQClient;