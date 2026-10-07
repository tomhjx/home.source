const assert = require('node:assert/strict');
const { check, fileURL, maxBytes } = require('../src/static/js/sellers-json.js');
const AdsTxt = require('../src/static/js/ads-txt.js');
const seller = { seller_id: '001', seller_type: 'PUBLISHER', name: 'Publisher', domain: 'publisher.com' };
const json = (sellers = [seller], extra = {}) => JSON.stringify({ version: '1.0', sellers, ...extra });
const errors = result => result.findings.filter(item => item.level === 'Error');
let count = 0;
function test(name, run) { run(); count++; console.log(`PASS ${name}`); }

test('valid seller, optional fields, identifiers', () => {
    const result = check(json([{ ...seller, comment: 'Inventory', ext: {}, is_passthrough: 0 }], { identifiers: [{ name: 'TAG-ID', value: 'abc' }], contact_email: 'ops@example.com', ext: {} }));
    assert.equal(result.findings.length, 0); assert.equal(result.total, 1);
});
test('malformed JSON, null, arrays, wrong version, missing sellers', () => {
    for (const input of ['', '{', 'null', '[]', '{}', '{"version":1,"sellers":[]}', '{"version":"1.0","sellers":{}}']) assert.ok(errors(check(input)).length, input);
});
test('empty list is warning and BOM is accepted', () => {
    assert.equal(errors(check(json([]))).length, 0);
    assert.ok(check(json([])).findings.some(item => item.level === 'Warning'));
    assert.equal(check(`\uFEFF${json()}`).findings.length, 0);
});
test('confidential seller may omit name/domain', () => {
    const result = check(json([{ seller_id: 'hidden', seller_type: 'intermediary', is_confidential: 1 }]));
    assert.equal(result.findings.length, 0); assert.equal(result.confidential, 1);
});
test('missing non-confidential domain is conditional warning', () => {
    const result = check(json([{ seller_id: 'id', seller_type: 'BOTH', name: 'No web presence' }]));
    assert.equal(errors(result).length, 0);
    assert.ok(result.findings.some(item => /web presence/.test(item.message)));
});
test('seller schema failures', () => {
    for (const invalid of [null, [], { ...seller, seller_id: 1 }, { ...seller, seller_id: '' }, { ...seller, seller_type: 'DIRECT' }, { ...seller, name: '' }, { ...seller, is_confidential: true }, { ...seller, is_passthrough: '1' }, { ...seller, domain: 'https://publisher.com' }, { ...seller, ext: [] }, { ...seller, comment: 1 }]) assert.ok(errors(check(json([invalid]))).length);
});
test('optional parent field types', () => {
    for (const extra of [{ contact_email: 1 }, { contact_address: [] }, { ext: null }, { identifiers: {} }, { identifiers: [{ name: 'TAG-ID', value: 5 }] }]) assert.ok(errors(check(json([seller], extra))).length);
});
test('duplicate seller ID blocks comparison, case-distinct IDs allowed', () => {
    const result = check(json([seller, seller]), 'exchange.com,001,DIRECT', 'exchange.com');
    assert.ok(errors(result).some(item => /Duplicate/.test(item.message)));
    assert.equal(result.compared, 0);
    assert.equal(errors(check(json([{ ...seller, seller_id: 'ID' }, { ...seller, seller_id: 'id' }]))).length, 0);
});
test('joint matching is domain scoped and case sensitive for IDs', () => {
    const result = check(json(), 'EXCHANGE.com,001,direct\nother.com,missing,DIRECT\nexchange.com,1,DIRECT', 'exchange.com');
    assert.equal(result.compared, 2); assert.equal(result.matched, 1); assert.equal(result.excluded, 1);
    assert.equal(errors(result).length, 1);
    assert.match(errors(result)[0].message, /Account 1 is absent/);
    assert.equal(check(json([{ ...seller, seller_id: 'ID' }]), 'exchange.com,id,DIRECT', 'exchange.com').matched, 0);
});
test('DIRECT/RESELLER type warnings and BOTH', () => {
    for (const [relationship, type] of [['DIRECT', 'INTERMEDIARY'], ['RESELLER', 'PUBLISHER']]) {
        const result = check(json([{ ...seller, seller_type: type }]), `exchange.com,001,${relationship}`, 'exchange.com');
        assert.equal(errors(result).length, 0); assert.ok(result.findings.some(item => /may conflict/.test(item.message)));
    }
    for (const relationship of ['DIRECT', 'RESELLER']) assert.ok(!check(json([{ ...seller, seller_type: 'both' }]), `exchange.com,001,${relationship}`, 'exchange.com').findings.some(item => /may conflict/.test(item.message)));
});
test('OWNERDOMAIN comparison only for DIRECT', () => {
    const direct = check(json(), 'OWNERDOMAIN=other.com\nexchange.com,001,DIRECT', 'exchange.com');
    assert.ok(direct.findings.some(item => /differs from OWNERDOMAIN/.test(item.message)));
    const reseller = check(json([{ ...seller, seller_type: 'INTERMEDIARY' }]), 'OWNERDOMAIN=other.com\nexchange.com,001,RESELLER', 'exchange.com');
    assert.ok(!reseller.findings.some(item => /OWNERDOMAIN/.test(item.message)));
});
test('confidential matching is present but identity unverified', () => {
    const result = check(json([{ seller_id: '001', seller_type: 'BOTH', is_confidential: 1 }]), 'exchange.com,001,DIRECT', 'exchange.com');
    assert.equal(result.matched, 1); assert.equal(errors(result).length, 0);
    assert.ok(result.findings.some(item => /incomplete/.test(item.message)));
});
test('bad ads input blocks joint matching, empty/unrelated input warns', () => {
    assert.equal(check(json(), 'exchange.com,001,INVALID', 'exchange.com').compared, 0);
    for (const input of ['', 'other.com,001,DIRECT', 'placeholder.example.com,placeholder,DIRECT,placeholder']) {
        const result = check(json(), input, 'exchange.com');
        assert.equal(result.compared, 0); assert.ok(result.findings.some(item => /No account matches/.test(item.message)));
    }
});
test('ads parser exposes records without placeholders and first owner', () => {
    const parsed = AdsTxt.check('OWNERDOMAIN=FIRST.com\nOWNERDOMAIN=second.com\nexchange.com,001,DIRECT\nplaceholder.example.com,placeholder,DIRECT,placeholder');
    assert.equal(parsed.ownerDomain, 'first.com'); assert.equal(parsed.sellerRecords.length, 1);
    assert.equal(parsed.sellerRecords[0].line, 3);
});
test('size limits and system URL validation', () => {
    assert.ok(errors(check(' '.repeat(maxBytes + 1))).length);
    assert.equal(fileURL('EXCHANGE.com'), 'https://exchange.com/sellers.json');
    assert.equal(fileURL('https://exchange.com/sellers.json'), 'https://exchange.com/sellers.json');
    for (const input of ['', 'http://exchange.com', 'https://u:p@exchange.com', 'exchange.com/ads.txt', '127.0.0.1', 'exchange.com?x=y']) assert.throws(() => fileURL(input));
    assert.ok(errors(check(json(), 'exchange.com,001,DIRECT', '')).length);
});
console.log(`${count} scenarios passed`);
