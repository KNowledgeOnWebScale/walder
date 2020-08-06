# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- Support for markdown files (see [issue 77](https://gitlab.ilabt.imec.be/KNoWS/walder/issues/77))
- Support for front matter (see [issue 79](https://gitlab.ilabt.imec.be/KNoWS/walder/issues/79))
- Define layout via front matter (see [issue 80](https://gitlab.ilabt.imec.be/KNoWS/walder/issues/80))
- Support simpler JSON-LD context in config file (see [issue 71](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/71))
- Give error when $ref is not found (see [issue 96](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/96))
- ToC to README (see [issue 97](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/97))

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

### Changes
- Options are provided now to Walder via a single object
- Tests no longer use files in `example`
- Converters use promises, instead of callbacks
- Refactor parsers (see [issue 94](https://gitlab.ilabt.imec.be/KNoWS/walder/-/issues/94))
- Use `root` instead of `path` for root path of `x-walder-resources`
- Defaults for `views` and `pipe-modules` in `x-walder-resources`

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


[1.0.0]: https://gitlab.ilabt.imec.be/KNoWS/walder/compare/v0.0.1...v1.0.0
[0.0.1]: https://gitlab.ilabt.imec.be/KNoWS/walder/-/tags/v0.0.1
