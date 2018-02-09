// @flow

import Boom from 'boom';
import Joi from 'joi';

// CRUD
async function readAllOfferings(mongo: $FlowTODO) {
    return await mongo.db.collection('offerings').find().toArray();
}

// API
const offeringsPlugin = {
    name: 'offerings',
    version: '1.0.0',
    register: function (server: any, options: any) {
        server.route([
            {
                method: 'GET',
                path: '/api/offerings',
                handler: async function(request, h) {
                    return await readAllOfferings(request.mongo);
                }
            }
        ]);
    }
};

export default offeringsPlugin;
