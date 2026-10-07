const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const AdsTxt = require('../src/static/js/ads-txt.js');
const SellersJson = require('../src/static/js/sellers-json.js');
const elements = new Map();
const handlers = new Map();
const timers = new Map();
function node() {
    return { value: '', textContent: '', hidden: true, children: [],
        replaceChildren() { this.children = []; }, appendChild(child) { this.children.push(child); } };
}
function element(id) {
    if (!elements.has(id)) {
        const item = node(); item.addEventListener = (event, handler) => handlers.set(`${id}:${event}`, handler);
        elements.set(id, item);
    }
    return elements.get(id);
}
let response;
let requests = 0;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/static/js/sellers-json-checker.js'), 'utf8'), {
    AdsTxt, SellersJson, AbortController, TextDecoder, TypeError,
    setTimeout(fn, delay) { timers.set(delay, fn); return delay; }, clearTimeout(id) { timers.delete(id); },
    document: { getElementById: element, createElement: node },
    fetch: async (url, options) => {
        requests++; assert.equal(options.credentials, 'omit');
        if (response === 'timeout') { timers.get(20000)(); throw new TypeError('Aborted'); }
        if (response instanceof Error) throw response;
        return response;
    }
});
const content = JSON.stringify({ version: '1.0', sellers: [{ seller_id: '001', seller_type: 'PUBLISHER', name: 'Publisher', domain: 'publisher.com' }] });
const event = (name, type = 'click') => handlers.get(`sellers-${name}:${type}`)();
(async () => {
    assert.equal(requests, 0);
    element('sellers-text').value = content; event('check');
    assert.match(element('sellers-counts').textContent, /ads.txt was not compared/);
    element('sellers-domain').value = 'exchange.com';
    element('sellers-ads').value = 'exchange.com,001,DIRECT'; event('joint');
    assert.match(element('sellers-counts').textContent, /1 account ID matches out of 1/);
    assert.equal(element('sellers-results').hidden, false);
    event('ads', 'input'); assert.equal(element('sellers-results').hidden, true);
    element('sellers-ads').value = 'exchange.com,missing,DIRECT'; event('joint');
    assert.match(element('sellers-summary').textContent, /1 error/);
    response = new Response(content, { headers: { 'Content-Type': 'application/json' } });
    await event('fetch'); assert.equal(element('sellers-text').value, content);
    assert.match(element('sellers-status').textContent, /Choose a check/);
    assert.equal(element('sellers-results').hidden, true);
    assert.equal(element('sellers-open').href, 'https://exchange.com/sellers.json');
    for (const [reply, message] of [
        [new Response('no', { status: 404 }), /HTTP 404/],
        [new Response('<html>'), /application\/json/],
        [new TypeError('Failed to fetch'), /CORS/], ['timeout', /20 seconds/]
    ]) {
        response = reply; await event('fetch'); assert.match(element('sellers-status').textContent, message);
        assert.equal(element('sellers-fetch').disabled, false); assert.equal(timers.size, 0);
    }
    element('sellers-file').files = [{ size: content.length, text: async () => content }];
    await event('file', 'change'); assert.equal(element('sellers-text').value, content);
    element('sellers-ads-file').files = [{ size: 1, text: async () => 'exchange.com,001,DIRECT' }];
    await event('ads-file', 'change'); event('joint');
    assert.match(element('sellers-counts').textContent, /1 account ID matches/);
    let finish;
    element('sellers-file').files = [{ size: 1, text: () => new Promise(resolve => { finish = resolve; }) }];
    const pending = event('file', 'change'); event('clear'); finish(content); await pending;
    assert.equal(element('sellers-text').value, ''); assert.equal(element('sellers-results').hidden, true);
    element('sellers-file').files = [{ size: SellersJson.maxBytes + 1 }];
    await event('file', 'change'); assert.match(element('sellers-status').textContent, /20 MiB/);
    console.log('PASS sellers UI: standalone/joint checks, stale results, fetch, HTTP/MIME/CORS/timeout, local files, stale reads, size limit');
})().catch(error => { console.error(error); process.exitCode = 1; });
