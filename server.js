'use strict';

const Joi = require('joi');
const Boom = require('boom');
const invariant = require('invariant');
const hljs = require('highlight.js');
const md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return '<pre class="hljs"><code>' +
                    hljs.highlight(lang, str, true).value +
                    '</code></pre>';
            } catch (__) {}
        }
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

// Create a server with a host and port
const server = require('hapi').server({
    host: 'localhost',
    port: 8000
});

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
                        destination: Joi.string().valid('projector', 'podium', 'participant', 'publication')
                    }
                }
            },
            handler: async function(request, h) {
                const notes = await request.mongo.db.collection('notes').find().toArray();
                const note = notes[0];

                const matchingOutputs = new Set();
                matchingOutputs.add(request.params.destination);
                for (let key of Object.keys(note.outputMap)) {
                    if (note.outputMap[key].find(entry => entry === request.params.destination)) {
                        matchingOutputs.add(key);
                    }
                }

                function formatContent(segment) {
                    const contentString = segment.content.join('\n');
                    switch(segment.type[0]) {
                        case 'listing':
                            invariant(segment.type.length >= 2, `Invalid listing type: ${segment.type}`);
                            const language = segment.type[1];
                            const hlCode = hljs.highlight(language, contentString);
                            return `<pre><code class="${language} hljs">${hlCode.value}</code></pre>`;
                        case 'markdown':
                            return md.render(contentString);
                        default:
                            throw new Error(`Invalid segment type: ${segment.type}`);
                    }
                }

                const results = [];
                note.segments.map((segment, idx) => {
                    if (matchingOutputs.has(segment.output)) {
                        results.push({
                            key: segment.key || `segment-${idx}`,
                            type: segment.type,
                            content: formatContent(segment)
                        });
                    }
                });
                return results;
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
