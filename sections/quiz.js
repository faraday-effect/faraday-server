// @flow

import {coerceUid} from '../lib/mongoHelpers';

type ShortAnswerQuestionType = {
    _id: string,
    type: "short-answer",
    required: boolean,
    prompt: string
};

type MultipleChoiceOptionType = {
    value: string,
    text: string,
    correct: boolean
};

type MultipleChoiceQuestionType = {
    _id: string,
    type: "multiple-choice",
    required: boolean,
    prompt: string,
    options: Array<MultipleChoiceOptionType>
};

export type QuizType = {
    _id: string,
    title: string,
    questions: Array<MultipleChoiceQuestionType | ShortAnswerQuestionType>
};

export async function fetchQuiz(mongo: $FlowTODO, uid: string): Promise<QuizType> {
    const query = { _id: coerceUid(mongo, uid)};
    const quiz: QuizType =  await mongo.db.collection('quizzes').findOne(query);
    return quiz;
}
