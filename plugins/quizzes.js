// @flow

import Joi from "joi";

import type {Quiz} from "../types";

import {coerceUid} from "../lib/mongoHelpers";

// CRUD
export async function readQuiz(mongo: $FlowTODO, uid: string): Promise<Quiz> {
    const query = { _id: coerceUid(mongo, uid)};
    return await mongo.db.collection('quizzes').findOne(query);
}

async function readAllQuizzes(mongo: $FlowTODO) {
    return await mongo.db.collection('quizzes').find().toArray();
}

// API
const quizzesPlugin = {
    name: 'quizzes',
    version: '1.0.0',
    register: function (server: $FlowTODO, options: $FlowTODO) {
        server.route([
            {
                method: 'GET',
                path: '/api/quizzes/{uid?}',
                options: {
                    validate: {
                        params: {
                            uid: Joi.string()
                        }
                    },
                    handler: async function (request, h) {
                        if (request.params.uid) {
                            return await readQuiz(request.mongo, request.params.uid);
                        } else {
                            return readAllQuizzes(request.mongo);
                        }
                    }
                }
            }
        ]);
    }
};

export default quizzesPlugin;
