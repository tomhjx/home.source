const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const AdsTxt = require('../src/static/js/ads-txt.js');
const elements = new Map();
const handlers = new Map();
function node() {
    return { value: '', textContent: '', hidden: true, children: [],
        replaceChildren() { this.children = []; },
        appendChild(child) { this.children.push(child); } };
}
function element(id) {
    if (!elements.has(id)) {
        const item = node();
        item.addEventListener = (event, handler) => handlers.set(`${id}:${event}`, handler);
        elements.set(id, item);
    }
    return elements.get(id);
}
let response;
let fetchCount = 0;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/static/js/ads-txt-checker.js'), 'utf8'), {
    AdsTxt, AbortController, TextDecoder, TypeError, setTimeout, clearTimeout,
    document: { getElementById: element, createElement: node },
    fetch: async () => { fetchCount++; if (response instanceof Error) throw response; return response; }
});
const content = 'example.com, id, DIRECT';
async function fetchFile(body, headers = { 'Content-Type': 'text/plain' }, status = 200) {
    element('ads-domain').value = 'example.com';
    response = new Response(body, { headers, status });
    await handlers.get('ads-fetch-form:submit')({ preventDefault() {} });
}
(async () => {
    assert.equal(fetchCount, 0);
    element('ads-text').value = content;
    handlers.get('ads-check:click')();
    assert.match(element('ads-summary').textContent, /No syntax issues/);
    assert.equal(element('ads-results').hidden, false);
    handlers.get('ads-text:input')();
    assert.equal(element('ads-results').hidden, true);
    await fetchFile(content);
    assert.equal(element('ads-text').value, content);
    assert.equal(element('ads-results').hidden, false);
    assert.equal(element('ads-open').href, 'https://example.com/ads.txt');
    await fetchFile('<html>oops</html>', { 'Content-Type': 'text/html' });
    assert.match(element('ads-status').textContent, /text\/plain/);
    assert.equal(element('ads-results').hidden, true);
    await fetchFile('not found', {}, 404);
    assert.match(element('ads-status').textContent, /HTTP 404/);
    response = new TypeError('Failed to fetch');
    await handlers.get('ads-fetch-form:submit')({ preventDefault() {} });
    assert.match(element('ads-status').textContent, /CORS/);
    assert.equal(element('ads-fetch').disabled, false);
    await fetchFile('a'.repeat(AdsTxt.maxBytes + 1));
    assert.match(element('ads-status').textContent, /1 MiB/);
    element('ads-file').files = [{ size: content.length, text: async () => content }];
    await handlers.get('ads-file:change')();
    assert.equal(element('ads-results').hidden, false);
    assert.match(element('ads-status').textContent, /No content was uploaded/);
    let finish;
    element('ads-file').files = [{ size: 1, text: () => new Promise(resolve => { finish = resolve; }) }];
    const pending = handlers.get('ads-file:change')();
    handlers.get('ads-clear:click')();
    finish(content);
    await pending;
    assert.equal(element('ads-text').value, '');
    assert.equal(element('ads-results').hidden, true);
    element('ads-text').value = 'CUSTOM=<img src=x onerror=alert(1)>';
    handlers.get('ads-check:click')();
    assert.ok(element('ads-findings').children.length > 0);
    assert.ok(element('ads-findings').children.every(row => row.children.every(cell => !('innerHTML' in cell))));
    console.log('PASS UI: local check, stale results, fetch, MIME, HTTP errors, CORS, size limit, local file, stale read, safe text rendering');
})().catch(error => { console.error(error); process.exitCode = 1; });
