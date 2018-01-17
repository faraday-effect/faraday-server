// @flow

type ShortAnswerQuestionType = {
    uid: string,
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
    uid: string,
    type: "multiple-choice",
    required: boolean,
    prompt: string,
    options: Array<MultipleChoiceOptionType>
};

export type QuizType = {
    uid: string,
    title: string,
    questions: Array<MultipleChoiceQuestionType | ShortAnswerQuestionType>
};

export async function fetchQuiz(mongo: $FlowTODO, uid: string): Promise<QuizType> {
    const query = { uid: uid};
    const quiz: QuizType =  await mongo.db.collection('quizzes').findOne(query);
    return quiz;
}
