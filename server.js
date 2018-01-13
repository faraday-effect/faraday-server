'use strict';

const Joi = require('joi');
const Boom = require('boom');

// Create a server with a host and port
const server = require('hapi').server({
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

    await server.register(require('blipp'));

    await server.register({
        plugin: require('nes'),
        options: {
            onConnection: socket => console.log(`client connected - id=${socket.id}`),
            onDisconnection: socket => console.log(`client disconnected - id=${socket.id}`),
            onMessage: async (socket, message) => {
                console.log(`message from ${socket.id}: ${message}`);
            }
        }
    });

    server.route([
        {
            method: 'GET',
            path: '/api/cells',
            options: {
                cors: true
            },
            handler: async function(request, h) {
                try {
                    return await request.mongo.db.collection('cells').find().toArray();
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
                try {
                    return await request.mongo.db.collection('quizzes').find().toArray();
                }
                catch (err) {
                    throw Boom.internal('Internal MongoDB error', err);
                }
            }
        },
        {
            method: 'GET',
            path: '/api/users',
            options: {
                cors: true
            },
            handler: async function(request, h) {
                try {
                    return await request.mongo.db.collection('users').find().toArray();
                }
                catch (err) {
                    throw Boom.internal('Internal MongoDB error', err);
                }
            }
        },
        {
            method: 'POST',
            path: '/api/users',
            options: {
                cors: true
            },
            handler: async function(request, h) {
                return await request.mongo.db.collection('users').insertOne(request.payload);
            }
        },
        {
            method: 'POST',
            path: '/api/notes',
            options: {
                cors: true
            },
            handler: async function(request, h) {
                return await request.mongo.db.collection('notes').insertOne(request.payload);
            }
        },
        {
            method: 'GET',
            path: '/api/notes/{destination}',
            options: {
                cors: true,
                validate: {
                    params: {
                        destination: Joi.string().valid('notes', 'projector', 'podium', 'participant')
                    }
                }
            },
            handler: async function(request, h) {
                return await request.mongo.db.collection('notes').aggregate([
                    {$unwind: '$content.segments'},
                    {$match: {'content.segments.for': request.params.destination}},
                    {$project: {
                            _id: 0,
                            key: '$content.segments.key',
                            content: '$content.segments.content'
                        }
                    }
                ]).toArray();
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
