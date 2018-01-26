// @flow

import renderCode from '../segments/code';
import type { CodeType } from '../segments/code';

import renderCueCard from '../segments/cue-card';
import type { CueCardType } from "../segments/cue-card";

import renderNote from '../segments/note';
import type { NoteType } from "../segments/note";

import {coerceUid} from '../lib/mongoHelpers';

type SegmentType = CodeType | CueCardType | NoteType;

export type ListingType = {
    _id: string,
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
        ...listing,
        segments: listing.segments.map(segment => renderSegment(segment))
    }
}

export async function fetchListing(mongo: $FlowTODO, uid: string) {
    const query = { _id: coerceUid(mongo, uid)};
    const listing = await mongo.db.collection('listings').findOne(query);
    return listing;
}
