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

describe('Automaton', function(){

    describe('runs with cheerio', function(){

        it('loads a canonical definition', function(done){
            canonical.loadDefinition(cheerioEngine, done);
        });

        it('scrapes a static page', function(done){
            canonical.staticScrape(cheerioEngine, done);
        });

        it('scrapes a form', function(done){
            canonical.formScrape(cheerioEngine, done);
        });

        it('runs with a delay', function(done){
            this.timeout(5000);
            canonical.testDelayAttribute(cheerioEngine, done);
        });
    });

    //TODO: make all test runnable as a suite, with clean termination
    describe('runs with puppeteer', function(){
        it('loads a canonical definition', function(done){
            canonical.loadDefinition(puppeteerEngine, done);
        });

        it('scrapes a static page', function(done){
            this.timeout(10000);
            canonical.staticScrape(puppeteerEngine, done);
        });

        it('scrapes a form', function(done){
            this.timeout(10000);
            canonical.formScrape(puppeteerEngine, done);
        });

        it('runs with a delay', function(done){
            this.timeout(10000);
            canonical.testDelayAttribute(puppeteerEngine, done);
        });

        after(function(done){
            let cleanedUp = false;
            setTimeout(function(){
                if(!cleanedUp) process.exit();
            }, 10000);
            this.timeout(10100);
            puppeteerEngine.cleanup((err)=>{
                cleanedUp = true;
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
