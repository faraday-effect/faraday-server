// @flow

import type {MarkdownSource} from "../lib/markdown";
import {renderMarkdown} from "../lib/markdown";

export type NoteType = {
    type: "note",
    content: MarkdownSource
};

export default function renderNote(note: NoteType) {
    const mdContent = renderMarkdown(note.content);
    return {
        ...note,
        content: `<div="note">${mdContent}</div>`
    };
}
