(() => {
    'use strict';
    if (!document.getElementById('ads-checker')) return;
    const element = name => document.getElementById(`ads-${name}`);
    const text = element('text');
    const status = element('status');
    let controller;
    let revision = 0;

    function reset() {
        revision++;
        if (controller) controller.abort();
        controller = null;
        element('fetch').disabled = false;
        element('results').hidden = true;
    }

    function render(extra = []) {
        const result = AdsTxt.check(text.value);
        const findings = [...extra, ...result.findings];
        const errors = findings.filter(item => item.level === 'Error').length;
        const warnings = findings.filter(item => item.level === 'Warning').length;
        element('summary').textContent = errors ? `${errors} error(s) found.` : warnings ? `No syntax errors; ${warnings} warning(s) to review.` : 'No syntax issues found in the checked content.';
        element('counts').textContent = `${result.direct} DIRECT records · ${result.reseller} RESELLER records · ${result.declarations} declarations · ${result.placeholders} placeholders. Counts include duplicates; placeholders are not sellers.`;
        const body = element('findings');
        body.replaceChildren();
        for (const finding of findings.slice(0, 500)) {
            const row = document.createElement('tr');
            for (const value of [finding.line || 'File', finding.level, finding.message]) {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            }
            body.appendChild(row);
        }
        element('results').hidden = false;
    }

    element('check').addEventListener('click', () => {
        reset();
        render();
        status.textContent = 'Content checked locally. Hosting and seller authorization were not verified.';
    });
    text.addEventListener('input', () => { reset(); status.textContent = 'Content changed. Click Check content to update results.'; });
    element('domain').addEventListener('input', () => { reset(); element('open').hidden = true; status.textContent = 'Domain changed. Fetch again to check this host.'; });
    element('clear').addEventListener('click', () => {
        reset(); text.value = ''; element('file').value = ''; element('domain').value = '';
        element('open').hidden = true;
        status.textContent = 'Cleared. Paste content, select a file, or fetch a domain.';
    });
    element('file').addEventListener('change', async () => {
        reset();
        const current = revision;
        const file = element('file').files[0];
        if (!file) return;
        try {
            if (file.size > AdsTxt.maxBytes) throw new Error('File exceeds the 1 MiB limit.');
            const content = await file.text();
            if (current !== revision) return;
            text.value = content; render(); status.textContent = 'Local file checked. No content was uploaded.';
        } catch (error) { if (current === revision) status.textContent = error.message; }
    });
    element('fetch-form').addEventListener('submit', async event => {
        event.preventDefault();
        reset();
        element('open').hidden = true;
        const current = revision;
        let timer;
        let timedOut = false;
        try {
            const url = AdsTxt.fileURL(element('domain').value);
            element('open').href = url; element('open').hidden = false;
            controller = new AbortController();
            const request = controller;
            timer = setTimeout(() => { timedOut = true; request.abort(); }, 15000);
            element('fetch').disabled = true;
            status.textContent = `Fetching ${url}…`;
            const response = await fetch(url, { signal: request.signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' });
            if (!response.ok) throw new Error(`HTTP ${response.status}. Open the file to inspect the server response, or paste content to check locally.`);
            if (response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'text/plain') throw new Error('Server must return Content-Type: text/plain. Response was not checked.');
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8', { fatal: true });
            let content = '';
            let bytes = 0;
            while (true) {
                const chunk = await reader.read();
                if (chunk.done) break;
                bytes += chunk.value.byteLength;
                if (bytes > AdsTxt.maxBytes) { request.abort(); throw new Error('Response exceeds the 1 MiB limit.'); }
                content += decoder.decode(chunk.value, { stream: true });
            }
            content += decoder.decode();
            if (current !== revision) return;
            text.value = content;
            render(response.redirected ? [{ line: 0, level: 'Warning', message: 'Redirect followed by the browser. ads.txt redirect-chain rules were not verified.' }] : []);
            status.textContent = `Fetched and checked ${response.url}. HTTP ${response.status}; text/plain. Seller authorization was not verified.`;
        } catch (error) {
            if (current !== revision) return;
            status.textContent = timedOut ? 'Request timed out after 15 seconds. Open the file or paste its content to check locally.'
                : error instanceof TypeError ? 'Could not read this file. Network, CORS, browser blocking, or invalid UTF-8 may be responsible. Open the file and paste its contents; this does not prove it is missing.' : error.message;
        } finally {
            clearTimeout(timer);
            if (current === revision) { if (controller) controller.abort(); controller = null; element('fetch').disabled = false; }
        }
    });
})();
