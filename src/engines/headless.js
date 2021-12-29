let AutomatonEngine = require('../automaton-engine');

let Automaton = {};

Automaton.WebkitEngine = AutomatonEngine.extend({
    makeReady : function(callback){
        this.ready = true;
        array.forEach(this.readyQueue, function(queuedFunction){
            queuedFunction();
        });
        this.readyQueue = [];
        if(callback) callback();
    },
    fetch : function(options, callback){
        if(!this.ready){
            var fetch = fn.bind(this.fetch, this);
            var cb = callback;
            array.push(this.readyQueue, function(){
                fetch(options, cb);
            });
            return;
        }
        if( (!callback) && type(options) == 'function'){
            callback = options;
            options = {};
        }
        if(type(options) == 'string') options = {url:options};
        if(!options.target) options.target = 'lastFetch';
        if(!options.headers) options.headers = {};
        this.browser.open(options.url, fn.bind(function(){
            this.browser.get('content', fn.bind(function(status, value){
                callback({result:value});
            }, this));
        }, this));
    },
    terminate : function(){
        Automaton.WebkitEngine.PhantomBrowser.exit();
    }
}, function(options){
    Automaton.Engine.call(this, options);
    this.ready = false,
    this.readyQueue = [];
    if(!options) options = {};
    var initializeBrowser = fn.bind(function(){
        Automaton.WebkitEngine.PhantomBrowser.createPage(fn.bind(function(status, browser){
            console.log('[WebKit]['+art.ansiCodes('Page Created', 'yellow')+']');
            this.browser = browser;
            this.makeReady(options.onReady);
        }, this));
    }, this);
    if(!Automaton.WebkitEngine.PhantomBrowser){
        phantom.create(fn.bind(function(err, browser){
            Automaton.WebkitEngine.PhantomBrowser = browser;
            console.log('[WebKit]['+art.ansiCodes('Started', 'yellow')+']');
            initializeBrowser();
        }, this));
        phantom.onError = function(msg, trace) {
            //todo: something better
            var msgStack = ['PHANTOM ERROR: ' + msg];
            if (trace) {
                msgStack.push('TRACE:');
                trace.forEach(function(t) {
                    msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function \'' + t.function + '\')' : ''));
                });
            }
            console.error(msgStack.join('\n'));
        };
    }else{
        initializeBrowser();
    }
});

module.exports = Automaton.WebkitEngine;
