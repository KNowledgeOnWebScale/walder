# Changelog
All notable changes to this project will be documented in this file.

<a name="v1.2.0"></a>
## [v1.2.0](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.1.4...v1.2.0) - 2019-04-02

### Added
* [Add compactIri helper function](https://github.com/rubensworks/jsonld-context-parser.js/commit/b350541e8052679ef72d62c3798d4a379c771b97)

<a name="v1.1.4"></a>
## [v1.1.4](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.1.3...v1.1.4) - 2019-03-15

### Changed
* [Make CLI return exit code 1 if an error was encountered](https://github.com/rubensworks/jsonld-context-parser.js/commit/75e4961cba271beb74cf2f77bfd43b4dd589a2b7)
* [Allow tilde in IRIs](https://github.com/rubensworks/jsonld-context-parser.js/commit/9637ebf26de7690f32aab4fc468c22cf5395e417)

### TODO: categorize commits, choose titles from: Added, Changed, Deprecated, Removed, Fixed, Security.
* [Fix CLI errors not being shown correctly, Closes #18](https://github.com/rubensworks/jsonld-context-parser.js/commit/f8dea3592adf710e50c5ac0df334db327cca7433)

<a name="v1.1.3"></a>
## [v1.1.3](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.1.1...v1.1.3) - 2019-02-13

### Changed
* [Make IRI regex stricter](https://github.com/rubensworks/jsonld-context-parser.js/commit/253986cab9488bcfabdeb53f43353a1170123335)
* [Allow relative context IRIs to be parsed](https://github.com/rubensworks/jsonld-context-parser.js/commit/5754b4b388f7b25f4832c3812d63ff3385ab42ad)

<a name="v1.1.2"></a>
## [v1.1.2](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.1.1...v1.1.2) - 2019-02-12

### Fixed
* [Allow relative context IRIs to be parsed](https://github.com/rubensworks/jsonld-context-parser.js/commit/5ec027de3d3e06f8c70ed0928f750b917becb975)

<a name="v1.1.1"></a>
## [v1.1.1](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.1.0...v1.1.1) - 2019-02-07

### Changed
* [Allow context objects with @context to be parsed](https://github.com/rubensworks/jsonld-context-parser.js/commit/02f70ab76d203899be02931df194cb2aefb32ed7)

<a name="v1.1.0"></a>
## [v1.1.0](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.0.1...v1.1.0) - 2019-02-07

### Added
* [Distinguish between @base and @vocab term expansion](https://github.com/rubensworks/jsonld-context-parser.js/commit/acec95004c0ba93ea547e9af5fd6723d7424abc5)

### Changed
* [Improve context validation to be spec-compliant](https://github.com/rubensworks/jsonld-context-parser.js/commit/c0a7716cb50b8d1933f10bcc7c904606b064b72e)
* [Request remote contexts with proper accept header](https://github.com/rubensworks/jsonld-context-parser.js/commit/2ea1863a428652b93e1545b8d733aca9748235a7)
* [Pass parse parameters as hash](https://github.com/rubensworks/jsonld-context-parser.js/commit/dc51cf146236f39de491bfe4aa4ba78fb190a282)
* [Process external contexts in arrays in parallel](https://github.com/rubensworks/jsonld-context-parser.js/commit/483050a55e438e81c91984102de7ef03e5a1a00a)
* [Return null from expandTerm if the term has null as context value](https://github.com/rubensworks/jsonld-context-parser.js/commit/eab3530f3ba37f67ad7dba8d24ebef4799ba0630)
* [Remove @base entries from external contexts](https://github.com/rubensworks/jsonld-context-parser.js/commit/b737cbee4ceb610c57d9f26b9bf9671b9b7bbdc9)
* [Depend on relative-to-absolute-iri for IRI resolving](https://github.com/rubensworks/jsonld-context-parser.js/commit/18cc011cdbbd3956d8319a01ce44c991cefc5e00)
* [Don't unwrap @context in IDocumentLoader](https://github.com/rubensworks/jsonld-context-parser.js/commit/4f501447beb72f24e1c390e5315850860061fcca)

### Fixed
* [Fix remote array-based contexts not being retrieved from cache properly](https://github.com/rubensworks/jsonld-context-parser.js/commit/52fdc39f808ed2ce6b5c5f18a6fe5b48035310a6)
* [Allow @base to be set in null contexts](https://github.com/rubensworks/jsonld-context-parser.js/commit/f64b08cba61b02d89e6b1d13d6d58b5ce90c086b)
* [Fix array context not inheriting from parent context](https://github.com/rubensworks/jsonld-context-parser.js/commit/fe387bbe19c66608bab6dd6f57eb057808e773c1)
* [Only expand term references in vocab-mode](https://github.com/rubensworks/jsonld-context-parser.js/commit/858aa60386d86d0a76d8f68876f87b4f5d732e54)
* [Fix @type: @vocab being expanded](https://github.com/rubensworks/jsonld-context-parser.js/commit/96e9a1eda4916d00a66743d0a04da5a087fe5790)
* [Make @type expansion fallback to @base](https://github.com/rubensworks/jsonld-context-parser.js/commit/05880ff9f85f986101a2bedae5f88479e19a7efe)
* [Fix disabling context via @id: null not working](https://github.com/rubensworks/jsonld-context-parser.js/commit/6b1a609d58d0fafec58885c75a6ba4b5efc6c456)
* [Fix inner context expansion happening on @base instead of @vocab](https://github.com/rubensworks/jsonld-context-parser.js/commit/ab526933cb006721d02b35a4a88c8224b4b60991)
* [Fix context entries referencing themselves ignoring @vocab](https://github.com/rubensworks/jsonld-context-parser.js/commit/1a8ac8a679b6053b4d2be9e159d7cb2be2de584c)
* [Blacklist @language value expansion](https://github.com/rubensworks/jsonld-context-parser.js/commit/885f44f1964b17266d1330e15162de0efd452b79)
* [Fix expansion loop stopping too soon when one term was unchanged](https://github.com/rubensworks/jsonld-context-parser.js/commit/65ac1b421037e632562c0117c77fb4bd5b091ab5)
* [Allow setting @context to null](https://github.com/rubensworks/jsonld-context-parser.js/commit/c4ea704be84841f127fa854932b7bfc505880add)

<a name="v1.0.1"></a>
## [v1.0.1](https://github.com/rubensworks/jsonld-context-parser.js/compare/v1.0.0...v1.0.1) - 2018-10-08

### Fixed
* [Enable manual-git-changelog](https://github.com/rubensworks/jsonld-context-parser.js/commit/53a48cf6fc8a3e0e5ce87efeaad4b018943648c4)

<a name="1.0.0"></a>
## [1.0.0] - 2018-09-25
Initial release
