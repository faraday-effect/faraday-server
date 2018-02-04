// @flow

import topicsPlugin from './plugins/topics';
import lecturesPlugin from "./plugins/lectures";
import usersPlugin from "./plugins/users";
import quizzesPlugin from "./plugins/quizzes";

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

    await server.register(quizzesPlugin);
    await server.register(topicsPlugin);
    await server.register(usersPlugin);
    await server.register(lecturesPlugin);

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
}

start().catch(err => {
    console.log(err);
    process.exit(1);
});
