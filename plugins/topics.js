// @flow

import Joi from 'joi';
import Promise from 'bluebird';

import type { MarkdownSource } from '../lib/markdown'
import { renderMarkdown } from '../lib/markdown';

import {fetchListing, renderListing} from "../sections/listing";
import type {ListingType} from "../sections/listing";

import {fetchQuiz} from "../sections/quiz";
import type {QuizType} from "../sections/quiz";

import {coerceUid} from "../lib/mongoHelpers";

type ObjectIdType = {
    id: string,
    _bsontype: string,
    toHexString: () => string
};

type SectionType = {
    type: "listing" | "quiz",
    section_id: string
};

type TopicType = {
    _id: string,
    title: string,
    intro: MarkdownSource,
    sections: Array<SectionType>
};

async function renderSection(mongo: $FlowTODO, section: SectionType) {
    switch (section.type) {
        case "listing":
            const listing: ListingType = await fetchListing(mongo, section.section_id);
            return {
                type: section.type,
                ...renderListing(listing)
            };
        case "quiz":
            const quiz: QuizType = await fetchQuiz(mongo, section.section_id);
            return {
                type: section.type,
                ...quiz
            }
        default:
            throw new Error(`Invalid section type: ${section.type}`);
    }
}

async function renderTopic(mongo: $FlowTODO, topic: TopicType) {
    return {
        ...topic,
        intro: renderMarkdown(topic.intro),
        sections: await Promise.map(topic.sections, section => renderSection(mongo, section))
    };
}

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
                        const query = { _id: coerceUid(mongo, request.params.uid)};
                        const topic: TopicType = await mongo.db.collection('topics').findOne(query);
                        return await renderTopic(request.mongo, topic);
                    } else {
                        const topics = await request.mongo.db.collection('topics').find().toArray();
                        return await Promise.map(topics, async (topic) => await renderTopic(mongo, topic));
                    }
                }
            }
        ]);
    }
};

export default topicsPlugin;