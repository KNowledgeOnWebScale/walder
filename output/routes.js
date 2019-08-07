const express = require('express');
const GraphQLLD = require('./graphQLLDOutput.js');
const PipeModules = require('./pipeModules');

const app = express();

app.get('/movies/brad_pitt', function(req, res, next) {
    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getmoviesbradpitt, req.params, req.query).then( (data) => {
        const pipeResult = PipeModules.pipe(
        )(data);

        res.send(pipeResult);

    }).catch(error => {
        res.send(error.message)
    })
});

app.get('/movies/:actor', function(req, res, next) {
    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getmoviesactor, req.params, req.query).then( (data) => {
        const pipeResult = PipeModules.pipe(
        )(data);

        res.send(pipeResult);

    }).catch(error => {
        res.send(error.message)
    })
});

app.get('/movies', function(req, res, next) {
    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getmovies, req.params, req.query).then( (data) => {
        const pipeResult = PipeModules.pipe(
        )(data);

        res.send(pipeResult);

    }).catch(error => {
        res.send(error.message)
    })
});

app.get('/developers/belgian', function(req, res, next) {
    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getdevelopersbelgian, req.params, req.query).then( (data) => {
        const pipeResult = PipeModules.pipe(
        )(data);

        res.send(pipeResult);

    }).catch(error => {
        res.send(error.message)
    })
});

app.listen(5656, () => {
    console.log('Listening on http://localhost:5656')
});