Scraping Craigslist
===================

Craiglist offers rss feeds of nearly every page on the site, so scraping is pointless, however their page structure is such that it makes for easy practice. So let's build an apartment scraper.

the process of building a google scraper

1. first fetch a copy of the search form page:
```bash
auto fetch https://sfbay.craigslist.org/search/apa > search-form.html
```
2. make a new definition for this fetch
```xml
<go url="https://sfbay.craigslist.org/search/apa">
    <!-- scrape logic to go here -->
</go>
```
3. now, work on a selector for the result rows
```bash
auto xpath "//li[@class='result-row']" goog-out.html
```

4. Update the definition with this selector
```xml
<go url="https://sfbay.craigslist.org/search/apa">
    <set xpath="//li[@class='result-row']" variable="matches">
        <!-- individual fields to go here -->
    </set>
    <emit variables="matches"></emit>
</go>
```
5. last you'll need to come up with column selectors for the values
    - time : `//time[@class='result-date']/text()`
    - price : `//span[@class='result-price']/text()`
    - housing : `//span[@class='housing']/text()`
    - link : `string(//img/@src)`
6. Now you can write the final definition
```xml
<go url="https://sfbay.craigslist.org/search/apa">
    <set xpath="//li[@class='result-row']" variable="matches">
        <set
            xpath="//time[@class='result-date']/text()"
            variable="time"
        ></set>
        <set
            xpath="//span[@class='result-meta']/span[@class='result-price']/text()"
            variable="price"
        ></set>
        <set
            xpath="//span[@class='result-meta']/span[@class='housing']/text()"
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

That's all there is until I add a paging feature.
