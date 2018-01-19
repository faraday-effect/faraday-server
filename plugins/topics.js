// @flow

import Joi from 'joi';
import Promise from 'bluebird';

import type { MarkdownSource } from '../lib/markdown'
import { renderMarkdown } from '../lib/markdown';

import {fetchListing, renderListing} from "../cells/listing";
import type {ListingType} from "../cells/listing";

import {fetchQuiz} from "../cells/quiz";
import type {QuizType} from "../cells/quiz";

import {coerceUid} from "../lib/mongoHelpers";

type ObjectIdType = {
    id: string,
    _bsontype: string,
    toHexString: () => string
};

type CellType = {
    type: "listing" | "quiz",
    cell_id: string
};

type TopicType = {
    _id: string,
    title: string,
    intro: MarkdownSource,
    cells: Array<CellType>
};

async function renderCell(mongo: $FlowTODO, cell: CellType) {
    switch (cell.type) {
        case "listing":
            const listing: ListingType = await fetchListing(mongo, cell.cell_id);
            return {
                type: cell.type,
                ...renderListing(listing)
            };
        case "quiz":
            const quiz: QuizType = await fetchQuiz(mongo, cell.cell_id);
            return {
                type: cell.type,
                ...quiz
            }
        default:
            throw new Error(`Invalid cell type: ${cell.type}`);
    }
}

async function renderTopic(mongo: $FlowTODO, topic: TopicType) {
    return {
        ...topic,
        intro: renderMarkdown(topic.intro),
        cells: await Promise.map(topic.cells, cell => renderCell(mongo, cell))
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