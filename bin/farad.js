#!/usr/bin/env node

const fs = require('fs');
const faker = require('faker');
const request = require('request-promise');
const baseUrl = 'http://localhost:8000/api';

function requestJson(endpoint) {
    return request.get({
        url: `${baseUrl}/${endpoint}`,
        json: true,
    }).then(obj => {
        console.log(obj);
        return JSON.stringify(obj, null, 2)
    });
}

function listCells () {
    requestJson('cells').then(json => console.log(json));
}

function listQuizzes () {
    requestJson('quizzes').then(json => console.log(json));
}

function listNotes() {
    requestJson('notes').then(json => console.log(json));
}

function listUsers () {
    requestJson('users').then(json => console.log(json));
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

function addNotes(key, fileName) {
    console.log("ADD NOTES", key, fileName);
    fs.readFile(fileName, 'utf8', async (err, data) => {
        if (err) {
            throw new Error(`Can't read ${fileName}: ${err}`);
        }
        await request.post({
            url: `${baseUrl}/notes`,
            json: true,
            body: {
                key,
                content: data
            }
        });
    });
}

const argv = require('yargs')
    .usage('$0 <cmd> [args]')
    .command('add notes <key> <fileName>', 'add notes', {},
        argv => addNotes(argv.key, argv.fileName))
    .command('list cells', 'list cells', {}, listCells)
    .command('list notes', 'list notes', {}, listNotes)
    .command('list quizzes', 'list quizzes', {}, listQuizzes)
    .command('list users', 'list users', {}, listUsers)
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

