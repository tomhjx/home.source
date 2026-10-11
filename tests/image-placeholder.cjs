const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const elements = {};
const timers = new Map();
const downloads = [];
const revoked = [];
let nextTimer = 0;
let exportCallback;
let exportType;
let drawnText;
let draws = 0;
let textCalls = [];
let gradientStops = [];
let paths = 0;
const context = {
    fillRect() { draws++; },
    measureText(text) { return { width: text.length * parseFloat(this.font.slice(5)) }; },
    fillText(text, x, y) { drawnText = text; textCalls.push({ text, x, y }); },
    createLinearGradient() { return { addColorStop(offset, color) { gradientStops.push([offset, color]); } }; },
    beginPath() { paths++; }, moveTo() {}, lineTo() {}, closePath() {}, fill() {}
};
for (const id of ['placeholder-form', 'wInput', 'hInput', 'textInput', 'bgColorInput',
    'txtColorInput', 'preview', 'download', 'placeholder-status', 'sizePreset',
    'backgroundStyle', 'accentColorInput', 'fontSizeInput', 'hideTextInput', 'downloadFormat']) {
    elements[id] = {
        value: '', handlers: {},
        addEventListener(event, handler) { this.handlers[event] = handler; },
        setAttribute() {}
    };
}
elements.wInput.value = '300';
elements.hInput.value = '200';
elements.bgColorInput.value = '#cccccc';
elements.txtColorInput.value = '#000000';
elements.backgroundStyle.value = 'solid';
elements.accentColorInput.value = '#999999';
elements.fontSizeInput.value = '24';
elements.preview.getContext = () => context;
const toBlob = (callback, type) => {
    exportType = type;
    exportCallback = callback;
};
elements.preview.toBlob = toBlob;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/static/js/image-placeholder.js'), 'utf8'), {
    document: {
        getElementById: id => elements[id],
        body: { appendChild() {} },
        createElement: () => ({ click() { downloads.push(this.download); }, remove() {} })
    },
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL: url => revoked.push(url) },
    setTimeout(fn, delay) { timers.set(++nextTimer, { fn, delay }); return nextTimer; },
    clearTimeout(id) { timers.delete(id); }
});
function flush(delay) {
    for (const [id, timer] of timers) {
        if (timer.delay === delay) { timers.delete(id); timer.fn(); }
    }
}
function submit() { elements['placeholder-form'].handlers.submit({ preventDefault() {} }); }

assert.equal(drawnText, '300x200');
assert.equal(elements.download.disabled, false);
for (const value of ['', '0', '-1', '1.5', '4097', 'Infinity', 'abc']) {
    elements.wInput.value = value;
    const before = draws;
    submit();
    assert.equal(draws, before, 'invalid dimensions must not resize or redraw canvas');
    assert.equal(elements.download.disabled, true);
}
for (const value of ['1', '4096']) {
    elements.wInput.value = value;
    submit();
    assert.equal(elements.preview.width, Number(value));
    assert.equal(elements.download.disabled, false);
}
elements.wInput.value = '100';
elements.textInput.value = 'Long placeholder text';
const before = draws;
for (let i = 0; i < 5; i++) elements['placeholder-form'].handlers.input({ target: elements.textInput });
assert.equal(draws, before);
assert.equal(timers.size, 1, 'rapid input should produce one render');
flush(150);
assert.equal(draws, before + 1);
assert.ok(context.measureText(drawnText).width <= 90.00001, 'long text fits image');

elements.download.handlers.click();
assert.equal(exportType, 'image/png');
assert.equal(elements.download.disabled, true);
elements.wInput.value = '250';
submit();
assert.equal(elements.download.disabled, true, 'prevent concurrent exports');
exportCallback({ type: 'image/png' });
assert.deepEqual(downloads, ['placeholder-100x200.png'], 'filename matches exported snapshot');
assert.equal(elements.download.disabled, false);
flush(1000);
assert.deepEqual(revoked, ['blob:test']);
elements.download.handlers.click();
exportCallback(null);
assert.match(elements['placeholder-status'].textContent, /Could not export/);
assert.equal(elements.download.disabled, false, 'export failure allows retry');
elements.preview.toBlob = () => { throw new Error('Encoding failed'); };
elements.download.handlers.click();
assert.match(elements['placeholder-status'].textContent, /Could not export/);
assert.equal(elements.download.disabled, false);
elements.preview.toBlob = toBlob;
elements.downloadFormat.value = 'jpg';
elements.downloadFormat.handlers.change();
assert.equal(elements.download.textContent, 'Download JPG');
elements.download.handlers.click();
assert.equal(exportType, 'image/jpeg');
elements.downloadFormat.value = 'png';
elements.downloadFormat.handlers.change();
exportCallback({ type: 'image/jpeg' });
assert.equal(downloads.at(-1), 'placeholder-250x200.jpg', 'format stays tied to export snapshot');
assert.equal(elements.download.textContent, 'Download PNG');
for (const [format, label] of [['webp', 'WebP'], ['avif', 'AVIF']]) {
    elements.downloadFormat.value = format;
    elements.downloadFormat.handlers.change();
    assert.equal(elements.download.textContent, `Download ${label}`);
    elements.download.handlers.click();
    assert.equal(exportType, `image/${format}`);
    exportCallback({ type: exportType });
    assert.equal(downloads.at(-1), `placeholder-250x200.${format}`);
    const count = downloads.length;
    elements.download.handlers.click();
    exportCallback({ type: 'image/png' });
    assert.equal(downloads.length, count, 'unsupported format must not download mislabeled PNG');
    assert.match(elements['placeholder-status'].textContent, /not supported by your browser/);
    assert.equal(elements.download.disabled, false, 'unsupported format allows retry');
}

elements.sizePreset.value = '1280x720';
elements.sizePreset.handlers.change();
assert.equal(elements.preview.width, 1280);
assert.equal(elements.preview.height, 720);
elements['placeholder-form'].handlers.input({ target: elements.wInput });
assert.equal(elements.sizePreset.value, '', 'manual dimensions clear preset');
flush(150);
for (const style of ['gradient', 'stripes', 'grid', 'checkerboard']) {
    elements.backgroundStyle.value = style;
    const before = draws;
    submit();
    assert.equal(elements.download.disabled, false);
    assert.equal(elements.accentColorInput.disabled, false);
    if (style === 'grid' || style === 'checkerboard') assert.ok(draws > before + 1);
}
assert.deepEqual(gradientStops, [[0, '#cccccc'], [1, '#999999']]);
assert.equal(paths, 1);
elements.backgroundStyle.value = 'solid';
elements.textInput.value = 'First line\nSecond line\n第三行';
elements.fontSizeInput.value = '100';
textCalls = [];
submit();
assert.equal(elements.accentColorInput.disabled, true);
assert.deepEqual(textCalls.map(call => call.text), ['First line', 'Second line', '第三行']);
assert.equal(textCalls[1].y, 360, 'multiline block stays centered');
assert.ok(textCalls[0].y < textCalls[1].y && textCalls[1].y < textCalls[2].y);
for (const value of ['', '0', '1.5', '513']) {
    elements.fontSizeInput.value = value;
    submit();
    assert.equal(elements.download.disabled, true);
    assert.match(elements['placeholder-status'].textContent, /font size/);
}
elements.hideTextInput.checked = true;
textCalls = [];
submit();
assert.equal(textCalls.length, 0);
assert.equal(elements.download.disabled, false, 'hidden text ignores invalid font size');
assert.equal(elements.fontSizeInput.disabled, true);
elements.hideTextInput.checked = false;
elements.fontSizeInput.value = '24';
submit();
assert.equal(elements.fontSizeInput.disabled, false);
assert.equal(elements.textInput.disabled, false);
assert.equal(elements.download.disabled, false);
console.log('PASS image placeholder: validation, debounce, text fitting, export recovery, presets, backgrounds, multiline and hidden text');
