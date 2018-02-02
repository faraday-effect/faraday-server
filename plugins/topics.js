// @flow

import Joi from 'joi';
import _ from 'lodash';
import invariant from 'invariant';

import {coerceUid} from "../lib/mongoHelpers";

import type {Lecture, Module, Quiz, Topic} from "../types";
import {readLecture} from "./lectures";
import {readQuiz} from "./quizzes";

// CRUD
async function resolveModules(mongo: $FlowTODO, topics: Array<Topic>) {
    const result = {};

    const readLookupTable = {
        lecture: readLecture,
        quiz: readQuiz
    };

    // This is a nice, simple way to invoke async database functions sequentially. Note that
    // topic.modules.forEach(...) does NOT work (see the link below). It is also possible do
    // handle these requests all in parallel with Promise.map from Bluebird.
    // See https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop

    for (let topic of topics) {
        for (let module of topic.modules) {
            const type = module.type;
            if (!result[type]) {
                result[type] = {};
            }
            const readFn = readLookupTable[type];
            invariant(readFn, `No read function for module type '${type}'`);
            result[type][module.moduleId] = await readFn(mongo, module.moduleId);
        }
    }

    return result;
}

async function readTopic(mongo: $FlowTODO, uid: string) {
    const query = {_id: coerceUid(mongo, uid)};
    const topic = await mongo.db.collection('topics').findOne(query);

    const modules = await resolveModules(mongo, [topic]);

    return {
        topic: { [topic._id]: topic},
        ...modules
    };
}

async function readAllTopics(mongo: $FlowTODO) {
    const topics = await mongo.db.collection('topics').find().toArray();

    const modules = await resolveModules(mongo, topics);

    return {
        topic: _.fromPairs(_.map(topics, topic => [ topic._id, topic ])),
        ...modules
    }
}

// API
const topicsPlugin = {
    name: 'topics',
    version: '1.0.0',
    register: function (server: $FlowTODO, options: $FlowTODO) {
        server.route([
            {
                method: 'POST',
                path: '/api/topics',
                handler: async function (request, h) {
                    return await request.mongo.db.collection('topics').insertOne(request.payload);
                }
            },
            {
                method: 'GET',
                path: '/api/topics/{uid?}',
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
                        //     topic: Joi.string(),
                        //     segments: Joi.array().items(Joi.object({
                        //         uid: Joi.string(),
                        //         type: Joi.array().items(Joi.string()),
                        //         content: Joi.string().allow('')
                        //     }))
                        // })
                    }
                },
                handler: async function (request, h) {
                    const mongo = request.mongo;

                    if (request.params.uid) {
                        return await readTopic(mongo, request.params.uid);
                    } else {
                        return await readAllTopics(mongo);
                    }
                }
            }
        ]);
    }
};

export default topicsPlugin;