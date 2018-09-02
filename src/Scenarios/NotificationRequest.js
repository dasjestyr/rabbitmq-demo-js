class NotificationRequest {
    constructor(destination, body, deliveryMethod) {
        this.$messageType = NotificationRequest.$messageType;
        this.destination = destination;
        this.body = body;
        this.deliveryMethod = deliveryMethod;
    }

    static get $messageType() {
        return "NotificationRequest"
    }
}

module.exports = NotificationRequest;