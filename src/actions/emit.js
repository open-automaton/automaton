let AutomatonAction = require('../automaton-action');

let Automaton = { Actions:{} };

Automaton.Actions.Emit = AutomatonAction.extend({
    initialize : function(engine, options){
        this.name = 'emit';
        if(!options) options = {};
        if(!options.target) options.target = 'lastFetch';
        AutomatonAction.prototype.initialize.call(this, engine, options);
    },
    act : function(environment, callback){
        //console.log(`[Action:Emit ${JSON.stringify(this.options)}]`);
        //console.log('[Action]['+art.ansiCodes('emit', 'yellow')+']');
        this.subactions(environment, callback);
    }
});

module.exports = Automaton.Actions.Emit;
