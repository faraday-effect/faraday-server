// @flow

import {hashPassword} from "../lib/password";

async function test(plainText) {
    const result = await hashPassword(plainText);
    console.log(result);
}

test('password');
