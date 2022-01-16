Automaton Detailed Usage
========================

Sometimes the simple version isn't what you want, so this space is reserved for alternate form of use.

Inline definition
-----------------
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
