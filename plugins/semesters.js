// @flow

import Boom from 'boom';
import Joi from 'joi';

// CRUD
async function readAllSemesters(mongo: $FlowTODO) {
    return await mongo.db.collection('semesters').find().toArray();
}

// API
const semestersPlugin = {
    name: 'semesters',
    version: '1.0.0',
    register: function (server: any, options: any) {
        server.route([
            {
                method: 'GET',
                path: '/api/semesters',
                handler: async function(request, h) {
                    return await readAllSemesters(request.mongo);
                }
            }
        ]);
    }
};

export default semestersPlugin;
