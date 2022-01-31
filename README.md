@open-automaton/automaton
=========================
<img align="left" src="docs/automaton.png">
A web scraping/[RPA](https://en.wikipedia.org/wiki/Robotic_process_automation) solution for ease of use, maintenance and (soon™) deployment. It uses an [XML](https://en.wikipedia.org/wiki/XML) based [DSL](https://en.wikipedia.org/wiki/Domain-specific_language) which both defines the scraping process as well as the structure of the returned data. It compares favorably to [uipath](https://www.uipath.com/learning/video-tutorials/workflow-automation-uipath-studio), [Blue Prism ALM](https://bpdocs.blueprism.com/hub-interact/4-3/en-us/alm/alm-process-definitions.htm?tocpath=Plugins%20and%20Tools%7CAutomation%20Lifecycle%20Management%20(ALM)%7CALM%20%E2%80%93%20Process%20definitions%7C_____0), [Kapow(Now Kofax RPA)](https://www.kofax.com/products/rpa) and [apify](https://sdk.apify.com/). These solutions make the work of building and maintaining scrapers infinitely easier than directly using a primary scraping solution(like [playwright](https://playwright.dev/), [puppeteer](https://github.com/puppeteer/puppeteer), [jsdom](https://github.com/jsdom/jsdom), [cheerio](https://www.npmjs.com/package/cheerio), [selenium](https://www.selenium.dev/), [windmill](https://getwindmill.com/), [beautifulsoup](https://pypi.org/project/beautifulsoup4/) or others).

Usage
-----
Here we're going to do a simple scrape of unprotected data on craigslist(you should use their available [RSS feed](https://www.craigslist.org/about/rss) instead, but it serves as an excellent example for how to harvest results and works in all the engines):

```xml
<go url="https://sfbay.craigslist.org/search/apa">
    <set xpath="//li[@class='result-row']" variable="matches">
        <set
            xpath="//time[@class='result-date']/text()"
            variable="time"
        ></set>
        <set
            xpath="//span[@class='result-price']/text()"
            variable="price"
        ></set>
        <set
            xpath="//span[@class='housing']/text()"
            variable="housing"
        ></set>
        <set
            xpath="string(//img/@src)"
            variable="link"
        ></set>
    </set>
    <emit variables="matches"></emit>
</go>
```

<table><tr><td colspan="3">

`automaton` definitions can be used in whatever context they are needed: from the command line, your own code *or* from a GUI (Soon™).
</td></tr><tr><td valign="top">
<details><summary> In Code </summary><p>

<!-- SUBTABLE -->
<table>
<!-- STEP 1 -->
<tr><td><details><summary> First, import automaton </summary><p>

```js
const Automaton = require('@open-automaton/automaton');
```

</p></details></td></tr>
<!-- STEP 2 -->
<tr><td><details><summary> Then Import the mining engine you want to use </summary><p>

- **Cheerio**
    ```js
    const MiningEngine = require('@open-automaton/cheerio-mining-engine');
    let myEngine = new MiningEngine();
    ```
- **Puppeteer**
    ```js
    const Engine = require('@open-automaton/puppeteer-mining-engine');
    let myEngine = new MiningEngine();
    ```
- **Playwright: Chromium**
    ```js
    const Engine = require('@open-automaton/playwright-mining-engine');
    let myEngine = new MiningEngine({type:'chromium'});
    ```
- **Playwright: Firefox**
    ```js
    const Engine = require('@open-automaton/playwright-mining-engine');
    let myEngine = new MiningEngine({type:'firefox'});
    ```
- **Playwright: Webkit**
    ```js
    const Engine = require('@open-automaton/playwright-mining-engine');
    let myEngine = new MiningEngine({type:'webkit'});
    ```
- **JSDom**
    ```js
    const Engine = require('@open-automaton/jsdom-mining-engine');
    let myEngine = new MiningEngine();
    ```

</p></details></td></tr>
<!-- STEP 3 -->
<tr><td><details><summary> Last you need to do the scrape(in an `async` function) </summary><p>

```js
let results = await Automaton.scrape('definition.xml', myEngine);
```
That's all it takes, if you need a [different usage pattern](docs/detailed-usage.md) that is supported as well.

</p></details></td></tr>

</table>
<!-- END SUBTABLE -->

</p></details></td><td valign="top">

<details><summary> CLI </summary><p>

```bash
    npm install -g automaton-cli
    auto --help
```

</p></details></td><td valign="top">

<details><summary> GUI </summary><p>

[TBD]

</p></details></td></tr></table>

Scraper Actions
--------------------

<table>
<tr><td> The automaton DSL is centered around 3 actions which navigate and populate the returned dataset. Many attributes are common to all elements, and most common use cases are covered.</td></tr>
<!-- STEP 1 -->
<tr><td><details><summary> go </summary><p>

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

</p></details></td></tr>
<!-- STEP 2 -->
<tr><td><details><summary> set </summary><p>

Either use a variable to set a target input on a form or set a variable using an [xpath](https://developer.mozilla.org/en-US/docs/Web/XPath) or [regex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions). Lists are extracted by putting `set`s inside another `set`

```xml
<set
    variable="variable-name"
    xpath="//xpath/expression"
    regex="[regex]+.(expression)"
    form="form-name"
    target="input-element-name"
></set>
```

</p></details></td></tr>
<!-- STEP 3 -->
<tr><td><details><summary> emit </summary><p>

emit a value to the return and optionally post that value to a remote url

```xml
<emit
    variables="some,variables"
    remote="https://domain.com/path/"
></emit>
```

</p></details></td></tr>

</table>

Maintaining Scrapers
--------------------
Here's a basic process for data behind a simple form
<table>
<tr><td>

First you'll want to understand [xpath](https://en.wikipedia.org/wiki/XPath) (and probably [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model), [regex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) and [css selectors](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors)) before we proceed, as most of the selectors in a good definition are xpath which is as general as possible.

Once you're done with that, the `auto` command( get by installing [`@open-automaton/automaton-cli`](https://www.npmjs.com/package/@open-automaton/automaton-cli)) has a few operations we'll be using.

</td></tr>
<!-- STEP 1 -->
<tr><td><details><summary> 1) Save the form url </summary><p>
You want to scrape the *state* of the DOM once the page is loaded, but if you use a tool like `CURL` you'll only get the *transfer state* of the page, which is probably not useful. `auto fetch` pulls the state of the DOM out of a running browser and displays that HTML.

```bash
auto fetch https://domain.com/path/ > page.html
```
</p></details></td></tr>
<!-- STEP 2 -->
<tr><td><details><summary> 2) Target the form </summary><p>

The first thing you might do against the HTML you've captured is pull all the forms out of the page, like this:

```bash
auto xpath "//form" page.html
```
</p></details></td></tr>
<!-- STEP 3 -->
<tr><td><details><summary> 3) Target the inputs </summary><p>

Assuming you've identified the form name you are targeting as `my-form-name`, you then want to get all the inputs out of it with something like:

```bash
auto xpath-form-inputs "//form[@name='my-form-name']" page.html
```

Then you need to write selectors for the inputs that need to be set (all of them in the case of cheerio, but otherwise the browser abstraction usually handles those that are prefilled)

```xml
<set
    form="<form-selector>"
    target="<input-name>"
    variable="<incoming-value-name>"
></set>
```
</p></details></td></tr>
<!-- STEP 4 -->
<tr><td><details><summary> 4) Submit the filled form </summary><p>
 you just need to target the form element with:

 ```xml
 <go form="<form-selector>">
     <!-- extraction logic to go here -->
 </go>
 ```
</p></details></td></tr>
<!-- STEP 5 -->
<tr><td><details><summary> 5) Save the form results url  </summary><p>

Here you'll need to manually use your browser go to the submitted page and save the HTML by opening the inspector, then copying the HTML from the root element, then pasting it into a file.

</p></details></td></tr>
<!-- STEP 6 -->
<tr><td><details><summary> 6) Save result set groups </summary><p>

</p></details></td></tr>
<!-- STEP 7 -->
<tr><td><details><summary> 7) Save result set fields </summary><p>

</p></details></td></tr>

<tr><td>
From this you should be able to construct a primitive scrape definition(See the examples below for more concrete instruction). Once you have this definition you can do sample scrapes with:

```bash
auto scrape my-definition.auto.xml --data '{"JSON":"to","scrape":"with"}'
#data still TODO on CLI, but already working in the API call options
```
</td></tr>

</table>

Examples of building scrapers:

- [Scraping Craigslist](https://github.com/open-automaton/automaton/blob/master/docs/craigslist.md)
- [Scraping Google](https://github.com/open-automaton/automaton/blob/master/docs/google.md)
- [Scraping Intellius](https://github.com/open-automaton/automaton/blob/master/docs/intellius.md)

Deploying a Scraper
-------------------
[TBD]

Publishing a Definition
-----------------------
[TBD]

Roadmap
-------

- [x] remove engines from core lib
- [x] puppeteer engine
- [x] playwright engine
- [x] jsdom engine
- [x] emit action
- [x] command-line app
- [x] attributes: until-exists, timeout, delay
- [ ] support images in select
- [ ] proxy support
- [ ] robots.txt
- [ ] strip-mine (work clustering)
- [ ] monitoring
- [ ] GUI app for scraper maintenance, command/control and remote work (turing tests, etc)
- [ ] cleanup, conversion to async selectors
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
