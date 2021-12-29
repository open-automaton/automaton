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
                child.act(environment, function(res){
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

Automaton.Action.prototype.hasChildren = function(){
    return this.children && this.children.length > 0;
};
module.exports = Automaton.Action;
