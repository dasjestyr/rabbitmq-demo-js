const DASRabbitMQClient = require("./DASRabbitMQClient")

/**
 * Installer provides setup for RMQ and exposes some methods to allow for creating
 * topics and binding/subscribing this service to them.
 * 
 * TODO: look into TTL for queues and topics. Maybe have them delete themselves after
 * not having been connected to in so long. Otherwise there's no intuitive way to 
 * "unsubscribe" to anything in a service context like this.
 */
class Installer {
    
    /**
     * Initializes a new instance of DASRabbitMQClient
     * @param {DASRabbitMQClient} client 
     */
    constructor(client) {
        this._client = client;
    }

    /**
     * Installs this service's queues and exchange and binds them together.
     */
    install() {        
        this._declareServiceQueue();
        this._declareExchange(this._client._serviceName, 'fanout');
        this._bindServiceQueue();
    }

    _declareServiceQueue() {
        let name = this._client._serviceName;
        console.debug(`Declaring queue \"${name}\"...`);
        this._client._channel.assertQueue(name, {durable: true});
    }

    _declareExchange(name, type, options = {}) {
        console.debug(`Declaring exchange \"${name}\"...`)
        options.durable = true;
        this._client._channel.assertExchange(
            name, 
            type, 
            options)
    }
    
    _bindServiceQueue() {
        let name = this._client._serviceName;
        console.debug(`Binding queue \"${name}\" to exchange \"${name}\"...`)
        this._client._channel.bindQueue(
            name,
            name)
    }

    /**
     * Creates a topic or headers exchange. Use this during setup to setup a 
     * topic that this service will publish to This is just a semantic convenience 
     * method to help enforce how we use RMQ.
     * @param {string} name - name of the topic exchagne to create
     * @param {string} exchangeType - topic or headers
     */
    declareTopic(name, exchangeType = "topic") {
        if(exchangeType !== 'topic' && exchangeType !== 'headers')
            throw "Select topic or headers as an exchange type";

        console.debug(`Declaring ${exchangeType}-type topic \"${name}\"...`)
        this._declareExchange(name, exchangeType)
    }

    /**
     * Subscribes this service to a topic exchange
     * @param {string} exchangeName - The name of the topic exchange to which we will bind.
     * @param {object} options - Routing options (e.g. routingKey, headers, etc.). see RMQ docs for binding options.
     * @param {string} exchangeType - topic, fanout, headers, or direct
     */
    subscribeTopic(exchangeName, options, exchangeType = "topic") {
        if(options.routingKey && options.headers)
            throw "Cannot have both routing key and headers!"
        
        this.declareTopic(exchangeName, exchangeType);
        this._client._channel.bindExchange(
            this._client._serviceName,
            exchangeName, 
            options.routingKey, 
            options)
    }    
}

module.exports = Installer;