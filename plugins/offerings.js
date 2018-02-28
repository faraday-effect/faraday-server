// @flow

import Boom from 'boom';
import Joi from 'joi';

// CRUD
async function readAllOfferings(mongo: $FlowTODO) {
    return await mongo.db.collection('offerings').find().toArray();
}

async function readSemesterOfferings(mongo: $FlowTODO, semesterId: string) {
    const offeringsCursor = mongo.db
        .collection('offerings')
        .find({semesterId: semesterId});

    const courseIds = [];
    while (await offeringsCursor.hasNext()) {
        const obj = await offeringsCursor.next();
        courseIds.push(obj.courseId);
    }

    const courses = await mongo.db
        .collection('courses')
        .find({_id: {$in: courseIds}});

    return {
        offerings: await offeringsCursor.toArray(),
        courses: await courses.toArray()
    };
}

// API
const offeringsPlugin = {
    name: 'offerings',
    version: '1.0.0',
    register: function (server: any, options: any) {
        server.route([
            {
                method: 'GET',
                path: '/api/offerings/{semesterId?}',
                handler: async function(request, h) {
                    if (request.params.semesterId) {
                        return await readSemesterOfferings(request.mongo, request.params.semesterId);
                    } else {
                        return await readAllOfferings(request.mongo);
                    }
                }
            }
        ]);
    }
};

export default offeringsPlugin;
