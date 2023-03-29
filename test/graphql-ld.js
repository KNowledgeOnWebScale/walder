const assert = require('chai').assert;
const expect = require('chai').expect;
require('chai').should();
const request = require('supertest');

const path = require('path');
const isHTML = require('is-html');
const jsonld = require('jsonld');
const N3 = require('n3');

const Walder = require('../lib/walder');
const GraphQLLDHandler = require('../lib/handlers/graphql-ld-handler');
const filter = require('./resources/filter-t').filterT;

const CONFIG_FILE = './resources/config.yaml';
const CONFIG_FILE_ERRORS = './resources/config-errors.yaml';
const CONFIG_FILE_LENIENT = './resources/config-lenient.yaml'

describe('Walder with GRAPHQL-LD queries', function () {

  describe('# Content negotiation', function () {
    before('Activating Walder', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE);
      const port = 9000;

      this.walder = new Walder(configFile, {port, logging:'error'});
      this.walder.activate();
    });

    after('Deactivating Walder', function () {
      this.walder.deactivate();
    });

    it('should serve text/html when no content-type is specified by the client', function (done) {
      request(this.walder.app)
        .get('/movies/Angelina%20Jolie')
        .expect('Content-Type', /text\/html/)
        .expect(checkBody)
        .end(done);

      function checkBody(res) {
        return isHTML(res.text).should.be.true;
      }
    });

    it('should return status 415 and the response should have properties { status, message } ' +
      'when an invalid content-type is requested', function (done) {
      request(this.walder.app)
        .get('/movies/Angelina%20Jolie')
        .set('Accept', 'INVALID-CONTENT-TYPE')
        .expect(checkBody)
        .expect(415)
        .end(done);

      function checkBody(res) {
        res.body.should.have.property('status');
        res.body.should.have.property('message');
      }
    });

    it('should be able to serve text/html when requested', function (done) {
      request(this.walder.app)
        .get('/movies/Angelina%20Jolie')
        .set('Accept', 'text/html')
        .expect('Content-Type', /text\/html/)
        .expect(checkBody)
        .end(done);

      function checkBody(res) {
        return isHTML(res.text).should.be.true;
      }
    });

    it('should be able to serve application/ld+json when requested', function (done) {
      request(this.walder.app)
        .get('/movies/Angelina%20Jolie')
        .set('Accept', 'application/ld+json')
        .expect('Content-Type', /application\/ld\+json/)
        .expect(checkBody)
        .end(done);

      async function checkBody(res) {
        // If 'JsonLD' can turn it into N-Quads without errors, then it must be valid JSON-LD
        await jsonld.toRDF(res.body, {format: 'application/n-quads'}, (err, nquads) => {
          if (err) {
            throw(err);
          }
        });
      }
    });

    it('should be able to serve text/turtle when requested', function (done) {
      request(this.walder.app)
        .get('/movies/Angelina%20Jolie')
        .set('Accept', 'text/turtle')
        .expect('Content-Type', /text\/turtle/)
        .expect(checkBody)
        .end(done);

      function checkBody(res) {
        const parser = new N3.Parser({format: 'Turtle'});
        // If 'N3' can parse it, then it must be valid turtle
        assert(parser.parse(res.text).length > 0);
      }
    });

    it('should be able to serve application/n-triples when requested', function (done) {
      request(this.walder.app)
        .get('/movies/Angelina%20Jolie')
        .set('Accept', 'application/n-triples')
        .expect('Content-Type', /application\/n-triples/)
        .expect(checkBody)
        .end(done);

      function checkBody(res) {
        const parser = new N3.Parser({format: 'N-Triples'});
        // If 'N3' can parse it, then it must be valid N-triples
        assert(parser.parse(res.text).length > 0);
      }
    });

    it('should be able to serve application/n-quads when requested', function (done) {
      request(this.walder.app)
        .get('/movies/Angelina%20Jolie')
        .set('Accept', 'application/n-quads')
        .expect('Content-Type', /application\/n-quads/)
        .expect(checkBody)
        .end(done);

      function checkBody(res) {
        const parser = new N3.Parser({format: 'N-Quads'});
        // If 'N3' can parse it, then it must be valid N-quads
        assert(parser.parse(res.text).length > 0);
      }
    });
  });

  describe('# Functionality', function () {
    before('Activating Walder', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE);
      const port = 9000;

      this.walder = new Walder(configFile, {port, logging: 'error'});
      this.walder.activate();
    });

    after('Deactivating Walder', function () {
      this.walder.deactivate();
    });

    describe('## Express', function () {
      it('should make the routes specified in the config file available', function (done) {
        request(this.walder.app)
          .get('/movies/Angelina%20Jolie')
          .expect(200, done);
      });
    });

    describe('## GraphQL-LD', function () {
      it('should execute the GraphQL-LD queries linked to a route', function (done) {
        request(this.walder.app)
          .get('/movies/Angelina%20Jolie')
          .set('Accept', 'application/json')
          .expect(checkBody)
          .end(done);

        function checkBody(res) {
          assert(res.body && Array.isArray(res.body.data), 'GraphQL-LD query not correctly executed');
        }
      });

      it('should return an object of arrays when there are multiple queries', function (done) {
        request(this.walder.app)
          .get('/artist/David%20Bowie')
          .set('Accept', 'application/json')
          .expect(res => {
            assert(Object.keys(res.body).length === 2);
            assert(Array.isArray(res.body.songs));
            assert(Array.isArray(res.body.films));
          })
          .end(done);
      });

      it('should return valid RDF when there are multiple queries', function (done) {
        request(this.walder.app)
          .get('/artist/David%20Bowie')
          .set('Accept', 'application/n-quads')
          .expect('Content-Type', /application\/n-quads/)
          .expect(checkBody)
          .end(done);

        function checkBody(res) {
          const parser = new N3.Parser({format: 'N-Quads'});
          // If 'N3' can parse it, then it must be valid N-quads
          assert(parser.parse(res.text).length > 0);
        }
      });

      it('should sort the data in descending order when the option is given', function (done) {
        request(this.walder.app)
            .get('/music/John%20Lennon/sorted')
            .set('Accept', 'application/json')
            .expect(checkBody)
            .end(done);

        function checkBody(res) {
          for(let i = 0; i < res.body.length - 1; i++) {
            assert(res.body[i].label >= res.body[i+1].label, 'data is not sorted in descending order');
          }
        }
      })

      it('should remove duplicates out of the data when the option is given', function (done) {
        request(this.walder.app)
            .get('/music/John%20Lennon/no_duplicates')
            .set('Accept', 'application/json')
            .expect(checkBody)
            .end(done);

        function checkBody(res) {
          let uniqueLabel = [];
          for (const item of res.body.data){
            if (uniqueLabel.indexOf(item.label) === -1){
              uniqueLabel.push(item.label);
            }
          }
          assert(uniqueLabel.length === res.body.data.length, 'there are still duplicates in the data');
        }
      })

      it('should replace query parameter in GraphQL-LD query', function (done) {
        request(this.walder.app)
          .get('/artist2/David%20Bowie?writer=John%20Lennon')
          .set('Accept', 'application/json')
          .expect(checkBody)
          .end(done);

        function checkBody(res) {
          assert(res.body.data.length > 0, 'no results returned');
        }
      })

      it('id with value should be in results', function (done) {
        request(this.walder.app)
          .get('/angelina')
          .set('Accept', 'application/json')
          .expect(checkBody)
          .end(done);

        function checkBody(res) {
          assert(res.body.data.length > 0, 'no results returned');
          assert(res.body.data[0].id.value === 'http://dbpedia.org/resource/Angelina_Jolie', 'correct id not provided');
        }
      })

      describe('### Caching', function () {
        it('should be able to reuse comunica query engines when the data sources are the same', function (done) {
          // Do two requests with the same data sources, only one query engine should be found in the cache
          const graphQLLHandler = new GraphQLLDHandler();

          request(this.walder.app)
            .get('/movies/Angelina%20Jolie')
            .end((err, res) => {

              if (err) throw err;

              request(this.walder.app)
                .get('/movies/Angelina%20Jolie')
                .end((err, res) => {

                  if (err) throw err;

                  Object.keys(this.walder.requestHandler.graphQLLDHandler.comunicaEngineSourcesMap).length.should.equal(1);
                  done();
                });
            });
        });

        it('should not reuse a comunica query engine when the datasources haven\'t been used before', function (done) {
          // Do two requests with different data sources, two query engines should be found in the cache
          request(this.walder.app)
            .get('/movies/Angelina%20Jolie')
            .end((err, res) => {
              if (err) throw err;

              request(this.walder.app)
                .get('/more_movies/Angelina%20Jolie')
                .end((err, res) => {
                  if (err) throw err;

                  Object.keys(this.walder.requestHandler.graphQLLDHandler.comunicaEngineSourcesMap).length.should.equal(2);
                  done();
                });
            });
        });
      })

    });

    describe('## Pipe modules', function () {
      it('should apply the specified pipe modules', function (done) {
        request(this.walder.app)
          .get('/movies/Angelina%20Jolie')
          .set('Accept', 'application/json')
          .expect(check)
          .end(done);

        function check(res) {
          const origLength = res.body.data.length;
          const filteredData = filter(res.body.data);

          assert.lengthOf(filteredData, origLength, 'Pipe module probably not applied');
        }
      });

      it('should support async pipe module', function (done) {
        request(this.walder.app)
          .get('/movies-async/Angelina%20Jolie')
          .set('Accept', 'application/json')
          .expect(check)
          .end(done);

        function check(res) {
          const origLength = res.body.data.length;
          const filteredData = filter(res.body.data);

          assert.lengthOf(filteredData, origLength, 'Pipe module probably not applied');
        }
      });

      it('should add query key to pipe module', function (done) {
        request(this.walder.app)
          .get('/movies-query-key/Angelina%20Jolie')
          .set('Accept', 'application/json')
          .expect(check)
          .end(done);

        function check(res) {
          const origLength = res.body.movies.length;
          const filteredData = filter(res.body.movies);

          assert.lengthOf(filteredData, origLength, 'Pipe module probably not applied');
        }
      });

      it('should give all query results to pipe module', function (done) {
        request(this.walder.app)
          .get('/movies-query-combine/Angelina%20Jolie/Brad%20Pitt/')
          .set('Accept', 'application/json')
          .expect(check)
          .end(done);

        function check(res) {
          assert.deepEqual([{id: 'http://example.com/my-movie'}], res.body.movies3, 'Pipe module probably not applied');
        }
      });
    })
  });

  describe('# Error handling', function () {
    before('Activating Walder', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE_ERRORS);
      const port = 9000;

      this.walder = new Walder(configFile, {port, logging: 'error'});
      this.walder.activate();
    });

    after('Deactivating Walder', function () {
      this.walder.deactivate();
    });

    it('should return status 404 when requesting a nonexistent page', function (done) {
      request(this.walder.app)
        .get('/thisPageSurelyDoesNotExist')
        .expect(404)
        .end(done);
    });

    it('should return 404 HTML page when requesting a nonexistent page', function (done) {
      request(this.walder.app)
        .get('/thisPageSurelyDoesNotExist')
        .expect('Content-Type', /text\/html/)
        .expect(checkBody)
        .end(done);

      function checkBody(res) {
        res.text.should.includes('moon.svg'); // This SVG is used in the default 404 page.
      }
    });

    it('should return status 500 when pipe modules could not be applied', function (done) {
      request(this.walder.app)
        .get('/movies/Angelina%20Jolie')
        .expect(500)
        .end(done);
    });
    it('should return status 500 when the GraphQL-LD query could not be executed', function (done) {
      request(this.walder.app)
        .get('/badmovies/Angelina%20Jolie')
        .expect(500)
        .end(done);
    });
    it('should return status 404 when the GraphQL-LD query\'s required variables were not given', function (done) {
      request(this.walder.app)
        .get('/movies/brad_pitt')
        .expect(400)
        .end(done);
    });
  });

  describe('# Lenient handling', function () {
    before('Activating Walder', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE_LENIENT);
      const port = 9000;

      this.walder = new Walder(configFile, {port, logging: 'error', lenient: true});
      this.walder.activate();
    });

    after('Deactivating Walder', function () {
      this.walder.deactivate();
    });

    // Warning
    //   Next test passes, however: after the final report, mocha takes a long time before it terminates (minutes)
    //   The delay seems due to the presence of the bad datasource https://data.vlaanderen.be/id/adres/20470097
    //   from the route specification in the config file.
    //   Removing it would make this test useless...
    it('should tolerate bad dataset if lenient querying set', function (done) {
      request(this.walder.app)
        .get('/bad-jsonld')
        .expect('Content-Type', /text\/html/)
        .expect(200)
        .expect(checkText)
        .end(done);

      function checkText(res) {
        expect(res.text).to.contain("AA Tower");
        expect(res.text).to.contain("https://data.vlaanderen.be/id/adres/20470097");
      }
    });

  });
});
