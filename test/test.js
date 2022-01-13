const should = require('chai').should();
const path = require('path');
const Automaton = require('../src/automaton');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const AutomatonPuppeteerEngine = require('@open-automaton/puppeteer-mining-engine');
const AutomatonCheerioEngine = require('@open-automaton/cheerio-mining-engine');

const canonical = require(
    '@open-automaton/automaton-engine/test/canonical-tests.js'
)(Automaton, should);

const cheerioEngine = new AutomatonCheerioEngine();
const puppeteerEngine = new AutomatonPuppeteerEngine();

describe('strip-mine', function(){
    describe('automaton runs with cheerio', function(){
        it('loads a canonical definition', function(done){
            canonical.loadDefinition(cheerioEngine, done);
        });

        it('scrapes a static page', function(done){
            canonical.staticScrape(cheerioEngine, done);
        });

        it('scrapes a form', function(done){
            canonical.formScrape(cheerioEngine, done);
        });
    });

    //TODO: make all test runnable as a suite, with clean termination
    describe.skip('automaton runs with puppeteer', function(){
        it('loads a canonical definition', function(done){
            canonical.loadDefinition(puppeteerEngine, done);
        });

        it('scrapes a static page', function(done){
            canonical.staticScrape(puppeteerEngine, done);
        });

        it('scrapes a form', function(done){
            canonical.formScrape(puppeteerEngine, done);
        });

        after(function(done){
            puppeteerEngine.cleanup((err)=>{
                if(err){
                    //HARD QUIT, it won't shut down
                    setTimeout(function(){
                        process.exit();
                    }, 100);
                } else done();
            })
        })
    });
});
