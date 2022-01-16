@open-automaton/automaton
=========================
A web scraping solution for ease of use, maintenance and (soon™) deployment. Compares favorably to Kapow(Now owned by Kofax).

It uses an XML based DSL which both defines the scraping process as well as the structure of the returned data.

*Not* GPLv3, nor will it ever be.

Usage
-----
Here we're going to submit a form to whitepages.com (this definition is a few years old) and harvest the results:

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
That's all it takes, if you need a [different usage pattern](docs/detailed-usage.md) that is supported as well.

Scraper Actions
--------------------
### go
A progression from page to page, either by loading a url, submitting a form or clicking a UI element requires either `url` or `form`

`type` accepts ```json```, ```application/json``` or ```form```

Some engines that use the browser will only submit using the form configuration on the page and ignore the `method` and `type` options.

```xml
<go
    url="https://domain.com/path/"
    form="form-name"
    method="post"
    type="application/json"
></go>
```

### set
Either use a variable to set a target input on a form or set a variable using an [xpath](https://developer.mozilla.org/en-US/docs/Web/XPath) or [regex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)

```xml
<set
    variable="variable-name"
    xpath="//xpath/expression"
    regex="[regex]+.(expression)"
    form="form-name"
    target="input-element-name"
></set>
```
### emit
emit a value to the return and optionally post that value to a remote url

```xml
<emit
    variables="some,variables"
    remote="https://domain.com/path/"
></emit>
```

[TBD]

Maintaining Scrapers
--------------------
First you'll want to understand [xpath](https://en.wikipedia.org/wiki/XPath) (and probably [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model), [regex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) and [css selectors](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors)) before we proceed, as most of the selectors in a good definition are xpath which is as general as possible.

Once you're done with that, the `auto` command( get by installing [`@open-automaton/automaton-cli`](https://www.npmjs.com/package/@open-automaton/automaton-cli)) has a few useful functions:

### `auto fetch`
You want to scrape the *state* of the DOM once the page is loaded, but if you use a tool like `CURL` you'll only get the *transfer state* of the page, which is probably not useful. `auto fetch` pulls the state of the DOM out of a running browser and displays that HTML.

```bash
# fetch the full body of the form you are scraping and save it in page.hml
auto fetch https://domain.com/path/ > page.html
```
### `auto xpath`
The first thing you might do against the HTML you've captured is pull all the forms out of the page, like this:
```bash
# check the forms on the page
auto xpath "//form" page.html
```

Assuming you've identified the form name you are targeting as `my-form-name`, you then want to get all the inputs out of it with something like:

```bash
# select all the inputs you need to populate from this form:
auto xpath "//form[@name='my-form-name']//input|//form[@name='my-form-name']//select|//form[@name='my-form-name']//textarea" page.html
```

### `auto run`
From this you should be able to construct a primitive scrape definition(See the examples below for more concrete instruction). Once you have this definition you can do sample scrapes with:

```bash
TBD
```

Examples of building scrapers:

- [Scraping Google](docs/google.md)
- [Scraping Intellius](docs/intellius.md)

Deployment
----------
[TBD]

Roadmap
-------

- [x] remove engines from core lib
- [x] puppeteer engine
- [x] playwright engine
- [x] jsdom engine
- [x] emit action
- [x] command-line app
- [ ] attributes: until-exists, timeout, delay
- [ ] support images in select
- [ ] proxy support
- [ ] strip-mine (work clustering)
- [ ] monitoring
- [ ] GUI app for scraper maintenance and command/control
- [ ] cleanup
- [ ] phantomjs engine (only because it's nearly ready)
- [ ] chrome-browser-plugin engine
- [ ] selenium engine
- [ ] other languages (PHP, Java, Rust... )

[Where did this come from?](docs/history.md)

Testing
-------
You can run the mocha test suite with:

```bash
    npm run test
```

Enjoy,

-Abbey Hawk Sparrow
