// @flow

// The hapi-auth-jwt2 documentation suggests using this code to create the key:
// node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"
import {JWT_SECRET_KEY} from '../private';
import {hash, compare} from 'bcrypt';
import JWT from 'jsonwebtoken';

import Boom from "boom";

import type {User} from "../types";
import {readOneUser} from "../plugins/users";

// Password encryption and decryption.
const saltRounds = 10;

export async function hashPassword(plainText: string): Promise<string> {
    return await hash(plainText, saltRounds);
}

export async function checkPassword(plainText: string, cypherText: string): Promise<boolean> {
    return await compare(plainText, cypherText);
}

// JSON Web Token
const createToken = (user: User) =>
    JWT.sign(
        {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            roleId: user.roleId,
            permissions: user.permissions,
            email: user.email
        },
        JWT_SECRET_KEY,
        {
            algorithm: 'HS256',
            expiresIn: "4d"
        }
    );

export async function authenticateUser(mongo: $FlowTODO, email: string, clearPassword: string) {
    const unauthorizedMessage = "Your email address or password are invalid.";
    const user: User = await readOneUser(mongo, email);
    if (!user) {
        return Boom.unauthorized(unauthorizedMessage);
    }
    if (!await checkPassword(clearPassword, user.hashedPassword)) {
        return Boom.unauthorized(unauthorizedMessage);
    }

    // Fix up user object
    delete user.hashedPassword;
    user.scope = user.permissions.map(permission => permission._id.toLowerCase());

    return {
        user,
        jwt: createToken(user)
    };
}

export async function validateUser(decoded: Object, request: any, h: any) {
    if (decoded.hasOwnProperty('email')) {
        const user: User = await readOneUser(request.mongo, decoded.email);
        if (user) {
            return {isValid: true};
        }
    }

    return {isValid: false}
}