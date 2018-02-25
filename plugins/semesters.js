// @flow

import moment from "moment";

// CRUD
async function readAllSemesters(mongo: $FlowTODO) {
    return await mongo.db.collection('semesters').find().toArray();
}

async function readCurrentSemester(mongo: $FlowTODO) {
    const now = moment().format('YYYY-MM-DD');
    return await mongo.db
        .collection('semesters')
        .findOne({
            'courseDates.instruction.start': {$lte: now},
            'courseDates.instruction.end': {$gte: now}
        });
}

// API
const semestersPlugin = {
    name: 'semesters',
    version: '1.0.0',
    register: function (server: any, options: any) {
        server.route([
            {
                method: 'GET',
                path: '/api/semesters',
                handler: async function(request, h) {
                    return await readAllSemesters(request.mongo);
                }
            },
            {
                method: 'GET',
                path: '/api/semesters/current',
                handler: async function (request, h) {
                    return await readCurrentSemester(request.mongo);
                }
            }
        ]);
    }
};

export default semestersPlugin;
