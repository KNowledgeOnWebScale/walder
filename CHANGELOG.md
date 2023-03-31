# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## [4.1.1] - 2023-03-31

### Changed
- Update Comunica deps

## [4.1.0] - 2023-03-30

### Added
- Clarify GraphQL-LD error when certificate fails (see [issue 80](https://github.com/KNowledgeOnWebScale/walder/issues/80))
- Add query results as JSON-LD to HTML output (see [issue 125](https://github.com/KNowledgeOnWebScale/walder/issues/125))
- Support for SPARQL queries

### Changed
- Use `namedNode` in `graphql-ld-handler.js`.

### Fixed
- Query for data sources within a path.

## [4.0.0] - 2022-05-02

### Fixed
- Keep named nodes when returning RDF results of query (see [issue 120](https://github.com/KNowledgeOnWebScale/walder/issues/120))
- Blank node is returned when IRI is expected when requesting Turtle (see [issue 116](https://github.com/KNowledgeOnWebScale/walder/issues/116))

### Changed
- Static IDs on the first level of a query are included in query results.

## [3.0.0] - 2022-04-08

### Changed
- Handling of query results in pipe modules

### Fixed 
- GraphQLLDInfoValidator not strict enough when validating variables (see [issue 55](https://github.com/KNowledgeOnWebScale/walder/issues/55))

## [2.2.2] - 2021-09-29

### Added
- Support for Markdown footnotes

### Changed
- Error handling in `RequestHandler`

## [2.2.1] - 2021-08-26

### Added
- Support async pipe modules (see [issue 112](https://github.com/KNowledgeOnWebScale/walder/issues/112))
- Support minimum/maximum of parameters (see [issue 24](https://github.com/KNowledgeOnWebScale/walder/issues/24))

### Changed
- Switch to Github actions for CI  (see [issue 102](https://github.com/KNowledgeOnWebScale/walder/issues/102))
- Update `graphql-ld` dep

### Fixed
- Config-file-parser shouldn't export async function (see [issue 54](https://github.com/KNowledgeOnWebScale/walder/issues/54))
- Enable logging of express again (see [issue 43](https://github.com/KNowledgeOnWebScale/walder/issues/43))
- Throws error when converting empty data to Turtle

## [2.2.0] - 2021-08-04

### Added
- Template files are loaded once at the start and then cached with their front-matter (see [issue 87](https://github.com/KNowledgeOnWebScale/walder/issues/87))
- .njk is interpreted as a nunjuck template (see [issue 75](https://github.com/KNowledgeOnWebScale/walder/issues/75))
- Error when integer in graphql query variable can't be parsed (see [issue 84](https://github.com/KNowledgeOnWebScale/walder/issues/84))
- File validation error message now reflects when error originates from layout file
- Error when integer in graphql query variable can't be parsed (see [issue 84](https://github.com/KNowledgeOnWebScale/walder/issues/84))

### Fixed
- html-convertor can't convert a template using a layout that in turn extends another layout
- Class RdfConverter does not obey Convertor interface (see [issue 58](https://github.com/KNowledgeOnWebScale/walder/issues/58))
- Fix memory leak  (see [issue 83](https://github.com/KNowledgeOnWebScale/walder/issues/83))
- Incorrect error when frontmatter is invalid (see [issue 105](https://github.com/KNowledgeOnWebScale/walder/issues/105))
- Tests passing wrongly (see [issue 60](https://github.com/KNowledgeOnWebScale/walder/issues/60))

### Changed
- Update Comunica deps  (see [issue 98](https://github.com/KNowledgeOnWebScale/walder/issues/98))

## [2.1.0] - 2021-04-22

### Added
- Added tests for default error pages `*.pug`, `*.handlebars`, `*.md` (see [issue 49](https://github.com/KNowledgeOnWebScale/walder/issues/49))
- Documented the consumption of query results in templates (see [issue 62](https://github.com/KNowledgeOnWebScale/walder/issues/62))
- Documented how to use layouts (see [issue 63](https://github.com/KNowledgeOnWebScale/walder/issues/63))
- Supporting comunica lenient querying (see [issue 68](https://github.com/KNowledgeOnWebScale/walder/issues/68))
- FrontMatter metadata available in layout templates (see [issue 72](https://github.com/KNowledgeOnWebScale/walder/issues/72))
- Logging to HtmlConverter
- Default support for Nunjucks templates

### Changed
- Update dependencies
- Methods of HtmlConverter are non-static anymore
- Read file in HtmlConverter sync
- Update deps: `fs-extra`

### Fixed
- Filter query/path parameters before substituting variables (see [issue 36](https://github.com/KNowledgeOnWebScale/walder/issues/36))
- 404 error on /favicon.ico in examples (see [issue 31](https://github.com/KNowledgeOnWebScale/walder/issues/31))
- Deprecation warning for x-walder-resources.path is wrong and does not appear (see [issue 52](https://github.com/KNowledgeOnWebScale/walder/issues/52))
- Better logging when file is not found for route + detection at activation time + idem for default error pages (see [issue 48](https://github.com/KNowledgeOnWebScale/walder/issues/48))
- Dependency update to support handling of JSON-LD referring to http://schema.org (see [issue 64](https://github.com/KNowledgeOnWebScale/walder/issues/64))
- If Walder is running and the data changes, the data isn't refetched and the query doesn't re-run, even with --no-cache option'  (see [issue 23](https://github.com/KNowledgeOnWebScale/walder/issues/23))
- Multiple path parameters are not supported  (see [issue 81](https://github.com/KNowledgeOnWebScale/walder/issues/81))

## [2.0.3] - 2020-08-31

### Fixed
- Example config.yaml: cannot read variable writer (see [issue 29](https://github.com/KNowledgeOnWebScale/walder/issues/29))
- Example config-errors.yaml: 404 view is not used (see [issue 34](https://github.com/KNowledgeOnWebScale/walder/issues/34))
- Example config-errors.yaml: 404 is given for the wrong reason (see [issue 33](https://github.com/KNowledgeOnWebScale/walder/issues/33))
- Fix README: multiple config incorrect movies path

### Changed
- Update Comunica dependencies

## [2.0.2] - 2020-08-28

### Added
- Support integer variables in query (see [issue 20](https://github.com/KNowledgeOnWebScale/walder/issues/20))
- Dev explanation in the README

### Fixed
- Incorrect test for config file with resources (see [issue 17](https://github.com/KNowledgeOnWebScale/walder/issues/17))

## [2.0.1] - 2020-08-20

### Fixed
- Add license in package.json  (see [issue 11](https://github.com/KNowledgeOnWebScale/walder/issues/11))
- Add repo information in package.json  (see [issue 12](https://github.com/KNowledgeOnWebScale/walder/issues/12))

### Changed
- Examples

## [2.0.0] - 2020-08-19

### Added
- Support for markdown files (see [issue 77](https://gitlab.ilabt.imec.be/KNoWS/walder/issues/77))
- Support for front matter (see [issue 79](https://gitlab.ilabt.imec.be/KNoWS/walder/issues/79))
- Define layout via front matter (see [issue 80](https://gitlab.ilabt.imec.be/KNoWS/walder/issues/80))
- Support simpler JSON-LD context in config file (see [issue 71](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/71))
- Give error when $ref is not found (see [issue 96](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/96))
- ToC to README (see [issue 97](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/97))
- Set up Travis (see [issue 1](https://github.com/KNowledgeOnWebScale/walder/issues/1))

### Fixed
- Logger is no longer a singleton
- Support path without query
- Serving static files
- Cleaned up imports
- Yaml format now conforms to OpenAPI spec
- Renamed project to Walder
- Layout dir not set (see [issue 84](https://gitlab.ilabt.imec.be/KNoWS/walder/issues/84))
- Pug includes are using the wrong directory (see [issue 85](https://gitlab.ilabt.imec.be/KNoWS/walder/issues/85))
- Outdated dependencies
- Picture of Walder in README (see [issue 76](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/76))
- Fix examples in README (see [issue 70](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/70))
- Better status code and message when query parameters are missing in request (see [issue 93](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/93))
- Status code still 200 when template engine fails (see [issue 82](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/82))
- Clean up README (see [issue 95](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/95))
- Enhance README slightly to include Solid / decentralized knowledge graphs (see [issue 98](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/98))

### Changes
- Options are provided now to Walder via a single object
- Tests no longer use files in `example`
- Converters use promises, instead of callbacks
- Refactor parsers (see [issue 94](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/94))
- Use `root` instead of `path` for root path of `x-walder-resources`
- Defaults for `views` and `pipe-modules` in `x-walder-resources`
- Test resource structure (see [issue 81](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/81))

## [1.0.0] - 2019-08-30
### Added
- HTML template support
- Content negotiation support
- Error handling
- Query specific datasources
- Comunica cache handling cli support
- Config file input validation
- Logging

### Changed
- No longer required to give types to data sources.

## [0.0.1] - 2019-08-14
### Added
- Routing
    - Parse routing information from the config file
    - Set up express routes
- GraphQL-LD
    - Parse GraphQL-LD querying information from the config file
    - Add GraphQL-LD query execution to routing callback
- Pipe modules
    - Parse pipe modules information from the config file
    - Load local and remote pipe modules
    - Add pipe modules to routing callback
- CLI

<<<<<<< HEAD
=======
[4.1.1]: https://github.com/KNowledgeOnWebScale/walder/compare/v4.1.0...v4.1.1
[4.1.0]: https://github.com/KNowledgeOnWebScale/walder/compare/v4.0.0...v4.1.0
>>>>>>> development
[4.0.0]: https://github.com/KNowledgeOnWebScale/walder/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/KNowledgeOnWebScale/walder/compare/v2.2.2...v3.0.0
[2.2.2]: https://github.com/KNowledgeOnWebScale/walder/compare/v2.2.1...v2.2.2
[2.2.1]: https://github.com/KNowledgeOnWebScale/walder/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/KNowledgeOnWebScale/walder/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/KNowledgeOnWebScale/walder/compare/v2.0.3...v2.1.0
[2.0.3]: https://github.com/KNowledgeOnWebScale/walder/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/KNowledgeOnWebScale/walder/compare/v2.0.1...v2.0.2
[2.0.1]: https://github.com/KNowledgeOnWebScale/walder/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/KNowledgeOnWebScale/walder/releases/tag/v2.0.0
[1.0.0]: https://gitlab.ilabt.imec.be/KNoWS/walder/compare/v0.0.1...v1.0.0
[0.0.1]: https://gitlab.ilabt.imec.be/KNoWS/walder/-/tags/v0.0.1
