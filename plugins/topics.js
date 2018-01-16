// @flow

import Joi from 'joi';
import invariant from 'invariant';

import type { MarkdownSource } from '../lib/markdown'
import { renderMarkdown } from '../lib/markdown';

import {fetchListing, renderListing} from "../cells/listing";
import type {ListingType} from "../cells/listing";

type ObjectIdType = {
    id: string,
    _bsontype: string,
    toHexString: () => string
};

type CellType = {
    type: "listing",
    uid: string
};

type TopicType = {
    uid: string,
    title: string,
    intro: MarkdownSource,
    cells: Array<CellType>
};

async function renderCell(mongo: $FlowTODO, cell: CellType) {
    switch (cell.type) {
        case "listing":
            const listing: ListingType = await fetchListing(mongo, cell.uid)
            return renderListing(listing);
        default:
            throw new Error(`Invalid cell type: ${cell.type}`);
    }
}

function renderTopic(mongo: $FlowTODO, topic: TopicType) {
    return {
        uid: topic.uid,
        title: topic.title,
        intro: renderMarkdown(topic.intro),
        cells: topic.cells.map(cell => renderCell(mongo, cell))
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
                path: '/api/topics/{topicUid?}',
                options: {
                    validate: {
                        params: {
                            topicUid: Joi.string()
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

                    if (request.params.topicUid) {
                        const query = { _id: new mongo.ObjectID(request.params.topicUid)};
                        const topic: TopicType = await mongo.db.collection('topics').findOne(query);
                        return renderTopic(request.mongo, topic);
                    } else {
                        const topics = await request.mongo.db.collection('topics').find().toArray();
                        return topics.map(topic => renderTopic(mongo, topic));
                    }
                }
            }
        ]);
    }
};

export default topicsPlugin;