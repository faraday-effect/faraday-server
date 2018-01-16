// @flow

const hljs = require('highlight.js');

const md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
            } catch (_) {}
        }
        return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    }
});

export type MarkdownSource = Array<string>;

export function renderMarkdown(content: MarkdownSource) {
    return md.render(content.join("\n"));
}
