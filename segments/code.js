// @flow

import invariant from "invariant";

const hljs = require('highlight.js');

type CodeSource = Array<string>;

export type CodeType = {
    type: "code",
    meta: {
        language: string,
        fileName?: string
    },
    content: CodeSource
};

export default function renderCode(code: CodeType) {
    const hlCode = hljs.highlight(code.meta.language, code.content.join("\n"));
    return {
        ...code,
        content: `<pre><code class="${code.meta.language} hljs">${hlCode.value}</code></pre>`
    };
}
