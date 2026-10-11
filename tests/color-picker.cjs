const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function node() {
    return {
        value: '', style: {}, dataset: {}, children: [], handlers: {}, attributes: {},
        addEventListener(event, handler) { this.handlers[event] = handler; },
        setAttribute(name, value) { this.attributes[name] = value; },
        replaceChildren() { this.children = []; },
        appendChild(child) { this.children.push(child); },
        focus() {}, select() { this.selected = true; }
    };
}
const elements = {};
const get = id => elements[id] ||= node();
get('color-input').value = '#30638e';
get('color-harmony').value = 'shades';
let copied;
let pickError;
const navigator = { clipboard: { async writeText(value) { copied = value; } } };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/static/js/color-picker.js'), 'utf8'), {
    document: { getElementById: get, createElement: node, createTextNode: value => ({ textContent: value }) },
    navigator,
    window: { isSecureContext: true, EyeDropper: class {
        async open() { if (pickError) throw pickError; return { sRGBHex: '#123456' }; }
    } }
});
function hex(value) {
    get('color-hex').value = value;
    get('color-hex').handlers.input();
}
async function click(dataset) {
    await get('color-picker').handlers.click({ target: { closest: () => ({ dataset }) } });
}
(async () => {
    assert.equal(get('color-palette').children.length, 18);
    for (const [value, rgb, hsl] of [
        ['#f00', 'rgb(255, 0, 0)', 'hsl(0, 100%, 50%)'],
        ['00ff00', 'rgb(0, 255, 0)', 'hsl(120, 100%, 50%)'],
        ['#0000ff', 'rgb(0, 0, 255)', 'hsl(240, 100%, 50%)'],
        ['#fff', 'rgb(255, 255, 255)', 'hsl(0, 0%, 100%)'],
        ['000', 'rgb(0, 0, 0)', 'hsl(0, 0%, 0%)']
    ]) {
        hex(value);
        assert.equal(get('color-rgb-output').value, rgb);
        assert.equal(get('color-hsl-output').value, hsl);
        assert.equal(get('color-hex').value, value, 'typing must not rewrite partial input');
    }
    for (const value of ['', '#12', '#abcd', 'gggggg', '<script>']) {
        hex(value);
        assert.equal(get('color-hex').attributes['aria-invalid'], 'true');
        assert.equal(get('color-hex-output').value, '#000000');
    }
    hex('ff0000');
    for (const [mode, expected] of [
        ['complementary', ['#FF0000', '#00FFFF']],
        ['triadic', ['#FF0000', '#00FF00', '#0000FF']],
        ['analogous', ['#FF0080', '#FF0000', '#FF8000']],
        ['shades', ['#330000', '#990000', '#FF0000', '#FF9999', '#FFCCCC']]
    ]) {
        get('color-harmony').value = mode;
        get('color-harmony').handlers.change();
        const colors = get('color-matches').children.map(child => child.dataset.color);
        if (mode === 'shades') {
            assert.equal(colors.length, 5);
            assert.equal(colors[0], '#330000');
            assert.equal(colors[4], '#FFCCCC');
        } else assert.deepEqual(colors, expected);
    }
    await click({ color: '#3B82F6' });
    assert.equal(get('color-hex-output').value, '#3B82F6');
    await click({ copy: 'color-hex-output' });
    assert.equal(copied, '#3B82F6');
    navigator.clipboard = undefined;
    await click({ copy: 'color-rgb-output' });
    assert.equal(get('color-rgb-output').selected, true);
    await get('color-eyedropper').handlers.click();
    assert.equal(get('color-hex-output').value, '#123456');
    pickError = { name: 'AbortError' };
    await get('color-eyedropper').handlers.click();
    assert.match(get('color-status').textContent, /canceled/);
    assert.equal(get('color-eyedropper').disabled, false);
    console.log('PASS color picker: conversions, validation, palettes, clipboard fallback, screen picking');
})().catch(error => { console.error(error); process.exitCode = 1; });
