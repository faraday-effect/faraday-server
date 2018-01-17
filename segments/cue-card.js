// @flow

import type {MarkdownSource} from "../lib/markdown";
import {renderMarkdown} from "../lib/markdown";

export type CueCardType = {
    type: "cue-card",
    title: string,
    content: MarkdownSource
};

export default function renderCueCard(cueCard: CueCardType) {
    return {
        ...cueCard,
        content: renderMarkdown(cueCard.content)
    };
}
