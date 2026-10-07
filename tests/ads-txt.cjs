const assert = require('node:assert/strict');
const { check, fileURL, maxBytes } = require('../src/static/js/ads-txt.js');
let tested = 0;
function scenario(name, run) { run(); tested++; console.log(`PASS ${name}`); }
const errors = text => check(text).findings.filter(item => item.level === 'Error');

scenario('IAB seller examples and optional certification', () => {
    const result = check('greenadexchange.com, XF7342, DIRECT, 5jyxf8k54\nredssp.com, 57013, RESELLER');
    assert.equal(result.findings.length, 0);
    assert.equal(result.direct, 1); assert.equal(result.reseller, 1);
});
scenario('BOM, comments, whitespace, all line endings, case insensitive relationship', () => {
    const result = check('\uFEFF# comment\rEXAMPLE.com, A, direct # inline\r\nexample.com, B, reseller\n');
    assert.equal(result.findings.length, 0); assert.equal(result.direct, 1); assert.equal(result.reseller, 1);
});
scenario('account IDs retain case and escaped whitespace', () => {
    assert.equal(check('example.com, A, DIRECT\nexample.com, a, DIRECT\nexample.com, a%20b, DIRECT').findings.length, 0);
});
scenario('invalid field counts, domains, accounts, relationships, certification', () => {
    for (const line of ['example.com,id', 'example.com,id,DIRECT,cert,extra', 'https://example.com,id,DIRECT', '127.0.0.1,id,DIRECT', '-bad.com,id,DIRECT', 'example.com,,DIRECT', 'example.com,a b,DIRECT', 'example.com,id,OTHER', 'example.com,id,DIRECT,a b', '<html>Not found</html>']) assert.ok(errors(line).length, line);
});
scenario('duplicate and conflicting seller declarations', () => {
    const result = check('EXAMPLE.com,id,DIRECT\nexample.com,id,direct\nexample.com,id,RESELLER');
    assert.ok(result.findings.some(item => item.line === 2 && /Duplicate/.test(item.message)));
    assert.ok(result.findings.some(item => item.line === 3 && /both/.test(item.message)));
});
scenario('standard placeholder is not counted as seller', () => {
    const result = check('placeholder.example.com, placeholder, DIRECT, placeholder');
    assert.equal(result.placeholders, 1); assert.equal(result.direct, 0); assert.equal(result.findings.length, 0);
    assert.ok(check('placeholder.example.com, placeholder, DIRECT, placeholder\nexample.com,id,DIRECT').findings.some(item => /alongside/.test(item.message)));
});
scenario('empty and comments-only input do not silently pass', () => {
    for (const text of ['', '# comment']) assert.ok(check(text).findings.some(item => /No valid seller/.test(item.message)));
});
scenario('ads.txt 1.1 variables and arbitrary CONTACT values', () => {
    const result = check('example.com,id,DIRECT\nCONTACT=Ad Ops https://example.com/?a=b\nOWNERDOMAIN=example.com\nMANAGERDOMAIN=manager.com, US\nMANAGERDOMAIN=global.com\nSUBDOMAIN=sub.example.com\nINVENTORYPARTNERDOMAIN=partner.com');
    assert.equal(result.declarations, 6); assert.equal(result.findings.length, 0);
});
scenario('bad and repeated declarations', () => {
    assert.ok(errors('OWNERDOMAIN=https://example.com').length);
    assert.ok(errors('CONTACT=').length);
    assert.ok(errors('MANAGERDOMAIN=example.com, USA').length);
    assert.ok(check('OWNERDOMAIN=one.com\nOWNERDOMAIN=two.com').findings.some(item => /first declaration/.test(item.message)));
    assert.ok(check('MANAGERDOMAIN=one.com, US\nMANAGERDOMAIN=two.com, us').findings.some(item => /Multiple managers/.test(item.message)));
});
scenario('unknown variables and extensions yield warnings', () => {
    assert.equal(errors('CUSTOM=value\nexample.com,id,DIRECT; extra=value').length, 0);
    assert.ok(check('example.com,id,DIRECT; extra=value').findings.some(item => /Extension/.test(item.message)));
});
scenario('UTF-8 byte limit', () => {
    assert.match(check('x'.repeat(maxBytes + 1)).findings[0].message, /1 MiB/);
    assert.match(check('中'.repeat(maxBytes / 2)).findings[0].message, /1 MiB/);
});
scenario('domain URL normalization preserves exact host', () => {
    assert.equal(fileURL('Example.com'), 'https://example.com/ads.txt');
    assert.equal(fileURL('https://sub.example.com/ads.txt'), 'https://sub.example.com/ads.txt');
});
scenario('invalid and unsafe URLs rejected', () => {
    for (const input of ['', 'http://example.com', 'https://user:pass@example.com', 'https://example.com:8080', 'https://example.com/blog', 'example.com?x=y', 'example.com#x', 'localhost', '127.0.0.1', 'javascript:alert(1)']) assert.throws(() => fileURL(input), undefined, input);
});
console.log(`${tested} scenarios passed`);
