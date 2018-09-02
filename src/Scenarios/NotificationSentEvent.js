
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

module.exports = NotificationSentEvent;