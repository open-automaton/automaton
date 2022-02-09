Automaton Roadmap
=================

## Alpha

- [x] remove engines from core lib
- [x] puppeteer engine
- [x] playwright engine
- [x] jsdom engine
- [x] emit action
- [x] command-line app
- [x] attributes: until-exists, timeout, delay
    - [x] tested: delay
    - [x] tested: timeout
    - [ ] tested: until-exists
- [x] `es6-template-strings` support in attrs
- [ ] publishing tools in CLI
- [ ] support images in select
- [ ] proxy support
- [ ] robots.txt
- [ ] strip-mine (work clustering)
- [ ] monitoring
- [ ] GUI app for scraper maintenance, command/control and remote work (turing tests, etc)

## Beta

- [ ] cleanup, conversion to async selectors
- [ ] new action for subscraping
- [ ] add CLI plugin features to support using published definitions
- [ ] GUI search + publishing UI
- [ ] pages for GUI, `auto` and `automaton`
- [ ] jsdoc for typescript support

## 1.0

- [ ] interactive browser definition builder
- [ ] phantomjs engine (only because it's nearly ready)
- [ ] chrome-browser-plugin engine
- [ ] selenium engine
- [ ] `automaton-engine` support for other languages (PHP, Java, Rust... )
- [ ] tree based GUI representation
- [ ] step-thru scraper with local browser engine
- [ ] configurable action set/action plugins w/2.0 config tag
