@open-automaton/automaton
=========================
A web scraping solution for ease of use, maintenance and (soon™) deployment. Compares favorably to Kapow(Now owned by Kofax).

It uses an XML based DSL which both defines the scraping process as well as the structure of the returned data.

Usage
-----
Here we're going to submit a form to whitepages.com and harvest the results:

```xml
<go url="http://www.whitepages.com/person">
    <set form="findperson_basic" target="firstname" variable="first_name"></set>
    <set form="findperson_basic" target="name" variable="last_name"></set>
    <set form="findperson_basic" target="where" variable="city_state"></set>
    <go form="findperson_basic">
        <set xpath="//ul.speedbump_query_data" variable="matches">
            <set xpath="//li.speedbump_query_info/div.name/a" variable="name"></set>
            <set xpath="//li.speedbump_query_info/div.age/a" variable="age"></set>
            <set xpath="//li.speedbump_query_info/div.location/a" variable="location"></set>
        </set>
        <set xpath="//div.pse_track" variable="corrections">
            <set xpath="//li.basic_info/a.name" variable="name"></set>
            <set xpath="//li.basic_info/div" variable="age"></set>
            <set xpath="//li.location/strong" variable="location"></set>
            <set xpath="//li.household" variable="household"></set>
        </set>
    </go>
    <emit variables="matches,corrections"></emit>
</go>
```

Now that we have a definition, we'll need to run it:

```js
const Automaton = require('@open-automaton/automaton');
const AutomatonCheerioEngine = require('@open-automaton/cheerio-mining-engine');

fs.readFile('./whitepages_people_search.xml', (err, body)=>{
    let scraper = new Automaton(
        body.toString(),
        new AutomatonCheerioEngine()
    );
    scraper.run((err, data)=>{
        //data is the scraped data, structured according to the definition
    });
});
```
That's all it takes.

If you wanted to run it inline, it's even simpler(we'll do it in [puppeteer](https://www.npmjs.com/package/puppeteer) this time):

```js
const Automaton = require('@open-automaton/automaton');
const AutomatonPuppeteerEngine = require('@open-automaton/puppeteer-mining-engine');

(new Automaton(
    `<go url="http://www.whitepages.com/person">
        <set form="findperson_basic" target="firstname" variable="first_name"></set>
        <set form="findperson_basic" target="name" variable="last_name"></set>
        <set form="findperson_basic" target="where" variable="city_state"></set>
        <go form="findperson_basic">
            <set xpath="//ul.speedbump_query_data" variable="matches">
                <set xpath="//li.speedbump_query_info/div.name/a" variable="name"></set>
                <set xpath="//li.speedbump_query_info/div.age/a" variable="age"></set>
                <set xpath="//li.speedbump_query_info/div.location/a" variable="location"></set>
            </set>
            <set xpath="//div.pse_track" variable="corrections">
                <set xpath="//li.basic_info/a.name" variable="name"></set>
                <set xpath="//li.basic_info/div" variable="age"></set>
                <set xpath="//li.location/strong" variable="location"></set>
                <set xpath="//li.household" variable="household"></set>
            </set>
        </go>
        <emit variables="matches,corrections"></emit>
    </go>`,
    new AutomatonPuppeteerEngine()
)).run((err, data)=>{
    //data is the scraped data, structured according to the definition
});
```

Deployment
----------
[TBD]

Maintaining Scrapers
--------------------
[TBD]

Scraper Actions
--------------------
[TBD]


Roadmap
-------

- [ ] remove engines from core lib
- [ ] puppeteer engine
- [ ] jsdom engine
- [ ] command-line app
- [ ] strip-mine (work clustering)
- [ ] monitoring
- [ ] GUI app for scraper maintenance and command/control
- [ ] cleanup
- [ ] phantomjs engine (only because it's nearly ready)
- [ ] other languages (PHP, Java, Rust... )

A note on the former life of the library:

This was just rewritten from Scratch so I could get rid of the GPL attribution.

Where did this come from?
-------------------------

This technique was created to combat information traders who sell your personal information. Dating all the way back to Yahoo's "kevdb" database, which was then augmented at Microsoft and Infospace, then fragmented into a wide array little companies(Intellius, whitepages, all powered by this database, the Merlin database and later (after the intelligence community wanted into this pool) Axciom). They rebuild their databases (thus nullifying your "removal" request) monthly or quarterly, so I needed a robust monitoring and interaction solution that was simple enough to maintain that I could train people in XML, regex and xpath then give them the tools to maintain scripts. This is why the examples refer to real-world cases monitoring or removing your presence in these lists.

Automaton(and later, strip-mine) started out as a formalization of a set of techniques I have been using to scrape the web for almost a decade now, but as it turned out the CTO surprised me with some requirements: GPLv3 and a very specific server configuration.  Later we realized there were only 4 sources to scrape once per quarter (In other words: they had no need for scrapers in the first place, much less those designed to be a continual data conduit and minimize breakage). They also did not realize the patent implications of using GPLv3 and promptly buried it. Afterwards, it became frozen in time.

I've been continually taking questions about it recently about it and similar setups, so it was worthwhile to update some even older code to replace the strip-mine ecosystem.

Testing
-------
```bash
    ./node_modules/mocha/bin/mocha
```

Enjoy,

-Abbey Hawk Sparrow
