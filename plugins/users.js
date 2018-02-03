// @flow

import Boom from 'boom';
import Joi from 'joi';
import invariant from 'invariant';

import {coerceUid} from "../lib/mongoHelpers";
import type {Permission, User} from "../types";

// CRUD
async function resolvePermissions(mongo: $FlowTODO, user: User): Promise<Array<Permission>> {
    const role = await mongo.db.collection('roles').findOne({ _id: user.roleId });
    invariant(role, `Role '${user.roleId}' not found`);

    const permissions: Array<Permission> = await mongo.db.collection('permissions').find({
        _id: { $in: role.permissions }
    }).toArray();

    return permissions;
}

async function readOneUser(mongo: $FlowTODO, email: string): Promise<User> {
    const user: User = await mongo.db.collection('users').findOne({ email: email });
    if (user) {
        const permissions: Array<Permission> = await resolvePermissions(mongo, user);
        user.permissions = permissions;
    }
    return user;
}

async function readAllUsers(mongo: $FlowTODO) {
    return await mongo.db.collection('users').find().toArray();
}

async function authenticate(mongo: $FlowTODO, email: string, password, string) {
    const unauthorizedMessage = "Your email address or password are invalid."
    const user = await readOneUser(mongo, email);
    if (!user) {
        return Boom.unauthorized(unauthorizedMessage);
    }
    if (password !== 'password') {
        return Boom.unauthorized(unauthorizedMessage);
    }

    return user;
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
                    }
                },
                handler: async function (request, h) {
                    const {email, password} = request.payload;
                    return await authenticate(request.mongo, email, password);
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
