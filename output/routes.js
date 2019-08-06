const GraphQLLD = require('./graphQLLDOutput.js');

const PipeModules = require('./pipeModules');
app.get('/movies/brad_pitt', function(req, res, next) {
    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getmoviesbradpitt).then( (data) => {
        const pipeResult = pipe(
            filter,
        )(data);

        res.send(pipeResult);

    }).catch(
        res.send('FAILED')
    )
});

app.get('/developers/belgian', function(req, res, next) {
    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getdevelopersbelgian).then( (data) => {
        const pipeResult = pipe(
            filter,
        )(data);

        res.send(pipeResult);

    }).catch(
        res.send('FAILED')
    )
});

