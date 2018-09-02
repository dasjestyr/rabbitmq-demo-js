class NotificationActivity {
    constructor(activityType, timestamp) {
        this.$messageType = NotificationActivity.$messageType;
        this.activityType = activityType;
        this.timestamp = timestamp;
    }
}

NotificationActivity.$messageType = "NotificationActivity";
module.exports = NotificationActivity;