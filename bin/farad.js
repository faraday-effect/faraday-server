#!/usr/bin/env node

const faker = require('faker');
const request = require('request-promise');
const baseUrl = 'http://localhost:8000/api';

function requestJson(endpoint) {
    return request.get({
        url: `${baseUrl}/${endpoint}`,
        json: true,
    }).then(obj => JSON.stringify(obj, null, 2));
}

function listCells () {
    requestJson('cells').then(json => console.log(json));
}

function listQuizzes () {
    requestJson('quizzes').then(json => console.log(json));
}

async function fakeUsers(n) {
    while (n--) {
        await request.post({
            url: `${baseUrl}/users`,
            json: true,
            body: {
                key: faker.random.uuid(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                roleKey: faker.random.arrayElement(['student', 'teacher']),
                email: faker.internet.email(),
                mobilePhone: faker.phone.phoneNumber(),
                officePhone: faker.phone.phoneNumber(),
                officeLocation: `${faker.lorem.word()} ${faker.random.number({ min: 101, max: 999})}`
            }
        });
    }
}

const argv = require('yargs')
    .usage('$0 <cmd> [args]')
    .command('list cells', 'list cells', {}, listCells)
    .command('list quizzes', 'list quizzes', {}, listQuizzes)
    .command('list users', 'list users')
    .command('fake users', 'add fake users',
        {
            n: {
                default: 10,
                describe: 'number of users',
                type: 'number'
            }
        },
        argv => fakeUsers(argv.n))
    .command('hello [name]', 'welcome ter yargs!',
        yargs => {
            yargs.positional('name', {
                type: 'string',
                default: 'Cambi',
                describe: 'the name to say hello to'
            })
        },
        argv => {
            console.log('hello', argv.name, 'welcome to yargs!')
        })
    .help()
    .argv;

