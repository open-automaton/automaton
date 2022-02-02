const AutomatonAction = require('../automaton-action');
const libxmljs = require("libxmljs");
var parseURL = require('url-parse');
const carlton = require('carlton');

let Automaton = { Actions:{} };

let xPathFor = (selector)=>{
    switch(selector[0]){
        case '/' : return selector;
        case '@' : return `//form[${selector}]`
        default : return `//form[@name='${selector}']`
    }
}

Automaton.Actions.Go = AutomatonAction.extend({
    initialize : function(engine, options){
        this.name = 'go';
        if(!options) options = {};
        if(typeof options === 'string') options = {url:options};
        if(!options.target) options.target = 'lastFetch';
        AutomatonAction.prototype.initialize.call(this, engine, options);
    },
    act : function(environment, callback){
        let options = carlton(this.options, environment);
        this.log(`start`, this.log.levels.DEBUG, options);
        var subactions = this.subactions;
        if(options.form){
            let formSelector = xPathFor(options.form);
            var xmlDoc = libxmljs.parseHtmlString(environment.lastFetch);
            let selection = xmlDoc.find(formSelector)[0];
            let input = null;
            let action = (
                selection.attr('action') &&
                selection.attr('action').value()
            );
            let method = ((
                selection.attr('method') &&
                selection.attr('method').value()
            ) || 'POST').toUpperCase();
            var parsed = parseURL(environment.url);
            if(action[0] !== '/'){
                //TODO: better path joining
                action = parsed.path + action
            }
            parsed.set('pathname', action);
            let submit = xmlDoc.find(
                `${xPathFor(options.form)}//input[@type='submit']`
            )[0];
            let passableData = environment.forms &&
                environment.forms[options.form];
            this.engine.fetch({
                referer: environment.url,
                url : parsed.href,
                data: passableData,
                type: options.type || 'FORM',
                method: method,
                form: options.form,
                submit: submit?submit.attr('name').value():null
            }, (data)=>{
                environment.url = parsed.href;
                environment[options.target] = data.toString();
                this.subactionsWithAttributes(environment, callback);
            });
        }
        if(options.url && !options.form){
            this.engine.fetch({
                url : options.url
            }, (data)=>{
                if(!data) throw new Error('No fetch data from: '+options.url);
                environment.url = options.url;
                environment[options.target] = data.toString();
                this.subactionsWithAttributes(environment, callback);
            });
        }
    }
});

module.exports = Automaton.Actions.Go;
