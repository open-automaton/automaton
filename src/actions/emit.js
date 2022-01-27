const AutomatonAction = require('../automaton-action');
const request = require('postman-request');

let Automaton = { Actions:{} };
let formatLog = (message, level)=>{
    return '[ACTION: '+(
        Object.keys(Automaton.Actions)[0] || '?'
    ).toUpperCase()+'] '+ message;
}

Automaton.Actions.Emit = AutomatonAction.extend({
    initialize : function(engine, options){
        this.name = 'emit';
        if(!options) options = {};
        if(!options.target) options.target = 'lastFetch';
        AutomatonAction.prototype.initialize.call(this, engine, options);
    },
    act : function(environment, callback){
        if(this.engine.debug) this.log(
            formatLog(`${JSON.stringify(this.options)}`,
            this.log.levels.DEBUG
        ));
        if(this.options.variables){
            if(!environment['_emitted_']) environment['_emitted_'] = {};
            let varNames = this.options.variables.split(',').map((s)=> s.trim());
            varNames.forEach((varName)=>{
                if(environment[varName]){
                    environment['_emitted_'][varName] = environment[varName];
                }
            })
        }
        if(this.options.remote){
            request({
                uri : this.options.remote,
                method : 'POST',
                data : JSON.stringify(environment['_emitted_'])
            }, (err, req, body)=>{
                this.subactionsWithAttributes(environment, callback);
            });
        }else{
            this.subactionsWithAttributes(environment, callback);
        }
    }
});

module.exports = Automaton.Actions.Emit;
