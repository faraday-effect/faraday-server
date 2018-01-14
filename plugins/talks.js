const Joi = require('joi');
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

function formatSegment(segment) {
    const contentString = segment.content.join('\n');
    switch (segment.type[0]) {
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

const talksPlugin = {
    name: 'talks',
    version: '1.0.0',
    register: function (server, options) {
        server.route([
            {
                method: 'POST',
                path: '/api/talks',
                options: {
                    cors: true
                },
                handler: async function (request, h) {
                    return await request.mongo.db.collection('talks').insertOne(request.payload);
                }
            },
            {
                method: 'GET',
                path: '/api/talks/{destination}',
                options: {
                    cors: true,
                    validate: {
                        params: {
                            destination: Joi.string().valid('projector', 'podium', 'participant', 'publication')
                        }
                    }
                },
                handler: async function (request, h) {
                    const talks = await request.mongo.db.collection('talks').find().toArray();

                    const allResults = [];
                    for (let talk of talks) {
                        const matchingOutputs = new Set();
                        matchingOutputs.add(request.params.destination);
                        for (let key of Object.keys(talk.outputMap)) {
                            if (talk.outputMap[key].find(entry => entry === request.params.destination)) {
                                matchingOutputs.add(key);
                            }
                        }

                        const results = [];
                        talk.segments.map((segment, idx) => {
                            if (matchingOutputs.has(segment.output)) {
                                results.push({
                                    key: segment.key || `segment-${idx}`,
                                    type: segment.type,
                                    content: formatSegment(segment)
                                });
                            }
                        });
                        allResults.push({
                            title: talk.title,
                            topic: talk.topic,
                            segments: results
                        });
                    }

                    return allResults;
                }
            }
        ]);
    }
};

module.exports = talksPlugin;