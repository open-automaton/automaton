Scraping Google
===============

Google claims the books you read, the things you are interested, the online purchases you make, your schedule, the places you travel and your upcoming itenary.

At the very least we can claw a little of that data back, whether to get search results, do SEO or getting entity metadata.

the process of building a google scraper

1. first fetch a copy of the search form page:
```bash
auto fetch https://www.google.com > search-form.html
```
2. make a new definition for this fetch
```xml
<go url="http://www.google.com/">
    <!-- form logic to go here -->
</go>
```
3. then find all forms
```bash
auto xpath "//form" search-form.html
```
4. target a specific form and you wind up with something like:
```bash
auto xpath "//form[@role='search']" search-form.html
```

5. now, let's extract all the form inputs
```bash
auto xpath "//form[@role='search']//input" search-form.html
```
and you get something like:
```json
[
    "<input class=\"gLFyf gsfi\" jsaction=\"paste:puy29d;\" maxlength=\"2048\" name=\"q\" type=\"text\" aria-autocomplete=\"both\" aria-haspopup=\"false\" autocapitalize=\"off\" autocomplete=\"off\" autocorrect=\"off\" autofocus=\"\" role=\"combobox\" spellcheck=\"false\" title=\"Search\" value=\"\" aria-label=\"Search\" data-ved=\"0ahUKEwjGnouyzrf1AhVrDjQIHTmsCpQQ39UDCAY\">",
    "<input class=\"gNO89b\" value=\"Google Search\" aria-label=\"Google Search\" name=\"btnK\" type=\"submit\" data-ved=\"0ahUKEwjGnouyzrf1AhVrDjQIHTmsCpQQ4dUDCAk\">",
    "<input class=\"RNmpXc\" value=\"I'm Feeling Lucky\" aria-label=\"I'm Feeling Lucky\" name=\"btnI\" type=\"submit\" jsaction=\"trigger.kWlxhc\" data-ved=\"0ahUKEwjGnouyzrf1AhVrDjQIHTmsCpQQ19QECAo\">",
    "<input class=\"gNO89b\" value=\"Google Search\" aria-label=\"Google Search\" name=\"btnK\" type=\"submit\" data-ved=\"0ahUKEwjGnouyzrf1AhVrDjQIHTmsCpQQ4dUDCA0\">",
    "<input id=\"gbqfbb\" value=\"I'm Feeling Lucky\" aria-label=\"I'm Feeling Lucky\" name=\"btnI\" type=\"submit\" data-ved=\"0ahUKEwjGnouyzrf1AhVrDjQIHTmsCpQQnRsIDg\">",
    "<input name=\"source\" type=\"hidden\" value=\"hp\">",
    "<input value=\"YcPkYYbqD-uc0PEPudiqoAk\" name=\"ei\" type=\"hidden\">",
    "<input value=\"ALs-wAMAAAAAYeTRcWUJbAzdy9nVUxqjl1u4XqQ978FR\" name=\"iflsig\" type=\"hidden\">"
]
```

6. we can now add the form fields and submission to the definition
```xml
<go url="http://www.google.com/">
    <set form="@role='search'" target="q" variable="query"></set>
    <set form="@role='search'" target="btnK"></set>
    <set form="@role='search'" target="btnI"></set>
    <set form="@role='search'" target="source"></set>
    <set form="@role='search'" target="ei"></set>
    <set form="@role='search'" target="iflsig"></set>
    <go form="@role='search'">
        <!-- extraction logic to go here -->
    </go>
</go>
```
7. use the developer tools to inspect the dom, copy the outerhtml value off it and save it to a file `search-result.html`
8. now, work on a selector for the result rows
```bash
auto xpath "//div[@id='search']/div/div" goog-out.html
```
9. last you'll need to come up with column selectors for the values:
    - name : `//div[@data-header-feature='0']//h3/text()`
    - description : `//div[@data-content-feature='1']/div/span`
    - url : `//div[@data-header-feature='0']/div/a/@href`
10. Now you can write the final definition
```xml
<go url="http://www.google.com/">
    <set form="@role='search'" target="q" variable="query"></set>
    <set form="@role='search'" target="btnK"></set>
    <set form="@role='search'" target="btnI"></set>
    <set form="@role='search'" target="source"></set>
    <set form="@role='search'" target="ei"></set>
    <set form="@role='search'" target="iflsig"></set>
    <go form="@role='search'">
        <set xpath="//div[@id='search']/div/div" variable="matches">
            <set
                xpath="//div[@data-header-feature='0']//h3/text()"
                variable="name"
            ></set>
            <set
                xpath="//div[@data-content-feature='1']/div/span"
                variable="description"
            ></set>
            <set
                xpath="//div[@data-header-feature='0']/div/a/@href"
                variable="url"
            ></set>
        </set>
    </go>
    <emit variables="matches"></emit>
</go>
```

That's all there is until I add a paging feature.
