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


class NotificationSentEvent {
    /**
     * 
     * @param {Date} sentDate 
     */
    constructor(sentDate) {
        this.$messageType = NotificationSentEvent.$messageType;
        this.sentDate = sentDate;
    }

    static get $messageType() {
        return "NotificationSentEvent";
    }
}

class ProcessConfirmationRequest {
    constructor(sentDate){
        this.$messageType = ProcessConfirmationRequest.$messageType;
        this.sentDate = sentDate;
    }

    static get $messageType() {
        return "ProcessConfirmationRequest"
    }
}

class NotificationActivity {
    constructor(activityType, timestamp) {
        this.$messageType = NotificationActivity.$messageType;
        this.activityType = activityType;
        this.timestamp = timestamp;
    }

    static get $messageType() {
        return "NotificationActivity";
    }
}


module.exports = {
    NotificationRequest,
    NotificationSentEvent,
    ProcessConfirmationRequest,
    NotificationActivity
};