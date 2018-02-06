// @flow

import Boom from 'boom';
import Joi from 'joi';
import invariant from 'invariant';

import type {Permission, User} from "../types";
import {authenticateUser} from "../lib/authentication";

// CRUD
async function resolvePermissions(mongo: $FlowTODO, user: User): Promise<Array<Permission>> {
    const role = await mongo.db.collection('roles').findOne({ _id: user.roleId });
    invariant(role, `Role '${user.roleId}' not found`);

    return await mongo.db.collection('permissions').find({_id: { $in: role.permissions }}).toArray();
}

export async function readOneUser(mongo: $FlowTODO, email: string): Promise<User> {
    const user: User = await mongo.db.collection('users').findOne({ email: email });
    if (user) {
        user.permissions = await resolvePermissions(mongo, user);
    }
    return user;
}

async function readAllUsers(mongo: $FlowTODO) {
    return await mongo.db.collection('users').find().toArray();
}


// API
const usersPlugin = {
    name: 'users',
    version: '1.0.0',
    register: function (server: any, options: any) {
        server.route([
            {
                method: 'GET',
                path: '/api/users',
                handler: async function(request, h) {
                    return await readAllUsers(request.mongo);
                }
            },
            {
                method: 'GET',
                path: '/api/users/{id}',
                handler: async function (request, h) {
                    const user = await readOneUser(request.mongo, request.params.id);
                    if (user) {
                        return user;
                    } else {
                        return Boom.notFound(`No user with ID '${request.params.id}'`);
                    }
                }
            },
            {
                method: 'POST',
                path: '/api/authenticate',
                options: {
                    validate: {
                        payload: {
                            email: Joi.string().email().required().description('Email address'),
                            password: Joi.string().required().description('Password')
                        }
                    },
                    auth: false
                },
                handler: async function (request, h) {
                    const {email, password} = request.payload;
                    return await authenticateUser(request.mongo, email, password);
                }
            },
            {
                method: 'POST',
                path: '/api/users',
                handler: async function(request, h) {
                    return await request.mongo.db.collection('users').insertOne(request.payload);
                }
            }
        ]);
    }
};

export default usersPlugin;
