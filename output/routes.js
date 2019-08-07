const GraphQLLD = require('./graphQLLDOutput.js');

const PipeModules = require('./pipeModules');
app.get('/movies/brad_pitt', function(req, res, next) {
    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getmoviesbradpitt).then( (data) => {
        const pipeResult = PipeModules.pipe(
            PipeModules.filter,
        )(data);

        res.send(pipeResult);

    }).catch(
        res.send('FAILED')
    )
});

app.get('/movies/:actor', function(req, res, next) {
    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getmoviesactor).then( (data) => {
        const pipeResult = PipeModules.pipe(
        )(data);

        res.send(pipeResult);

    }).catch(
        res.send('FAILED')
    )
});

app.get('/developers/belgian', function(req, res, next) {
    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getdevelopersbelgian).then( (data) => {
        const pipeResult = PipeModules.pipe(
            PipeModules.filter,
        )(data);

        res.send(pipeResult);

    }).catch(
        res.send('FAILED')
    )
});

