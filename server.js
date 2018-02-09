// @flow

import hapiAuthJWT from 'hapi-auth-jwt2';
import {JWT_SECRET_KEY} from './private';
import {validateUser} from "./lib/authentication";

import topicsPlugin from './plugins/topics';
import lecturesPlugin from "./plugins/lectures";
import usersPlugin from "./plugins/users";
import quizzesPlugin from "./plugins/quizzes";
import coursesPlugin from "./plugins/courses";
import semestersPlugin from "./plugins/semesters";
import offeringsPlugin from "./plugins/offerings";

// Create a server with a host and port
const server = require('hapi').server({
    host: 'localhost',
    port: 8000,
    routes: {
        cors: true
    }
});

// Start the server
async function start() {

    await server.register(require('blipp'));

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

    await server.register(hapiAuthJWT);

    server.auth.strategy('jwt', 'jwt', {
        key: JWT_SECRET_KEY,
        verifyOptions: {
            algorithms: ['HS256']
        },
        validate: validateUser
    });

    // Make all routes authenticated by default.
    server.auth.default('jwt');

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

    await server.register(coursesPlugin);
    await server.register(lecturesPlugin);
    await server.register(offeringsPlugin);
    await server.register(quizzesPlugin);
    await server.register(semestersPlugin);
    await server.register(topicsPlugin);
    await server.register(usersPlugin);

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
}

start().catch(err => {
    console.log(err);
    process.exit(1);
});
