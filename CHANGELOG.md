# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- Support for markdown files (see [issue 77](https://gitlab.ilabt.imec.be/KNoWS/walder/issues/77))
- Support for front matter (see [issue 79](https://gitlab.ilabt.imec.be/KNoWS/walder/issues/79))

### Fixed
- Logger is no longer a singleton
- Support path without query
- Serving static files
- Cleaned up imports
- Yaml format now conforms to OpenAPI spec
- Renamed project to Walder

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
