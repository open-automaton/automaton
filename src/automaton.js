
const array = require('async-arrays');
const HTMLParser = require('html-parser');

Automaton = function(opts, engine){
    this.root = false;
    this.environment = opts.environment || {};
    let options = typeof opts == 'string'?{body:opts}:opts;
    if(options.body){
        var a = {stack : [], attributes : {}};
        HTMLParser.parse(options.body, {
            closeOpenedElement: function(name) {
                var node;
                switch(name){
                    case 'go':
                        node = new Automaton.Actions.Go(engine, a.attributes);
                        break;
                    case 'set':
                        node = new Automaton.Actions.Set(engine, a.attributes);
                        break;
                    case 'emit':
                        node = new Automaton.Actions.Emit(engine, a.attributes);
                        break;
                    default : throw('Unknown Tag');
                }
                a.attributes = {};
                if(a.current){
                    a.stack.push(a.current);
                    a.current.subaction(node);
                }else if(!a.root){
                    a.root = node;
                }
                a.current = node;
            },
            closeElement: function(name) {
                a.current = a.stack.pop();
            },
            attribute: function(name, value) {
                a.attributes[name] = value;
            }
        });
        this.root = a.root;
    }else{

    };

}

Automaton.prototype.output =function(txt){
    console.log('[Automaton]['+art.ansiCodes(txt, 'yellow')+']');
}

Automaton.prototype.set = function(key, value){
    this.environment[key] = value;
}

Automaton.prototype.run = function(callback){
    if(this.root) this.root.actWithAttributes(this.environment, function(environment, error){
        if(error) return callback(error);
        callback(null, environment['_emitted_']?environment['_emitted_']:environment);
    });
}

Automaton.Actions = {
    Go : require('./actions/go'),
    Set : require('./actions/set'),
    Emit : require('./actions/emit'),
};

Automaton.Engines = {};

Automaton.Actions.each = function(){

};

Automaton.scrape = async function(definitionPath, engine){
    let result = await new Promise((resolve, reject)=>{
        fs.readFile(definitionPath, (err, body)=>{
            let scraper = new Automaton(
                body.toString(),
                engine
            );
            scraper.run((err, data)=>{
                if(err) return reject(err);
                resolve(data);
            });
        });
    });
    return result;
}

const Emitter = require('extended-emitter');


module.exports = Automaton;
