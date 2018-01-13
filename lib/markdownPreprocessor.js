const fs = require('fs');
const readline = require('readline');
const invariant = require('invariant');
const debug = require('debug')('preproc');

let title = null;
let topic = null;
const segments = [];
const allKeys = new Set();
let currentKey = null;
let currentLines = [];
const currentOutputs = new Set();
let outputUndo = [];

function totalLength(lines) {
    let totalLength = 0;
    lines.forEach(line => totalLength += line.length);
    return totalLength;
}

function setCurrentKey(key) {
    invariant(!allKeys.has(key), `Duplicate key '${key}'`);
    allKeys.add(key);
    currentKey = key;
}

function updateOutputs(op, arg) {
    if (op === '+') {
        invariant(!currentOutputs.has(arg), `Already have '${arg}' in outputs`);
        currentOutputs.add(arg);
        debug(`Added '${arg}' to outputs`);
    } else if (op === '-') {
        invariant(currentOutputs.has(arg), `Don't have '${arg}' in outputs`);
        currentOutputs.delete(arg);
        debug(`Removed '${arg}' from outputs`);
    }
    debug(`Outputs now ${Array.from(currentOutputs).join(', ')}`);
}

function completeCurrentSegment() {
    // No outputs are current; skip.
    // Should only happen before first @@output directive.
    if (currentOutputs.size === 0) {
        return;
    }

    // Remove any empty lines at the end of the list of current lines.
    while (currentLines.length > 0 && currentLines[currentLines.length - 1].length === 0) {
        currentLines.pop();
    }

    // Total length of all strings is zero; skip.
    if (totalLength(currentLines) === 0) {
        return;
    }

    const newSegment = {
        for: Array.from(currentOutputs),
        content: currentLines
    };
    if (currentKey) {
        newSegment.key = currentKey;
    }
    segments.push(newSegment);

    currentLines = [];
    currentKey = null;
}

function handleOutputDirective(outputSpecs) {
    completeCurrentSegment();
    outputUndo = [];

    outputSpecs.forEach(spec => {
        const op = spec[0];
        if (op === '+' || op === '-') {
            arg = spec.slice(1);
            updateOutputs(op, arg);
            outputUndo.push([op === '+' ? '-' : '+', arg]);
        } else {
            setCurrentKey(spec);
        }
    });
}

function handleUndoDirective() {
    invariant(outputUndo.length > 0, 'No outputs to undo');
    completeCurrentSegment();
    outputUndo.forEach(([op, arg]) => updateOutputs(op, arg));
}

function handleSegmentDirective(args) {
    invariant(args.length === 1, `Need one segment argument, got ${args}`);
    completeCurrentSegment();
    setCurrentKey(args[0]);
}

function handleContent(line) {
    if (line.length > 0 || totalLength(currentLines) > 0) {
        currentLines.push(line);
        debug(`Line ${line}`);
    }
}

function processLine(line) {
    if (line.startsWith('@@')) {
        line = line.trim();
        const [command, ...args] = line.split(/:?\s+/);
        debug(`Command ${command} with ${args.length ? `args ${args}` : 'no args'}`);

        switch(command) {
            case '@@output':
                handleOutputDirective(args);
                break;
            case '@@segment':
                handleSegmentDirective(args);
                break;
            case '@@title':
                invariant(!title, `Title already set to ${title}`);
                title = args.join(' ');
                debug(`Set title to '${title}'`);
                break;
            case '@@topic':
                invariant(!topic, `Topic already set to ${title}`);
                topic = args.join(' ');
                debug(`Set topic to '${topic}'`);
                break;
            case '@@undo':
                handleUndoDirective();
                break;
        }
    } else {
        handleContent(line);
    }
}

function createResult() {
    invariant(title, 'No title set');
    invariant(topic, 'No topic set');
    invariant(segments.length, 'No segments');

    return {
        topic,
        title,
        segments
    };
}

function preprocessMarkdown(fileName) {
    return new Promise((resolve, reject) => {
        const lineReader = readline.createInterface({
            input: fs.createReadStream(fileName)
        });

        lineReader.on('line', line => processLine(line));
        lineReader.on('close', () => resolve(createResult()));
        lineReader.on('error', err => reject(err));
    });
}

module.exports = preprocessMarkdown;
