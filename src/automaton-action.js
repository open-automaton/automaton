const makeMergedCopyAndExtendify = require('./extendify');
const Emitter = require('extended-emitter');
const Arrays = require('async-arrays');

let Automaton = {};

Automaton.Action = function(engine, opts){
    if(this === undefined) throw new Error('no context!');
    this.options = opts || {};
    this.children = [];
    this.parallel = false;
    this.initialize(engine, this.options);
    (new Emitter).onto(this);
}

Automaton.Action.extend = function(cls, cns){
    var cons = cns || function(){
        Automaton.Action.apply(this, arguments);
        return this;
    };
    return makeMergedCopyAndExtendify(cls, cons, Automaton.Action);
};

Automaton.Action.prototype.initialize = function(engine, options){
    this.engine = engine;
    this.options = options || {};
};
Automaton.Action.prototype.subaction = function(action){
    this.children.push(action);
};
Automaton.Action.prototype.eachChild = function(fn){
    array.forEach(this.children, function(value){
        fn(value);
    });
};
Automaton.Action.prototype.profile = function(indent){
    if(!indent) indent = '';
    console.log(indent+'['+this.name+JSON.stringify(this.options)+']');
    this.eachChild(function(child){
        child.profile(indent+'   ');
    });
};
const timeoutByUnit = (value)=>{
    let trimmed = value.trim();
    let number = parseInt(value);
    let unit = trimmed.substring(number.toString().length).trim().toLowerCase();
    console.log(number, unit);
    switch(unit){
        case 's':
        case 'seconds':
        case 'second':
            return 1000 * number;
        case 'm':
        case 'minute':
        case 'minutes':
            return 1000 * 60 * number;
    }
}
Automaton.Action.prototype.subactionsWithAttributes = function(environment, callback){
    let timedout = false;
    let terminated = true;
    let intervalLength = 3000; //every 3 seconds
    if(this.options['until-exists']){
        let interval = setInterval(()=>{
            let results = DOM.xpath(
                this.options['until-exists'],
                environment.lastFetch
            );
            if(results && results.length && !timedout){
                clearInterval(interval);
                this.subactions(environment, callback)
            }
        }, intervalLength);
    }else{
        this.subactions(environment, callback)
    }
    //todo: make this start from fetch, not return
    let start = Date.now();
    if(this.options.timeout){
        let timeInMillis = timeoutByUnit(this.options.timeout);
        let interval = setInterval(()=>{
            if(terminated) return clearInterval(interval);
            if( (Date.now()-start) >= timeInMillis){
                timedout = true;
            }
        }, intervalLength);
    }
}
Automaton.Action.prototype.subactions = function(environment, callback){
    if(this.parallel){
        var count = 0;
        var results = {};
        this.eachChild(function(child){
            count++;
            child.act(environment, function(){
                count--;
                Object.keys(environment).forEach((key)=>{
                    results[key] = environment[key];
                });
                if(count == 0) callback(results);
            });
        });
        if(this.children.length == 0 && count == 0) callback(environment);
    }else{
        var results = {};
        if(this.children){
            Arrays.forEachEmission(this.children, function(child, index, emit){
                if(!child){
                    throw new Error('Encountered null child on iteration '+index);
                }
                child.actWithAttributes(environment, function(res){
                    Object.keys(environment).forEach((key)=>{
                        results[key] = environment[key];
                    });
                    emit();
                });
            }, function(){
                callback(results);
            });
        }else{
            callback(results);
        }
    }
};

Automaton.Action.prototype.act = function(environment, callback){
    this.subactions(environment, callback);
};

Automaton.Action.prototype.actWithAttributes = function(environment, callback){
    if(this.options.delay){
        let parts = this.options.delay.split('-').map((s)=>s.trim());
        let bottom = timeoutByUnit(parts[0]);
        let top = timeoutByUnit(parts[0] || parts[1]);
        let timeout = Math.floor(Math.random() * (top-bottom));
        return setTimeout(()=>{
            this.act(environment, callback);
        }, timeout)
    }else{
        this.act(environment, callback);
    }
};

Automaton.Action.prototype.hasChildren = function(){
    return this.children && this.children.length > 0;
};
module.exports = Automaton.Action;
