class MessageTypeA {
    
    constructor(foo, bar) {        
        this.$messageType = MessageTypeA.$messageType;
        this.Foo = foo;
        this.Bar = bar;        
    }

    // there are probably some more elegant ways to 'tag' a class with 
    // it's textual name. Most of the solutiosn right now would break when 
    // the javascript is minimized, so this is all I could come up with
    // at the moment.

    static get $messageType() {
        return "MessageTypeA";
    }
}

module.exports = MessageTypeA;