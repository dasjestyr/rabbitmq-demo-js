
class NotificationSentEvent {
    /**
     * 
     * @param {Date} sentDate 
     * @param {string} correlationId 
     */
    constructor(sentDate, correlationId) {
        this.$messageType = NotificationSentEvent.$messageType;
        this.sentDate = sentDate;
        this.correlationId = correlationId;
    }

    static get $messageType() {
        return "NotificationSentEvent";
    }
}

module.exports = NotificationSentEvent;