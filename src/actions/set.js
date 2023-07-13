let AutomatonAction = require('../automaton-action');
const DOM = require('../dom-tool').DOM;
const Arrays = require('async-arrays');
const libxmljs = require("libxmljs2");
const carlton = require('carlton');

let Automaton = { Actions:{} };

let xPathFor = (selector)=>{
    switch(selector[0]){
        case '/' : return selector;
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
        let options = carlton(this.options, environment);
        this.log(`start`, this.log.levels.DEBUG, envSummary(environment));
        let logEnvAndReturn = (result)=>{
            this.log('ENV', this.log.levels.DEBUG, envSummary(environment));
            callback(result);
        }
        var selection = null;
        if(options.variable && options.source){
            var value = environment[options.source];
            if(options.regex){
                selection = DOM.regexText(options.regex, value);
            }
            if(options.xpath){
                selection = DOM.xpathText(options.xpath, value);
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
                if(options.variable){
                    if(results.length !== 0 || selection){
                        if(results.length > 0 && this.hasChildren()){
                            environment[options.variable] = results;
                            environment['lastSelection'] = results;
                            logEnvAndReturn(results);
                        }else{
                            if(this.hasChildren()){
                                environment[options.variable] = selection;
                            }else{
                                environment[options.variable] = selection[0];
                            }
                            environment['lastSelection'] = selection;
                            let rtrn = environment[options.variable];
                            logEnvAndReturn(rtrn);
                        }
                    }else{
                        if(!environment.forms){
                            environment.forms = {};
                        }
                        if(!environment.forms[options.form] ){
                            environment.forms[options.form]  = {};
                        }
                        let formSelector = xPathFor(options.form);
                        var xmlDoc = libxmljs.parseHtmlString(value);
                        let formSelection = xmlDoc.find(formSelector)[0];
                        let input = null;
                        let action = 'GET';
                        if(selection){
                            input = formSelection.find(xPathFor(options.target))[0];
                            action = formSelection.attr('action') && formSelection.attr('action').value();
                        }
                        let method = ((
                            formSelection &&
                            formSelection.attr('method') &&
                            formSelection.attr('method').value()
                        ) || 'POST').toUpperCase();
                        environment.forms[options.form][options.target] =
                            environment[options.variable];
                        logEnvAndReturn(environment);
                    }
                }
            });
        }
    }
});

module.exports = Automaton.Actions.Set;
