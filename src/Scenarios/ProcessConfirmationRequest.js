class ProcessConfirmationRequest {
    constructor(sentDate){
        this.$messageType = ProcessConfirmationRequest.$messageType;
        this.sentDate = sentDate;
    }
}

ProcessConfirmationRequest.$messageType = "ProcessConfirmationRequest";
module.exports = ProcessConfirmationRequest;