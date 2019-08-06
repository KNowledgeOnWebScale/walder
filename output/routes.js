const GraphQLLD = require('./graphQLLDOutput.js');

app.get('/movies/brad_pitt', function(req, res, next) {
    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getmoviesbradpitt).then( (data) =>
        res.send(data)
    ).catch(
        res.send('FAILED')
    )
});
app.get('/developers/belgian', function(req, res, next) {
    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getdevelopersbelgian).then( (data) =>
        res.send(data)
    ).catch(
        res.send('FAILED')
    )
});
