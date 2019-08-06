# Changelog
All notable changes to this project will be documented in this file.

<a name="v1.3.1"></a>
## [v1.3.1](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.3.0...v1.3.1) - 2019-07-17

### Fixed
* [Fix doctype parser not accepting single-quoted strings](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/d6b23309f77027bd7405ea9d3ae9e066e366e1a8)

<a name="v1.3.0"></a>
## [v1.3.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.2.4...v1.3.0) - 2019-07-03

### Added
* [Add 'trackPosition' option to print line numbers on errors, Closes #16](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/1a948ffa72a70503022d4a31c0c6ecd7d5ba7e12)
* [Add 'allowDuplicateRdfIds' to allow duplicate rdf:IDs, Closes #18](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/1195847f1ee419d67d217bffaadc51a2d5f91f72)

### Fixed
* [Make DOCTYPE ENTITY parsing less strict regarding whitespace characters](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/76a641366d97f5db53ea80da025018fb5ff60f05)

<a name="v1.2.4"></a>
## [v1.2.4](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.2.3...v1.2.4) - 2019-06-24

### Fixed
* [Fix _: being accepted as valid IRIs, Closes #15](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/838bfe8834bca20d60297f79f0aa8ced981d111f)

<a name="v1.2.3"></a>
## [v1.2.3](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.2.2...v1.2.3) - 2019-04-25

### Fixed
* [Fix stream transformation continuing after first error, #12](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/acc805b1b963067eae8e7583bc6debe4ec198e3e)

<a name="v1.2.2"></a>
## [v1.2.2](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.2.1...v1.2.2) - 2019-04-25

### Fixed
* [Error on unbound prefixes, Closes #12](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/0931aab22c505cbfdd7ae89fd7fd5065a1cb3555)
* [Validate all created URIs, Closes #11](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/75588df39b49d6945001d381af76d38ba9add768)

<a name="v1.2.1"></a>
## [v1.2.1](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.2.0...v1.2.1) - 2019-04-02

### Fixed
* [Fix doctype entities not being considered in base IRIs, Closes #10](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/3cda7e18839200e1130af06de23128dd56f24e41)

<a name="v1.2.0"></a>
## [v1.2.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.1.0...v1.2.0) - 2019-01-28

### Added
* [Implement #import method](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/9213f6c1b634df839ea970a2f308506bcaa9b4fa)

<a name="v1.1.0"></a>
## [v1.1.0](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.0.1...v1.1.0) - 2018-11-08

### Changed
* [Update to generic RDFJS typings](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/f6558c57b5a2de83e775fe82f4e97f576d6a78c7)
* [Depend on relative-to-absolute-iri for IRI resolving](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/8fb6beb72d159be7b1a86b62701dc8274be9619e)

<a name="v1.0.1"></a>
## [v1.0.1](https://github.com/rdfjs/rdfxml-streaming-parser.js/compare/v1.0.0...v1.0.1) - 2018-10-09

### Fixed
* [Throw an error on li attributes on node elements](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/affb69bafb7f6ccfa72be731a7058314a541e2b4)
* [Throw errors on rdf:aboutEach and rdf:aboutEachPrefix](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/d981af760f5b4a21d73d325f4105da203bd8223c)
* [Add stricter NCName validation](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/25d97be70d88e18aed856c9aae15741cc9300c5e)
* [Make parseType and resource interactions more strict](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/25e397285db03e8094197515394ee62f88f29761)
* [Add blacklists for forbidden node and property element names](https://github.com/rdfjs/rdfxml-streaming-parser.js/commit/1e812fcbaef4bb4ad112f3eec83e3ce91bc97d51)

<a name="1.0.0"></a>
## [1.0.0] - 2018-09-04
* Initial release
