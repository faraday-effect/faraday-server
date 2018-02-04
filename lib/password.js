// @flow

import {hash, compare} from 'bcrypt';

const saltRounds = 10;

export async function hashPassword(plainText: string): Promise<string> {
    return await hash(plainText, saltRounds);
}

export async function checkPassword(plainText: string, cypherText: string): Promise<boolean> {
    return await compare(plainText, cypherText);
}
