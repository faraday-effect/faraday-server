// @flow

import type {MarkdownSource} from "../lib/markdown";
import {renderMarkdown} from "../lib/markdown";

export type CueCardType = {
    type: "cue-card",
    title: string,
    content: MarkdownSource
};

export default function renderCueCard(cueCard: CueCardType) {
    const mdContent = renderMarkdown(cueCard.content);
    return {
        ...cueCard,
        content: `<div="cue-card title">${cueCard.title}</div>${mdContent}`
    };
}
