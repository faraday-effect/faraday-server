import Joi from 'joi';
import {coerceUid} from "../lib/mongoHelpers";
import type {Lecture} from "../types";

// CRUD
export async function readLecture(mongo: $FlowTODO, uid: string) {
    const query = { _id: coerceUid(mongo, uid)};
    return await mongo.db.collection('lectures').findOne(query);
}

async function readAllLectures(mongo: $FlowTODO) {
    return await mongo.db.collection('lectures').find().toArray();
}

// API
const lecturesPlugin = {
    name: 'lectures',
    version: '1.0.0',
    register: function (server, options) {
        server.route([
            {
                method: 'GET',
                path: '/api/lectures/{uid?}',
                options: {
                    validate: {
                        params: {
                            uid: Joi.string()
                        }
                    },
                    response: {
                        // schema: Joi.object({
                        //     _id: Joi.string(),
                        //     title: Joi.string(),
                        //     lecture: Joi.string(),
                        //     segments: Joi.array().items(Joi.object({
                        //         key: Joi.string(),
                        //         type: Joi.array().items(Joi.string()),
                        //         content: Joi.string().allow('')
                        //     }))
                        // })
                    }
                },
                handler: async function (request, h) {
                    if (request.params.uid) {
                        return await readLecture(request.mongo, request.params.uid);
                    } else {
                        return await readAllLectures(request.mongo);
                    }
                }
            }
        ]);
    }
};

export default lecturesPlugin;
