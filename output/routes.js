const GraphQLLD = require('./graphQLLDOutput.js');


    // Callback body
    GraphQLLD.executeQuery(GraphQLLD.comunicaConfig, GraphQLLD.getmoviesbradpitt).then( (data) =>
        console.log(data)
        //res.send(data)
    ).catch(
        //res.send('FAILED')
    )