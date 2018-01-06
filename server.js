'use strict';

const Hapi = require('hapi');
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

const mockCellList = [
    'python-bridge-quiz'
];

const mockQuizMap = {
    'python-bridge-quiz': {
        title: 'The Python Bridge',
        key: 'python-bridge-quiz',
        questions: [
            {
                key: 'your-name',
                type: quizConstants.SHORT_ANSWER,
                required: true,
                prompt: 'What is your name?'
            },
            {
                key: 'your-quest',
                type: quizConstants.MULTIPLE_CHOICE,
                required: true,
                prompt: 'What is your quest?',
                options: [
                    {
                        value: 'grail',
                        text: 'I seek the Holy Grail',
                        correct: true
                    },
                    {
                        value: 'shrubbery',
                        text: 'I desire a shrubbery',
                        correct: false
                    },
                    {
                        value: 'groceries',
                        text: 'I seek the grocery store',
                        correct: false
                    }
                ]
            },
            {
                key: 'your-favorite-color',
                type: quizConstants.SHORT_ANSWER,
                required: false,
                prompt: 'What is your favorite color?'
            },
            {
                key: 'bunny-preference',
                type: quizConstants.MULTIPLE_CHOICE,
                required: true,
                prompt: 'Killer Bunny?',
                options: [
                    {
                        value: 'yes',
                        text: 'Yes, please',
                        correct: true
                    },
                    {
                        value: 'no',
                        text: 'No, thank you',
                        correct: false
                    }

                ]
            }
        ]
    }
};

// Add the route
server.route([
    {
        method: 'GET',
        path: '/api/cells',
        options: {
            cors: true
        },
        handler: function (request, h) {
            return mockCellList;
        }
    },
    {
        method: 'GET',
        path: '/api/quizzes',
        options: {
            cors: true
        },
        handler: function (request, h) {
            return mockQuizMap;
        }
    }
]);

// Start the server
async function start() {
    try {
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
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
}

start();
