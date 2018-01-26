// @flow

import Joi from "joi";

import {fetchQuiz} from '../sections/quiz';
import type {QuizType} from '../sections/quiz';

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
                            let quiz: QuizType = await fetchQuiz(request.mongo, request.params.uid);
                            return quiz;
                        } else {
                            return await request.mongo.db.collection('quizzes').find().toArray();
                        }
                    }
                }
            }
        ]);
    }
};

module.exports = quizzesPlugin;