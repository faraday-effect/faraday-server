'use strict';

const Hapi = require('hapi');
const Nes = require('nes');
const Boom = require('boom');
const Blipp = require('blipp');

// Create a server with a host and port
const server = Hapi.server({
    host: 'localhost',
    port: 8000
});

const quizConstants = {
    SHORT_ANSWER: 'SHORT_ANSWER',
    MULTIPLE_CHOICE: 'MULTIPLE_CHOICE'
};

// Start the server
async function start() {

    await server.register({
        plugin: require('hapi-mongodb'),
        options: {
            url: 'mongodb://localhost:27017/faraday',
            settings: {
                poolSize: 10
            },
            decorate: true
        }
    });

    await server.register({
        plugin: require('good'),
        options: {
            reporters: {
                consoleReporter: [{
                    module: 'good-squeeze',
                    name: 'Squeeze',
                    args: [{ log: '*', response: '*' }]
                }, {
                    module: 'good-console'
                }, 'stdout']
            }
        }
    });

    await server.register(Blipp);

    await server.register(Nes);

    server.route([
        {
            method: 'GET',
            path: '/api/cells',
            options: {
                cors: true
            },
            handler: async function(request, h) {
                const db = request.mongo.db;
                const ObjectID = request.mongo.ObjectID;

                try {
                    return await db.collection('cells').find().toArray();
                }
                catch (err) {
                    throw Boom.internal('Internal MongoDB error', err);
                }
            }
        },
        {
            method: 'GET',
            path: '/api/quizzes',
            options: {
                cors: true
            },
            handler: async function(request, h) {
                const db = request.mongo.db;
                const ObjectID = request.mongo.ObjectID;

                try {
                    return await db.collection('quizzes').find().toArray();
                }
                catch (err) {
                    throw Boom.internal('Internal MongoDB error', err);
                }
            }
        },
        {
            method: 'GET',
            path: '/h',
            config: {
                id: 'hello',
                handler: (request, h) => {
                    server.broadcast('ZIPFACE WHIPERDOODLE');
                    return 'world!';
                }
            }
        }
    ]);

    await server.start();
    console.log('Server running at:', server.info.uri);
}

start().catch(err => {
    console.log(err);
    process.exit(1);
});
