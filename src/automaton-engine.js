const makeMergedCopyAndExtendify = require('./extendify');

Automaton.Engine = function(opts){
    this.browser = require("browser");
    this.options = opts || {};
    this.children = [];
    (new Emitter).onto(this);
}

Automaton.Engine.prototype.fetch = function(){
    throw new Error('Cannot use base class as an implementation')
}

Automaton.Engine.prototype.terminate = function(){ };

Automaton.Engine.extend = function(cls, cns){
    var cons = cns || function(){
        Automaton.Engine.apply(this, arguments);
        return this;
    };
    return makeMergedCopyAndExtendify(cls, cons, Automaton.Engine);
};

module.exports = Automaton.Engine;
