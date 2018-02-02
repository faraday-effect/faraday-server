import _ from 'lodash';

const bar = {
    topics: {
        byId: {
            foo: { id: "foo", a: 1, b: 2},
            bar: { id: "bar", x: 4, y: 5}
        }
    }
};

const foo = {
    "topics": [
        { id: "foo", a: 1, b: 2},
        { id: "bar", x: 4, y: 5}
    ],
    "quizzes": [
        { id: "baz", a: 1, b: 2},
        { id: "quux", x: 4, y: 5}
    ]
};

const quux = { id: "foo", a: 1, b: 2};
var result = { [quux.id] : quux };

const baz = [
    { id: "foo", a: 1, b: 2},
    { id: "bar", x: 4, y: 5}
];

const tmp = _.map(baz, elt => ({ [elt.id]: elt }));

result = tmp.reduce((acc, elt) => {
    _.forEach(_.keys(elt), key => acc[key] = elt[key]);
    return acc;
}, {});

function toIdMap(objs) {
    const objsById = _.map(objs, obj => ({ [obj.id]: obj }));
    const oneObj = objsById.reduce((acc, obj) => {
        _.forEach(_.keys(obj), key => acc[key] = obj[key])
        return acc;
    }, {});
    return oneObj;
}

result = toIdMap(baz);

function multiIdMap(topLevel) {
    result = {};
    _.forEach(_.keys(topLevel), key => {
        result[key] = { byId: toIdMap(topLevel[key]) };
    });
    return result;
}

result = multiIdMap(foo);

console.log(JSON.stringify(result, null, 4));