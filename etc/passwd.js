// @flow

import {hashPassword} from "../lib/authentication";

async function test(plainText) {
    const result = await hashPassword(plainText);
    console.log(result);
}

test('password');
