@open-automaton/automaton
=========================
A web scraping solution for ease of use, maintenance and (soon™) deployment. Compares favorably to Kapow(Now owned by Kofax).

It uses an XML based DSL which both defines the scraping process as well as the structure of the returned data.

*Not* GPLv3, nor will it ever be.

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

- **Cheerio**
    ```js
    const Automaton = require('@open-automaton/automaton');
    const AutomatonCheerioEngine = require('@open-automaton/cheerio-mining-engine');
    let results = await Automaton.scrape(
        './whitepages_people_search.xml',
        new AutomatonCheerioEngine()
    );
    ```
- **Puppeteer**
    ```js
    const Automaton = require('@open-automaton/automaton');
    const AutomatonPuppeteerEngine = require('@open-automaton/puppeteer-mining-engine');
    let results = await Automaton.scrape(
        './whitepages_people_search.xml',
        new AutomatonPuppeteerEngine()
    );
    ```
- **Playwright: Chromium**
    ```js
    const Automaton = require('@open-automaton/automaton');
    const AutomatonPlaywrightEngine = require('@open-automaton/playwright-mining-engine');
    let results = await Automaton.scrape(
        './whitepages_people_search.xml',
        new AutomatonPlaywrightEngine({type:'chromium'})
    );
    ```
- **Playwright: Firefox**
    ```js
    const Automaton = require('@open-automaton/automaton');
    const AutomatonPlaywrightEngine = require('@open-automaton/playwright-mining-engine');
    let results = await Automaton.scrape(
        './whitepages_people_search.xml',
        new AutomatonPlaywrightEngine({type:'firefox'})
    );
    ```
- **Playwright: Webkit**
    ```js
    const Automaton = require('@open-automaton/automaton');
    const AutomatonPlaywrightEngine = require('@open-automaton/playwright-mining-engine');
    let results = await Automaton.scrape(
        './whitepages_people_search.xml',
        new AutomatonPlaywrightEngine({type:'webkit'})
    );
    ```
- **JSDom**
    ```js
    const Automaton = require('@open-automaton/automaton');
    const AutomatonJSDomEngine = require('@open-automaton/jsdom-mining-engine');
    let results = await Automaton.scrape(
        './whitepages_people_search.xml',
        new AutomatonJSDomEngine()
    );
    ```
That's all it takes.

Let's take that apart and run it manually(in [puppeteer](https://www.npmjs.com/package/puppeteer) ) this time:

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
Let's build a scraper for intellius(requires [automaton-cli](https://www.npmjs.com/package/@open-automaton/automaton-cli)):

```bash
# fetch the full body of the form you are scraping
auto fetch https://www.intelius.com/people-search/ > search-form.html
# check the forms on the page
auto xpath "//form" search-form.html
# craft a selector which only selects the target form
auto xpath "//form[@name='people-search-form']" search-form.html
# select all the inputs you need to populate from this form
auto xpath "//form[@name='people-search-form']//input|//form[@name='people-search-form']//select" search-form.html
```
This results in:

```json
[
  '<input type="text" name="firstName" maxlength="30" value="" placeholder="Enter first name" class="validate">',
  '<input type="text" name="lastName" maxlength="30" value="" placeholder="Enter last name" class="validate">',
  '<input type="text" name="city" value="" placeholder="Enter city">',
  '<select class="state-select" name="state"> ... '
]
```
So now we have all the information we need about that form:

```xml
<go url="https://www.intelius.com/people-search/">
    <set form="people-search-form" target="firstName" variable="first"></set>
    <set form="people-search-form" target="lastName" variable="last"></set>
    <set form="people-search-form" target="city" variable="city"></set>
    <set form="people-search-form" target="state" variable="stateCode"></set>
    <go form="people-search-form">
        <set xpath="//section[@id='people']//div[@class='person']" variable="matches">
            <set xpath="//div[@class='name-and-address']/h4" variable="name"></set>
            <set xpath="//div[@class='name-and-address']//span[@class='phone']" variable="hasPhone"></set>
            <set xpath="//div[@class='name-and-address']//span[@class='education']" variable="hasPhone"></set>
            <set xpath="//div[@class='name-and-address']//div[@class='address']" variable="location"></set>
            <set xpath="//div[@class='name-and-address']//span[@class='display-age']" variable="age"></set>
            <![CDATA[more inputs farmed here]]>
        </set>
    </go>
    <emit variables="matches"></emit>
</go>
```

And because intellius uses cloudflare shenanigans to prevent you from scraping, you'll need to use the puppeteer engine.

Now reclaiming your own data is a little easier(or for that matter claiming someone elses, which shouldn't be legal, but is here in the US until we have an equivalent of the GDPR).

Scraper Actions
--------------------
```xml
<go>
```

### Available Attributes

- ```url``` : The url to load (if applicable)
- ```form``` : The form name, which is present on the currently fetched page
- ```method``` : This manually sets the form submission value<sup>*</sup>
- ```type``` : This sets the submission type for the form <sup>*</sup> Available values are: ```json```, ```application/json```, ```form```

<sup>*</sup> - Some engines that use the browser will only submit using the form configuration on the page and ignore these options.

```xml
<set>
```

### Available Attributes

- ```variable``` : The variable to set, or the variable we read from
- ```xpath``` : The [xpath](https://developer.mozilla.org/en-US/docs/Web/XPath) selector for the value
- ```regex``` : The [regex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) selector for the value
- ```form``` : This determines which form contains the settable inputs
- ```target``` : This is the selector for the form element to set

```xml
<emit>
```

[TBD]


Roadmap
-------

- [x] remove engines from core lib
- [x] puppeteer engine
- [x] playwright engine
- [x] jsdom engine
- [ ] emit action
- [x] command-line app
- [ ] attributes: until-exists, timeout, delay
- [ ] support images in select
- [ ] strip-mine (work clustering)
- [ ] monitoring
- [ ] GUI app for scraper maintenance and command/control
- [ ] cleanup
- [ ] phantomjs engine (only because it's nearly ready)
- [ ] chrome-browser-plugin engine
- [ ] selenium engine
- [ ] other languages (PHP, Java, Rust... )

A note on the former life of the library:

This was just rewritten from Scratch so I could get rid of the GPL attribution.

Where did this come from?
-------------------------

This technique was created to combat information traders who sell your personal information. Dating all the way back to Yahoo's "kevdb" database, which was then augmented at Microsoft and Infospace, then fragmented into a wide array of little companies(Intellius, whitepages, etc... all powered by this database), the Merlin database and later (after the intelligence community wanted into this pool) Axciom. They rebuild their databases (thus nullifying your "removal" request) monthly or quarterly, so I needed a robust monitoring and interaction solution that was simple enough to maintain that I could train people in XML, regex and xpath then give them the tools to maintain scripts. This is why the examples refer to real-world cases monitoring or removing your presence in these lists.

Automaton(and later, strip-mine) started out as a formalization of these techniques I have been using to scrape the web for almost a decade now, but as I ported it to JS from PHP & Java, a CTO surprised me with some requirements: GPLv3 and a non generalizable server configuration. I realized there were only 4 sources to scrape once per quarter (In other words: they had no need for scrapers in the first place, much less those designed to be a continual data conduit and minimize breakage). They also did not realize the patent implications of using GPLv3 and promptly buried it. Afterwards, it became frozen in time.

I've been continually taking questions about it recently, so it was worthwhile to update some even older code to replace the strip-mine ecosystem.

Testing
-------
You can run the mocha test suite with:

```bash
    npm run test
```

Enjoy,

-Abbey Hawk Sparrow
