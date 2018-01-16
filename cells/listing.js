// @flow

import renderCode from '../segments/code';
import type { CodeType } from '../segments/code';

import renderCueCard from '../segments/cue-card';
import type { CueCardType } from "../segments/cue-card";

import renderNote from '../segments/note';
import type { NoteType } from "../segments/note";

type SegmentType = CodeType | CueCardType | NoteType;

export type ListingType = {
    uid: string,
    segments: Array<SegmentType>
};

function renderSegment(segment: SegmentType) {
    switch (segment.type) {
        case 'code':
            return renderCode(segment);
        case 'cue-card':
            return renderCueCard(segment);
        case 'note':
            return renderNote(segment);
        default:
            throw new Error(`Invalid segment type: ${segment.type}`);
    }
}

export function renderListing(listing: ListingType) {
    return {
        uid: listing.uid,
        segments: listing.segments.map(segment => renderSegment(segment))
    }
}

export async function fetchListing(mongo: $FlowTODO, uid: string) {
    const query = { _id: new mongo.ObjectID(uid)};
    return await mongo.db.collection('listings').findOne(query);
}
