class MessageTypeA {
    
    constructor(foo, bar) {        
        this.$messageType = MessageTypeA.$messageType;
        this.Foo = foo;
        this.Bar = bar;        
    }

    static get $messageType() {
        return "MessageTypeA";
    }
}

module.exports = MessageTypeA;