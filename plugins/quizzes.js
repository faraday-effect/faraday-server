const quizzesPlugin = {
    name: 'quizzes',
    version: '1.0.0',
    register: function (server, options) {
        server.route([
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
            }
        ]);
    }
};

module.exports = quizzesPlugin;