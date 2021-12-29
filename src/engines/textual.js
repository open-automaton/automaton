let AutomatonEngine = require('../automaton-engine');
const Emitter = require('extended-emitter');

const Browser = require("browser");

let Automaton = {};

Automaton.TextEngine = AutomatonEngine.extend({
    fetch : function(opts, cb){
        let callback = cb;
        let options = opts;
        if( (!cb) && typeof opts == 'function'){
            callback = opts;
            options = {};
        }
        if(typeof options === 'string') options = {url:options};
        if(!options.target) options.target = 'lastFetch';
        if(!options.headers) options.headers = {};
        //should return some kind of 'id';
        let selector = options.form?`form[name="${options.form}"]`:null;
        if(options.data){
            let browser = new Browser();
            let submitOptions = {
                from : options.url,
                selector: selector,
                data : options.data
            };
            console.log('>>>>', submitOptions);
            browser.browse('form-submit', options.referer, {debug: true});
            console.log('A');
            browser.browse(function(err, data){
                console.log('inB')
                if(err) return console.log(err);
                console.log('AA');
                return [options.url, {
                    data  : postdata, // set post data
                    method: options.method || "POST"
                }];
            }).after('form-submit');
            console.log('B');
            browser.on("end", function(err, out) {
                console.log('BB');
                console.log('||||', out.result);
                callback(out.result);
            });
            console.log('C');
        }else{
            this.browser.browse(options.url, function(err, data){
              callback(data.result);
            });
        }
    }
}, function(opts){
    this.browser = Browser;
    this.options = opts || {};
    this.children = [];
    (new Emitter).onto(this);
});

module.exports = Automaton.TextEngine;
