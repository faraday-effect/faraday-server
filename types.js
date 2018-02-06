// @flow

export type Module = {
    type: "lecture" | "quiz",
    moduleId: string
};

export type Topic = {
    _id: string,
    title: string,
    intro: Array<string>,
    modules: Array<Module>
};

type InterTitle = {
    type: "intertitle",
    _id: string,
    title: string,
    content: Array<string>;
};

type Listing = {
    type: "listing",
    _id: string,
    meta: {
        language: string,
        fileName?: string
    },
    content: Array<string>
};

type Note = {
    type: "note",
    _id: string,
    content: Array<string>
};

type Segment = InterTitle | Listing | Note;

export type Lecture = {
    _id: string,
    segments: Array<Segment>;
};

type ShortAnswerQuestion = {
    type: "short-answer",
    _id: string,
    required: boolean,
    prompot: string
};

type MultipleChoiceOption = {
    value: string,
    text: string,
    correct: boolean;
};

type MultipleChoiceQuestion = {
    type: "multiple-choice",
    _id: string,
    required: boolean,
    prompt: string,
    options: Array<MultipleChoiceOption>
};

type QuizQuestion = MultipleChoiceQuestion | ShortAnswerQuestion;

export type Quiz = {
    _id: string,
    title: string,
    questions: Array<QuizQuestion>
};

export type Permission = {
    _id: string,
    description: string
};

export type User = {
    _id: string,
    firstName: string,
    lastName: string,
    roleId: string,
    permissions: Array<Permission>,
    scope: Array<string>,
    email: string,
    hashedPassword: string,
    mobilePhone: string,
    officePhone: string,
    officeLocation: string
};