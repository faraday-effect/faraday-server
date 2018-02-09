// @flow

import Boom from 'boom';
import Joi from 'joi';

// CRUD
async function readAllCourses(mongo: $FlowTODO) {
    return await mongo.db.collection('courses').find().toArray();
}

// API
const coursesPlugin = {
    name: 'courses',
    version: '1.0.0',
    register: function (server: any, options: any) {
        server.route([
            {
                method: 'GET',
                path: '/api/courses',
                handler: async function(request, h) {
                    return await readAllCourses(request.mongo);
                }
            }
        ]);
    }
};

export default coursesPlugin;
