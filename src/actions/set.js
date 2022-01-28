let AutomatonAction = require('../automaton-action');
const DOM = require('../dom-tool').DOM;
const Arrays = require('async-arrays');
const libxmljs = require("libxmljs");

let Automaton = { Actions:{} };

let xPathFor = (selector)=>{
    switch(selector[0]){
        case '/' : return this.options.form;
        case '@' : return `//form[${selector}]`
        default : return `//form[@name='${selector}']`
    }
}
let envSummary = (env)=>{
    let summary = {};
    Object.keys(env).forEach((key)=>{
        let result = null;
        switch(Array.isArray(env[key])?'array':(typeof env[key])){
            case 'array': result = env[key].map((item)=> envSummary(item)); break;
            case 'object': result = envSummary(env[key]); break;
            case 'string' : result = env[key].substring(0, 200); break;
            default : result = env[key];
        }
        if(result) summary[key] = result;
    });
    return summary;
}

Automaton.Actions.Set = AutomatonAction.extend({
    initialize : function(engine, options){
        this.name = 'set';
        if(!options) options = {};
        if(!options.variable) options.variable = 'lastFetch';
        if(!options.source) options.source = 'lastFetch';
        AutomatonAction.prototype.initialize.call(this, engine, options);
    },
    act : function(environment, callback){
        this.log(`start`, this.log.levels.DEBUG, envSummary(environment));
        let logEnvAndReturn = (result)=>{
            this.log('ENV', this.log.levels.DEBUG, envSummary(environment));
            callback(result);
        }
        var selection = null;
        if(this.options.variable && this.options.source){
            var value = environment[this.options.source];
            if(this.options.regex){
                selection = DOM.regexText(this.options.regex, value);
            }
            if(this.options.xpath){
                selection = DOM.xpathText(this.options.xpath, value);
            }
            var results = [];
            Arrays.forEachEmission((selection || []), (item, key, done)=>{
                this.subactionsWithAttributes({lastFetch:item}, (env)=>{
                    delete env.lastFetch;
                    delete env.lastSelection;
                    results.push(env);
                    if(!this.hasChildren()){
                        Object.keys(env).forEach((key)=>{
                            env[key] = env[key][0];
                        });
                    }
                    done();
                });
            }, ()=>{
                if(this.options.variable){
                    if(results.length !== 0 || selection){
                        if(results.length > 0 && this.hasChildren()){
                            environment[this.options.variable] = results;
                            environment['lastSelection'] = results;
                            logEnvAndReturn(results);
                        }else{
                            if(this.hasChildren()){
                                environment[this.options.variable] = selection;
                            }else{
                                environment[this.options.variable] = selection[0];
                            }
                            environment['lastSelection'] = selection;
                            let rtrn = environment[this.options.variable];
                            logEnvAndReturn(rtrn);
                        }
                    }else{
                        if(!environment.forms){
                            environment.forms = {};
                        }
                        if(!environment.forms[this.options.form] ){
                            environment.forms[this.options.form]  = {};
                        }
                        let formSelector = xPathFor(this.options.form);
                        var xmlDoc = libxmljs.parseHtmlString(value);
                        let formSelection = xmlDoc.find(formSelector)[0];
                        let input = null;
                        let action = 'GET';
                        if(selection){
                            input = formSelection.find(xPathFor(this.options.target))[0];
                            action = formSelection.attr('action') && formSelection.attr('action').value();
                        }
                        let method = ((
                            formSelection &&
                            formSelection.attr('method') &&
                            formSelection.attr('method').value()
                        ) || 'POST').toUpperCase();
                        environment.forms[this.options.form][this.options.target] =
                            environment[this.options.variable];
                        logEnvAndReturn(environment);
                    }
                }
            });
        }
    }
});

module.exports = Automaton.Actions.Set;
