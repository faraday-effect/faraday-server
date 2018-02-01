// @flow

/**
 * In places (particularly in seed data), it's awkward to formulate a Mongo OID.
 * Instead we use a human-readable string. This function tests whether a `uid`
 * looks like a Mongo OID string and if so, converts it into a real one for use
 * in a query. Otherwise, it returns it unchanged
 * @param mongo - MongoDB instance
 * @param uid - UID of concern
 * @returns {*} - Appropriate key
 */
export function coerceUid(mongo: $FlowTODO, uid: string): string {
    return mongo.ObjectID.isValid(uid) ? new mongo.ObjectID(uid) : uid;
}
