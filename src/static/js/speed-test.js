(() => {
    'use strict';

    const root = document.getElementById('speed-test');
    if (!root) return;
    const element = name => document.getElementById(`speed-${name}`);
    const start = element('start');
    const stop = element('stop');
    const status = element('status');
    const progress = element('progress');
    const endpoint = 'https://speed.cloudflare.com';
    let activeRun = null;

    async function transfer(run, bytes, upload = false) {
        const controller = new AbortController();
        const cancel = () => controller.abort();
        run.signal.addEventListener('abort', cancel, { once: true });
        if (run.signal.aborted) controller.abort();
        let timedOut = false;
        const timer = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, 15000);
        try {
            let body;
            if (upload) {
                body = new Uint8Array(bytes);
                // Random data avoids compression inflating the measured upload rate.
                for (let offset = 0; offset < bytes; offset += 65536) {
                    crypto.getRandomValues(body.subarray(offset, Math.min(offset + 65536, bytes)));
                }
            }
            const began = performance.now();
            const response = await fetch(`${endpoint}/${upload ? '__up' : '__down'}?bytes=${upload ? 0 : bytes}&nonce=${Date.now()}-${Math.random()}`, {
                method: upload ? 'POST' : 'GET',
                body,
                signal: controller.signal,
                cache: 'no-store',
                credentials: 'omit',
                ...(upload ? { headers: { 'Content-Type': 'text/plain;charset=UTF-8' } } : {})
            });
            if (!response.ok) throw new Error(`The test service returned HTTP ${response.status}`);
            const data = await response.arrayBuffer();
            if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
            if (!upload && data.byteLength !== bytes) throw new Error('Incomplete test data received. Please try again');
            if (upload && Number(response.headers.get('cf-meta-upload-bytes')) !== bytes) {
                throw new Error('The test service did not confirm the complete upload. Please try again');
            }
            return { bytes: upload ? bytes : data.byteLength, duration: Math.max(performance.now() - began, 0.01) };
        } catch (error) {
            if (timedOut && !run.signal.aborted) throw new Error('A request timed out after 15 seconds. Check your connection and try again');
            throw error;
        } finally {
            clearTimeout(timer);
            run.signal.removeEventListener('abort', cancel);
        }
    }

    async function measureSpeed(run, upload) {
        let bytes = 0;
        let duration = 0;
        for (const size of (upload ? [1000000, 4000000] : [4000000, 16000000])) {
            const sample = await transfer(run, size, upload);
            bytes += sample.bytes;
            duration += sample.duration;
            progress.value += 1;
        }
        return (bytes * 8 / duration / 1000).toFixed(2);
    }

    start.addEventListener('click', async () => {
        if (activeRun) return;
        const run = new AbortController();
        activeRun = run;
        let deadlineReached = false;
        const deadline = setTimeout(() => {
            deadlineReached = true;
            run.abort();
        }, 90000);
        start.disabled = true;
        stop.disabled = false;
        progress.value = 0;
        for (const name of ['download', 'upload', 'latency', 'jitter']) element(name).textContent = '—';
        try {
            status.textContent = 'Connecting to Cloudflare and warming up…';
            await transfer(run, 0);
            progress.value = 1;
            status.textContent = 'Measuring HTTP latency and jitter…';
            const samples = [];
            for (let index = 0; index < 5; index++) {
                samples.push((await transfer(run, 0)).duration);
                progress.value += 1;
            }
            element('latency').textContent = (samples.reduce((sum, value) => sum + value, 0) / samples.length).toFixed(1);
            const differences = samples.slice(1).map((value, index) => Math.abs(value - samples[index]));
            element('jitter').textContent = (differences.reduce((sum, value) => sum + value, 0) / differences.length).toFixed(1);
            status.textContent = 'Testing download speed (about 20 MB)…';
            element('download').textContent = await measureSpeed(run, false);
            status.textContent = 'Testing upload speed (about 5 MB)…';
            element('upload').textContent = await measureSpeed(run, true);
            status.textContent = 'Test complete. Results reflect this connection to Cloudflare.';
        } catch (error) {
            if (run.signal.aborted) {
                status.textContent = deadlineReached ? 'Test stopped after 90 seconds. Check your connection and try again.' : 'Test stopped. Results from completed stages have been kept.';
            } else {
                status.textContent = `Test failed: ${error instanceof TypeError ? 'Unable to connect to the test service. Check your network or browser blocking settings and try again' : error.message}.`;
            }
        } finally {
            clearTimeout(deadline);
            activeRun = null;
            start.disabled = false;
            start.textContent = 'Test again';
            stop.disabled = true;
        }
    });

    stop.addEventListener('click', () => {
        if (activeRun) activeRun.abort();
    });
    window.addEventListener('pagehide', () => {
        if (activeRun) activeRun.abort();
    });
})();
