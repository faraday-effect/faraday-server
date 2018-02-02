// @flow

import Joi from 'joi';
import _ from 'lodash';

import {coerceUid} from "../lib/mongoHelpers";

import type {Lecture, Module, Quiz, Topic} from "../types";
import {readLecture} from "./lectures";
import {readQuiz} from "./quizzes";

// CRUD
async function resolveModules(mongo: $FlowTODO, topic: Topic) {
    const result = {};

    // This is a nice, simple way to invoke async database functions sequentially. Note that
    // topic.modules.forEach(...) does NOT work (see the link below). It is also possible do
    // handle these requests all in parallel with Promise.map from Bluebird.
    // See https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
    for (let module of topic.modules) {
        switch (module.type) {
            case 'lecture':
                result.lectures = result.lectures || [];
                const lecture = await readLecture(mongo, module.moduleId);
                result.lectures.push(lecture);
                break;
            case 'quiz':
                result.quizzes = result.quizzes || [];
                const quiz = await readQuiz(mongo, module.moduleId);
                result.quizzes.push(quiz);
                break;
            default:
                throw new Error(`Invalid module type ${module.type}`);
        }
    }

    return result;
}

function needABetterName(object) {

}

async function readTopic(mongo: $FlowTODO, uid: string) {
    const query = {_id: coerceUid(mongo, uid)};
    const topic: Topic = await mongo.db.collection('topics').findOne(query);
    const modules = await resolveModules(mongo, topic);

    return {
        topics: [topic],
        ...modules
    }
}

async function readAllTopics(mongo: $FlowTODO) {
    const docs = await mongo.db.collection('topics').find({}, {_id: 1}).toArray();
    let allResults = {}
    for (let doc of docs) {
        const oneResult = await readTopic(mongo, doc._id);
        _.forEach(_.keys(oneResult), key => {
            allResults[key] = allResults[key] || [];
            allResults[key] = allResults[key].concat(oneResult[key]);
        })
    }

    return allResults;
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