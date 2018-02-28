// @flow

import Boom from 'boom';
import Joi from 'joi';

// CRUD
async function readAllCourses(mongo: $FlowTODO) {
    return await mongo.db.collection('courses').find().toArray();
}

async function readOneCourse(mongo: $FlowTODO, courseId: string) {
    return await mongo.db
        .collection('courses')
        .findOne({_id: courseId});
}

// API
const coursesPlugin = {
    name: 'courses',
    version: '1.0.0',
    register: function (server: any, options: any) {
        server.route([
            {
                method: 'GET',
                path: '/api/courses/{courseId?}',
                handler: async function(request, h) {
                    if (request.params.courseId) {
                        return await readOneCourse(request.mongo, request.params.courseId);
                    } else {
                        return await readAllCourses(request.mongo);
                    }
                }
            }
        ]);
    }
};

export default coursesPlugin;
