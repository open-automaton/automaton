#!/usr/bin/env node

let libs = {};
//dynamic index of lib references

/* function DOM(html, callback){
    switch(DOM.engine){
        case 'jsdom':
            if(!libs.jsdom){
                libs.jsdom = require("jsdom");
            }
            jsdom.env({
                html:html,
                done: function(errors, window){
                    jsdom.jQueryify(window, "http://code.jquery.com/jquery.js", function(){
                        if(callback) callback(window.$);
                    });
                }
            });
            break;
        case 'cheerio':
            if(!libs.cheerio){
                libs.cheerio = require('cheerio');
                libs.cheerio.prototype.contents = function(){
                    var nodes = [];
                    [].forEach.call(this, function(node){
                        node.children.forEach(function(childNode){
                            //childNode.innerHTML = childNode.data; //for compatible code
                            nodes.push(childNode);
                        });
                    });
                    return nodes;
                }
                libs.cheerio.prototype.forEach = function(callback){
                    this.each(function(index, item){ //stop the insanity!!
                        callback(item, index);
                    });
                }
            }
            $ = libs.cheerio.load(html);
            if(callback) callback($);
            break;
        default : throw(new Error('unknown mode'));
    }
    //todo: index
}
//TODO: set engine to class, with internal init logic rather than a switch
//      of known values
DOM.engine = 'cheerio';
DOM.next = function(node){
    if(!node) return;
    if(node.nextSibling) return node.nextSibling;
    if(node[0]) return DOM.next(node[0]);
    return node.next;
};
DOM.xpathText = function(selector, value){
    if(!libs.libxmljs) libs.libxmljs = require("libxmljs");
    var xmlDoc = libs.libxmljs.parseHtmlString(value);
    var result = xmlDoc.find(selector);
    var results = [];
    if(!Array.isArray(result)) result = [result];
    result.forEach(function(node){
        if(node) results.push(
            (node && node.toString && node.toString()) ||
            node
        );
    });
    return results;
};
DOM.regexText = function(selector, value){
    var filter = new RegExp(selector, 'g');
    var selection=[];
    var a;
    while(a=regexp.exec(filter, value)){
        if(a[1]) selection.push(a[1]);
        else selection.push(a[0]);
    }
    return selection;
};
DOM.previous = function(node){
    if(!node) return;
    if(node.nextSibling) return node.previousSibling;
    if(node[0]) return DOM.next(node[0]);
    return node.prev;
};
DOM.value = function(node){
    if(!node) return '';
    if(node.val) return node.val();
    if(node.data) return node.data;
    if(node.value) return node.value;
    //if(node.children && node.children[0] && node.children[0].type=='text' && node.children[0].data.trim()) return node.children[0].data;
    return node.nodeValue || '';
};
DOM.html = function(node, $){
    if(!node) return '';
    if(node.innerHTML) return node.innerHTML;
    if(node.html) return node.html();
    if(node.data) return node.data;
    if($) return $(node).html();
};
DOM.attr = function(node, attr, $){
    if(!node) return '';
    if(node.attribs) return node.attribs[attr];
    if(node.attr) return node.attr(attr);
    if(node.getAttribute) return node.getAttribute(attr);
    if($) return $(node).html();
};
DOM.hash = function(value){
    if(!libs.crypto) libs.crypto = require('crypto');
    return libs.crypto.createHash('md5').update(value).digest("hex");
};

var ob_id = function(ob){
    var id = '';
    Object.keys(ob).forEach(function(key){
        id += ob[key]+'';
    });
    return id;
}

var addReturnUnique = function(ob, list){
    var id = ob_id(ob);
    if(list.indexOf(id) !== -1) return false;
    list.push(id);
    return true;
}

var clone = require('clone');

module.exports = {
    DOM : DOM,
    combinations : function(data, omit){ //[]
        var combinations = {};
        var results = [];
        var noArrays = true;
        var ids = [];
        Object.keys(data).forEach(function(key){
            if(omit && omit.indexOf(key) !== -1) return;
            var item = data[key];
            if(typeof item == 'object'){
                noArrays = false;
                // either an id (a range)
                try{
                    if(item.length != 2) throw('array not 2 long, skip to iterator');
                    var lower = parseInt(item[0]);
                    var upper = parseInt(item[1]);
                    for(var lcv=lower; lcv < upper; lcv++){
                        (function(){
                            var copy = clone(data);
                            copy[key] = lcv;
                            var combinations = module.exports.combinations(copy, omit);
                            combinations.forEach(function(item){
                                if(addReturnUnique(item, ids)) results.push(item);
                            });
                        })();
                    }
                // or a fixed set
                }catch(ex){
                    item.forEach(function(value){
                        var copy = JSON.parse(JSON.stringify(data));
                        copy[key] = value;
                        var combinations = module.exports.combinations(copy, omit);
                        combinations.forEach(function(item){
                            if(addReturnUnique(item, ids)) results.push(item);
                        });
                    });
                }
            }
        });
        if(noArrays) results.push(data);
        return results;
    }
};*/

module.exports = require('@open-automaton/automaton-engine/src/dom-tool.js');
