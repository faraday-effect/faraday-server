// @flow

import Joi from 'joi';
import Promise from 'bluebird';

import {coerceUid} from "../lib/mongoHelpers";

import type {Lecture, Module, Quiz, Topic} from "../types";
//import {readLecture} from "./lectures";
//import {readQuiz} from "./quizzes";

async function readLecture(mongo: $FlowTODO, uid: string) {
    const query = { _id: coerceUid(mongo, uid)};
    return await mongo.db.collection('lectures').findOne(query);
}

async function readQuiz(mongo: $FlowTODO, uid: string) {
    const query = { _id: coerceUid(mongo, uid)};
    return await mongo.db.collection('quizzes').findOne(query);
}

// CRUD
async function readTopic(mongo: $FlowTODO, uid: string) {
    const result = {
        topics: { byId: {} },
        lectures: { byId: {} },
        quizzes: { byId: {} }
    };

    const query = {_id: coerceUid(mongo, uid)};
    const topic: Topic = await mongo.db.collection('topics').findOne(query);
    result.topics.byId[topic._id] = topic;

    // This is a nice, simple way to invoke async database functions sequentially. Note that
    // topic.modules.forEach(...) does NOT work (see the link below). It is also possible do
    // handle these requests all in parallel with Promise.map from Bluebird.
    // See https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    for (let module of topic.modules) {
        switch (module.type) {
            case 'lecture':
                const lecture = await readLecture(mongo, module.module_id);
                result.lectures.byId[lecture._id] = lecture;
                break;
            case 'quiz':
                const quiz = await readQuiz(mongo, module.module_id);
                result.quizzes.byId[quiz._id] = quiz;
                break;
            default:
                throw new Error(`Invalid module type ${module.type}`);
        }
    }

    return result;
}

// async function readAllTopics(mongo: $FlowTODO) {
//     const topics = await mongo.db.collection('topics').find().toArray();
//     return await Promise.map(topics, async (topic) => await renderTopic(mongo, topic));
// }

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
                    // } else {
                    //     return await readAllTopics(mongo);
                    }
                }
            }
        ]);
    }
};

export default topicsPlugin;