(() => {
    'use strict';
    if (!document.getElementById('sellers-checker')) return;
    const element = name => document.getElementById(`sellers-${name}`);
    const status = element('status');
    let revision = 0;
    let controller;
    function reset() {
        revision++;
        if (controller) controller.abort();
        controller = null;
        element('fetch').disabled = false;
        element('results').hidden = true;
    }
    function render(joint) {
        reset();
        const result = SellersJson.check(element('text').value, joint ? element('ads').value : null, element('domain').value);
        const errors = result.findings.filter(item => item.level === 'Error').length;
        const warnings = result.findings.filter(item => item.level === 'Warning').length;
        element('summary').textContent = `${errors} error(s), ${warnings} warning(s). ${joint ? 'Joint declaration check' : 'sellers.json check'} completed; review findings below.`;
        element('counts').textContent = `${result.total} sellers; ${result.confidential} confidential. ${joint ? `${result.matched} account ID matches out of ${result.compared} selected ads.txt records; ${result.excluded} records for other systems not checked.` : 'ads.txt was not compared.'}`;
        const body = element('findings');
        body.replaceChildren();
        for (const finding of result.findings.slice(0, 500)) {
            const row = document.createElement('tr');
            for (const value of [finding.location, finding.level, finding.message]) {
                const cell = document.createElement('td'); cell.textContent = value; row.appendChild(cell);
            }
            body.appendChild(row);
        }
        element('results').hidden = false;
        status.textContent = 'Checked locally. Results describe supplied declarations, not verified seller authorization.';
    }
    element('check').addEventListener('click', () => render(false));
    element('joint').addEventListener('click', () => render(true));
    for (const name of ['text', 'ads', 'domain']) element(name).addEventListener('input', () => {
        reset(); if (name === 'domain') element('open').hidden = true;
        status.textContent = 'Input changed. Run the check again to update results.';
    });
    element('clear').addEventListener('click', () => {
        reset();
        for (const name of ['text', 'ads', 'domain', 'file', 'ads-file']) element(name).value = '';
        element('open').hidden = true; status.textContent = 'Cleared. Paste or load your files.';
    });
    for (const [name, target, limit] of [['file', 'text', SellersJson.maxBytes], ['ads-file', 'ads', AdsTxt.maxBytes]]) {
        element(name).addEventListener('change', async () => {
            reset(); const current = revision; const file = element(name).files[0];
            if (!file) return;
            try {
                if (file.size > limit) throw new Error(`File exceeds the ${limit / 1024 / 1024} MiB limit.`);
                const text = await file.text();
                if (current !== revision) return;
                element(target).value = text; status.textContent = 'File loaded locally. Choose a check to view results.';
            } catch (error) { if (current === revision) status.textContent = error.message; }
        });
    }
    element('fetch').addEventListener('click', async () => {
        reset(); element('open').hidden = true;
        const current = revision;
        let timer;
        let timedOut = false;
        try {
            const url = SellersJson.fileURL(element('domain').value);
            element('open').href = url; element('open').hidden = false;
            controller = new AbortController(); const request = controller;
            timer = setTimeout(() => { timedOut = true; request.abort(); }, 20000);
            element('fetch').disabled = true; status.textContent = `Fetching ${url}…`;
            const response = await fetch(url, { signal: request.signal, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer' });
            if (!response.ok) throw new Error(`HTTP ${response.status}. Open the file or load a local copy.`);
            if (response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') throw new Error('Expected Content-Type: application/json. Response was not loaded.');
            const reader = response.body.getReader(); const decoder = new TextDecoder('utf-8', { fatal: true });
            let bytes = 0; let text = '';
            while (true) {
                const chunk = await reader.read(); if (chunk.done) break;
                bytes += chunk.value.byteLength;
                if (bytes > SellersJson.maxBytes) throw new Error('Response exceeds the 20 MiB limit.');
                text += decoder.decode(chunk.value, { stream: true });
            }
            text += decoder.decode(); if (current !== revision) return;
            element('text').value = text;
            status.textContent = `Loaded ${response.url}. Choose a check to view results.${response.redirected ? ' Redirect followed; redirect-chain compliance was not verified.' : ''}`;
        } catch (error) {
            if (current !== revision) return;
            status.textContent = timedOut ? 'Request timed out after 20 seconds. Open or load the file locally.' : error instanceof TypeError ? 'Unable to read the file: network, CORS, browser blocking, or invalid UTF-8. Open the file and paste its contents. This does not prove it is missing.' : error.message;
        } finally {
            clearTimeout(timer);
            if (current === revision) { if (controller) controller.abort(); controller = null; element('fetch').disabled = false; }
        }
    });
})();
