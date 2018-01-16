// @flow

import Joi from 'joi';

import {fetchListing, renderListing} from '../cells/listing';
import type {ListingType} from '../cells/listing';

const listingsPlugin = {
    name: 'listings',
    version: '1.0.0',
    register: function (server: $FlowTODO, options: $FlowTODO) {
        server.route([
            {
                method: 'GET',
                path: '/api/listings/{uid?}',
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
                        //     listing: Joi.string(),
                        //     segments: Joi.array().items(Joi.object({
                        //         key: Joi.string(),
                        //         type: Joi.array().items(Joi.string()),
                        //         content: Joi.string().allow('')
                        //     }))
                        // })
                    }
                },
                handler: async function (request, h) {
                    if (request.params.uid) {
                        const listing: ListingType = await fetchListing(request.mongo, request.params.uid);
                        return renderListing(listing);
                    } else {
                        const listings = await request.mongo.db.collection('listings').find().toArray();
                        return listings.map(listing => renderListing(listing));
                    }
                }
            }
        ]);
    }
};

export default listingsPlugin;
