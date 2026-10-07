const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../src/static/js/speed-test.js'), 'utf8');

async function test(download, expectedTier, latency = 60, jitter = 0, quality = /moderate \(60.0 ms\); jitter is low \(0.0 ms\)/) {
    const elements = {};
    const handlers = {};
    const timers = new Map();
    let mode = 'success';
    let time = 0;
    let calls = 0;
    let latencySamples = 0;
    const document = { getElementById(id) {
        elements[id] ||= { textContent: '', value: 0, hidden: true,
            addEventListener(event, handler) { handlers[id] = handler; } };
        return elements[id];
    } };
    vm.runInNewContext(source, {
        document, window: { addEventListener() {} }, AbortController, DOMException,
        Uint8Array, crypto: require('node:crypto').webcrypto, Date, Math, TypeError,
        performance: { now: () => time },
        setTimeout(fn, delay) { timers.set(delay, fn); return delay; },
        clearTimeout(id) { timers.delete(id); },
        async fetch(url, options) {
            calls++;
            assert.equal(elements['speed-summary'].hidden, true, 'hide summary during test');
            assert.equal(elements['speed-tier'].textContent, '', 'clear previous conclusion');
            const params = new URL(url).searchParams;
            const upload = options.method === 'POST';
            if (upload) assert.equal(params.has('bytes'), false, 'do not override upload byte count');
            if (mode === 'cancel') handlers['speed-stop']();
            if (mode === 'timeout') timers.get(15000)();
            if (options.signal.aborted) throw new DOMException('Aborted', 'AbortError');
            if (mode === 'offline') throw new TypeError('Failed to fetch');
            const bytes = upload ? options.body.byteLength : Number(params.get('bytes'));
            time += bytes ? bytes * 8 / ((upload ? 20 : download) * 1000)
                : latency + ((latencySamples++ % 6) - 3) * jitter;
            return {
                ok: mode !== 'http', status: 503,
                headers: { get: () => String(mode === 'upload-incomplete' ? 0 : bytes) },
                arrayBuffer: async () => ({ byteLength: mode === 'incomplete' ? 1 : upload ? 0 : bytes })
            };
        }
    });
    assert.equal(calls, 0, 'no requests before start');
    await handlers['speed-start']();
    assert.match(elements['speed-status'].textContent, /Test complete/);
    assert.equal(elements['speed-summary'].hidden, false);
    assert.match(elements['speed-tier'].textContent, expectedTier);
    assert.match(elements['speed-throughput'].textContent, /20.00 Mbps up/);
    assert.ok(elements['speed-throughput'].textContent.includes(`${(download / 8).toFixed(2)} MB/s download`));
    assert.match(elements['speed-quality'].textContent, quality);
    for (const failure of ['cancel', 'offline', 'http', 'incomplete', 'upload-incomplete', 'timeout']) {
        mode = failure;
        await handlers['speed-start']();
        assert.match(elements['speed-status'].textContent, /Test (failed|stopped)/);
        assert.equal(elements['speed-summary'].hidden, true);
        assert.equal(elements['speed-start'].disabled, false);
        assert.equal(elements['speed-stop'].disabled, true);
        assert.equal(timers.size, 0);
    }
    mode = 'success';
    await handlers['speed-start']();
    assert.equal(elements['speed-summary'].hidden, false, 'retry restores conclusion');
    console.log(`PASS ${download} Mbps: tier, units, quality, failure cleanup, retry`);
}

(async () => {
    for (const [speed, tier] of [
        [0.1, /below the 50/], [39.99, /below the 50/], [40, /approximately 50 Mbps/],
        [79.99, /approximately 50 Mbps/], [80, /approximately 100 Mbps/],
        [159.99, /approximately 100 Mbps/], [160, /approximately 200 Mbps/],
        [239.99, /approximately 200 Mbps/], [240, /approximately 300 Mbps/],
        [399.99, /approximately 300 Mbps/], [400, /approximately 500 Mbps/],
        [799.99, /approximately 500 Mbps/], [800, /approximately 1 Gbps/],
        [1599.99, /approximately 1 Gbps/], [1600, /2 Gbps or higher/], [5000, /2 Gbps or higher/]
    ]) await test(speed, tier);
    await test(100, /approximately 100 Mbps/, 49, 9, /latency is low .*jitter is low/);
    await test(100, /approximately 100 Mbps/, 50, 10, /latency is moderate .*jitter is moderate/);
    await test(100, /approximately 100 Mbps/, 99, 29, /latency is moderate .*jitter is moderate/);
    await test(100, /approximately 100 Mbps/, 100, 30, /latency is high .*jitter is high/);
})().catch(error => { console.error(error); process.exitCode = 1; });
