Scraping Intellius
==================

[Intellius](https://www.crunchbase.com/organization/intelius) is the primary mover in creepy data siphoning companies... it started with a database the original author did not build, but imported from yahoo to microsoft (in a burst of incompetence, it even had a **named subdomain** at infospace), then rebuilt as a series of primitive personal information sites. Now they're a full blown persona vendor, like Axciom or Merlin(who used decades of your financial or mail order habits to assemble *their* data).

And *surprise* any of the companies who claim to remove you actually only remove you while you pay, then add you back to the lists when you don't. So you are **only** signing up to make the problem worse.

So if you're unable to submit 30 removal requests (~2 work days worth of work, per month), there's **literally** nothing you can do. Even worse if I create a startup to fight this abuse, The MoTo catalogs will come in with an exclusive agreement that prevents the user from leaving with a clean record or they'll actively deny any attempts to enhance users ability to remove themselves. So the product will only work as advertised prior to that.

🤢🤮

So let's build something to fight this, in such a way it cannot be co-opted or bypassed.

Now that we're properly motivated, lets build a scraper(requires [automaton-cli](https://www.npmjs.com/package/@open-automaton/automaton-cli)):

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
