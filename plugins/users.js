const usersPlugin = {
    name: 'users',
    version: '1.0.0',
    register: function (server, options) {
        server.route([
            {
                method: 'GET',
                path: '/api/users',
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
                handler: async function(request, h) {
                    return await request.mongo.db.collection('users').insertOne(request.payload);
                }
            }
        ]);
    }
};

export default usersPlugin;
