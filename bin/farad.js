#!/usr/bin/env node

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

const argv = require('yargs')
    .usage('$0 <cmd> [args]')
    .command('cells list', 'list cells', {}, listCells)
    .command('quizzes list', 'list quizzes', {}, listQuizzes)
    .command('users list', 'list users')
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
