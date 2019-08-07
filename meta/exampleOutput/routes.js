const express = require('express');
const GraphQLLD = require('./graphQLLD.js');
const PipeModules = require('./pipeModules');

const app = express();

app.get('/movies/brad_pitt', function(req, res, next) {
    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getmoviesbradpitt, req.params, req.query).then( (data) => {
        // Apply pipe modules to query result
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
        // Apply pipe modules to query result
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
        // Apply pipe modules to query result
        const pipeResult = PipeModules.pipe(
        )(data);

        res.send(pipeResult);
    
    }).catch(error => {
        res.send(error.message)
    })
});

// Start the app
app.listen(4200, () => {
    console.log('Listening on http://localhost:4200')
});