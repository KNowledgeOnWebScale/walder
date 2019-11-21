const assert = require('chai').assert;
const expect = require('chai').expect;
require('chai').should();
const request = require('supertest');

const path = require('path');
const isHTML = require('is-html');
const jsonld = require('jsonld');
const N3 = require('n3');

const Walter = require('../lib/walter');
const GraphQLLDHandler = require('../lib/handlers/graphQLLDHandler');
const filter = require('./resources/filterT').filterT;

const CONFIG_FILE = './resources/config_test_example.yaml';
const CONFIG_FILE_ERRORS = './resources/config_test_example_errors.yaml';
const CONFIG_FILE_NO_QUERY = './resources/config_test_no_query.yaml';
const CONFIG_FILE_IMAGE = './resources/config_test_image.yaml';

describe('Walter', function () {
  this.timeout(5000);

  describe('#Activation', function () {
    it('should throw an error when no config file is given', function () {
      expect(() => new Walter()).to.throw('Configuration file is required.')
    });

    it('should be listening on the given port', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE);
      const port = 9000;

      const walter = new Walter(configFile, port);
      walter.activate();

      walter.server.listening.should.equal(true);
      walter.server.address().port.should.equal(port);

      walter.deactivate();
    });
  });

  describe('#Content negotiation', function () {
    before('Activating Walter', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE);
      const port = 9000;

      this.walter = new Walter(configFile, port);
      this.walter.activate();
    });

    after('Deactivating Walter', function () {
      this.walter.deactivate();
    });

    it('should serve text/html when no content-type is specified by the client', function (done) {
      request(this.walter.app)
        .get('/movies/Angelina_Jolie')
        .expect('Content-Type', /text\/html/)
        .expect(checkBody)
        .end(done);

      function checkBody(res) {
        return isHTML((res.body));
      }
    });

    it('should return status 415 and the response should have properties { status, message ) ' +
      'when an invalid content-type is requested', function (done) {
      request(this.walter.app)
        .get('/movies/Angelina_Jolie')
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
      request(this.walter.app)
        .get('/movies/Angelina_Jolie')
        .set('Accept', 'text/html')
        .expect('Content-Type', /text\/html/)
        .expect(checkBody)
        .end(done);

      function checkBody(res) {
        return isHTML((res.body));
      }
    });

    it('should be able to serve application/ld+json when requested', function (done) {
      request(this.walter.app)
        .get('/movies/Angelina_Jolie')
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
      request(this.walter.app)
        .get('/movies/Angelina_Jolie')
        .set('Accept', 'text/turtle')
        .expect('Content-Type', /text\/turtle/)
        .expect(checkBody)
        .end(done);

      function checkBody(res) {
        const parser = new N3.Parser({format: 'Turtle'});
        // If 'N3' can parse it, then it must be valid turtle
        parser.parse(res.text);
      }
    });

    it('should be able to serve application/n-triples when requested', function (done) {
      request(this.walter.app)
        .get('/movies/Angelina_Jolie')
        .set('Accept', 'application/n-triples')
        .expect('Content-Type', /application\/n-triples/)
        .expect(checkBody)
        .end(done);

      function checkBody(res) {
        const parser = new N3.Parser({format: 'N-Triples'});
        // If 'N3' can parse it, then it must be valid N-triples
        parser.parse(res.text);
      }
    });

    it('should be able to serve application/n-quads when requested', function (done) {
      request(this.walter.app)
        .get('/movies/Angelina_Jolie')
        .set('Accept', 'application/n-quads')
        .expect('Content-Type', /application\/n-quads/)
        .expect(checkBody)
        .end(done);

      function checkBody(res) {
        const parser = new N3.Parser({format: 'N-Quads'});
        // If 'N3' can parse it, then it must be valid N-quads
        parser.parse(res.text);
      }
    });
  });

  describe('#Functionality', function () {
    before('Activating Walter', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE);
      const port = 9000;

      this.walter = new Walter(configFile, port);
      this.walter.activate();
    });

    after('Deactivating Walter', function () {
      this.walter.deactivate();
    });

    describe('##Express', function () {
      it('should make the routes specified in the config file available', function (done) {
        request(this.walter.app)
          .get('/movies/Angelina_Jolie')
          .expect(200, done);
      });
    });

    describe('##GraphQL-LD', function () {
      it('should execute the GraphQL-LD queries linked to a route', function (done) {
        request(this.walter.app)
          .get('/movies/Angelina_Jolie')
          .set('Accept', 'application/json')
          .expect(checkBody)
          .end(done);

        function checkBody(res) {
          assert(Array.isArray(res.body), 'GraphQL-LD query not correctly executed');
        }
      });

      it('should return an object of arrays when there are multiple queries', function (done) {
        request(this.walter.app)
          .get('/artist/David_Bowie')
          .set('Accept', 'application/json')
          .expect(res => {
            assert(Object.keys(res.body).length === 2);
            assert(Array.isArray(res.body.songs));
            assert(Array.isArray(res.body.films));
          })
          .end(done);
      });

      describe('###Caching', function () {
        it('should be able to reuse comunica query engines when the data sources are the same', function (done) {
          // Do two requests with the same data sources, only one query engine should be found in the cache
          const graphQLLHandler = new GraphQLLDHandler();

          request(this.walter.app)
            .get('/movies/Angelina_Jolie')
            .end((err, res) => {

              if (err) throw err;

              request(this.walter.app)
                .get('/movies/Angelina_Jolie')
                .end((err, res) => {

                  if (err) throw err;

                  Object.keys(this.walter.requestHandler.graphQLLDHandler.comunicaEngineCache).length.should.equal(1);
                  done();
                });
            });
        });

        it('should not reuse a comunica query engine when the datasources haven\'t been used before', function (done) {
          // Do two requests with different data sources, two query engines should be found in the cache
          request(this.walter.app)
            .get('/movies/Angelina_Jolie')
            .end((err, res) => {
              if (err) throw err;

              request(this.walter.app)
                .get('/more_movies/Angelina_Jolie')
                .end((err, res) => {
                  if (err) throw err;

                  Object.keys(this.walter.requestHandler.graphQLLDHandler.comunicaEngineCache).length.should.equal(2);
                  done();
                });
            });
        });
      })

    });

    describe('##PipeModules', function () {
      it('should apply the specified pipe modules', function (done) {
        request(this.walter.app)
          .get('/movies/Angelina_Jolie')
          .set('Accept', 'application/json')
          .expect(check)
          .end(done);

        function check(res) {
          const origLength = res.body.length;
          const filteredData = filter(res.body);

          assert.lengthOf(filteredData.data, origLength, 'Pipe module probably not applied');
        }
      });
    })
  });

  it('should just return the HTML when no query is provided', function (done) {
    const configFile = path.resolve(__dirname, CONFIG_FILE_NO_QUERY);
    const port = 9000;

    this.walter = new Walter(configFile, port);
    this.walter.activate();

    request(this.walter.app)
      .get('/')
      .expect(200, () => {
        this.walter.deactivate();
        done();
      });
  });

  it('Should return image in public folder', function (done) {
    const configFile = path.resolve(__dirname, CONFIG_FILE_IMAGE);
    const port = 9000;

    this.walter = new Walter(configFile, port);
    this.walter.activate();

    request(this.walter.app)
      .get('/device.jpg')
      .expect(200, () => {
        this.walter.deactivate();
        done();
      });
  });

  describe('#Error handling', function () {
    before('Activating Walter', function () {
      const configFile = path.resolve(__dirname, CONFIG_FILE_ERRORS);
      const port = 9000;

      this.walter = new Walter(configFile, port);
      this.walter.activate();
    });

    after('Deactivating Walter', function () {
      this.walter.deactivate();
    });

    it('should return status 404 when requesting a nonexistent page', function (done) {
      request(this.walter.app)
        .get('/thisPageSurelyDoesNotExist')
        .expect(404)
        .end(done);
    });

    it('should return status 500 when pipe modules could not be applied', function (done) {
      request(this.walter.app)
        .get('/movies/Angelina_Jolie')
        .expect(500)
        .end(done);
    });
    it('should return status 500 when the GraphQL-LD query could not be executed', function (done) {
      request(this.walter.app)
        .get('/badmovies/Angelina_Jolie')
        .expect(500)
        .end(done);
    });
    it('should return status 404 when the GraphQL-LD query\'s required variables were not given', function (done) {
      request(this.walter.app)
        .get('/movies/brad_pitt')
        .expect(404)
        .end(done);
    });
  })
});
