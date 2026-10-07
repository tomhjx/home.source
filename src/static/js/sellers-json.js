'use strict';

const SellersJson = (() => {
    const ads = typeof module !== 'undefined' ? require('./ads-txt.js') : AdsTxt;
    const maxBytes = 20 * 1024 * 1024;
    const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    const string = value => typeof value === 'string' && value.trim().length > 0;

    function fileURL(input) {
        const url = new URL(input.includes('://') ? input.trim() : `https://${input.trim()}`);
        if (url.protocol !== 'https:' || url.username || url.password || url.port || !ads.isDomain(url.hostname)
            || !['/', '/sellers.json'].includes(url.pathname) || url.search || url.hash) {
            throw new Error('Enter an advertising system domain or HTTPS /sellers.json URL without credentials, ports, queries, or fragments.');
        }
        url.pathname = '/sellers.json';
        return url.href;
    }

    function check(text, adsText = null, system = '') {
        const findings = [];
        const byID = new Map();
        let total = 0;
        let confidential = 0;
        let compared = 0;
        let matched = 0;
        let excluded = 0;
        const add = (location, level, message) => findings.push({ location, level, message });
        const result = () => ({ findings, total, confidential, compared, matched, excluded });
        let data;
        if (new TextEncoder().encode(text).length > maxBytes) {
            add('File', 'Error', 'sellers.json exceeds the 20 MiB limit.'); return result();
        }
        try { data = JSON.parse(text.replace(/^\uFEFF/, '')); }
        catch { add('File', 'Error', 'Invalid JSON. Check quotes, commas, brackets, and trailing content.'); return result(); }
        if (!object(data)) { add('File', 'Error', 'The root must be a JSON object.'); return result(); }
        if (data.version !== '1.0') add('version', 'Error', 'version must be the string "1.0".');
        for (const name of ['contact_email', 'contact_address']) {
            if (name in data && typeof data[name] !== 'string') add(name, 'Error', `${name} must be a string.`);
        }
        if ('ext' in data && !object(data.ext)) add('ext', 'Error', 'ext must be an object.');
        if ('identifiers' in data) {
            if (!Array.isArray(data.identifiers)) add('identifiers', 'Error', 'identifiers must be an array.');
            else data.identifiers.forEach((id, index) => {
                if (!object(id) || !string(id.name) || !string(id.value)) add(`identifiers[${index}]`, 'Error', 'Identifier requires non-empty name and value strings.');
            });
        }
        if (!Array.isArray(data.sellers)) { add('sellers', 'Error', 'sellers must be an array.'); return result(); }
        total = data.sellers.length;
        if (!total) add('sellers', 'Warning', 'No sellers are listed.');
        data.sellers.forEach((seller, index) => {
            const location = `sellers[${index}]`;
            if (!object(seller)) { add(location, 'Error', 'Seller must be an object.'); return; }
            if (!string(seller.seller_id)) add(`${location}.seller_id`, 'Error', 'seller_id must be a non-empty string; numeric IDs must be quoted.');
            else if (byID.has(seller.seller_id)) add(`${location}.seller_id`, 'Error', `Duplicate seller_id ${seller.seller_id}; the mapping is ambiguous.`);
            else byID.set(seller.seller_id, seller);
            if (typeof seller.seller_type !== 'string' || !['PUBLISHER', 'INTERMEDIARY', 'BOTH'].includes(seller.seller_type.toUpperCase())) add(`${location}.seller_type`, 'Error', 'seller_type must be PUBLISHER, INTERMEDIARY, or BOTH (case-insensitive).');
            for (const flag of ['is_confidential', 'is_passthrough']) {
                if (flag in seller && seller[flag] !== 0 && seller[flag] !== 1) add(`${location}.${flag}`, 'Error', `${flag} must be the integer 0 or 1.`);
            }
            if (seller.is_confidential === 1) confidential++;
            if (seller.is_confidential !== 1 && !string(seller.name)) add(`${location}.name`, 'Error', 'A non-confidential seller must have a non-empty name.');
            else if ('name' in seller && !string(seller.name)) add(`${location}.name`, 'Error', 'name must be a non-empty string when supplied.');
            if ('domain' in seller) {
                if (typeof seller.domain !== 'string' || !ads.isDomain(seller.domain)) add(`${location}.domain`, 'Error', 'domain must be a DNS domain, not a URL, IP address, or path.');
            } else if (seller.is_confidential !== 1) add(`${location}.domain`, 'Warning', 'Domain omitted. This is allowed only if the seller has no web presence; confirm manually.');
            if ('comment' in seller && typeof seller.comment !== 'string') add(`${location}.comment`, 'Error', 'comment must be a string.');
            if ('ext' in seller && !object(seller.ext)) add(`${location}.ext`, 'Error', 'ext must be an object.');
        });
        if (adsText === null) return result();
        if (findings.some(item => item.level === 'Error')) {
            add('Joint check', 'Warning', 'Comparison skipped. Resolve sellers.json errors first.'); return result();
        }
        let domain;
        try { domain = new URL(fileURL(system)).hostname; }
        catch (error) { add('Joint check', 'Error', error.message); return result(); }
        const parsed = ads.check(adsText);
        for (const item of parsed.findings) add(`ads.txt line ${item.line || '(file)'}`, item.level, item.message);
        if (parsed.findings.some(item => item.level === 'Error')) {
            add('Joint check', 'Warning', 'Comparison skipped. Resolve ads.txt errors first.'); return result();
        }
        const records = parsed.sellerRecords.filter(record => record.domain === domain);
        compared = records.length;
        excluded = parsed.sellerRecords.length - compared;
        if (!compared) add('Joint check', 'Warning', `No seller records target ${domain}. No account matches were checked.`);
        if (excluded) add('Joint check', 'Info', `${excluded} record(s) for other advertising systems were not checked.`);
        for (const record of records) {
            const location = `ads.txt line ${record.line}`;
            const seller = byID.get(record.account);
            if (!seller) { add(location, 'Error', `Account ${record.account} is absent from the supplied sellers.json for ${domain}.`); continue; }
            matched++;
            add(location, 'Info', `Account ${record.account} found: ${seller.seller_type.toUpperCase()}${seller.is_confidential === 1 ? ' (confidential identity)' : ''}.`);
            const type = seller.seller_type.toUpperCase();
            if ((record.relationship === 'DIRECT' && type === 'INTERMEDIARY') || (record.relationship === 'RESELLER' && type === 'PUBLISHER')) {
                add(location, 'Warning', `${record.relationship} and seller_type ${type} may conflict. Review the account-control and payment relationship; this is not proof of unauthorized selling.`);
            }
            if (record.relationship === 'DIRECT' && parsed.ownerDomain && seller.domain && seller.domain.toLowerCase() !== parsed.ownerDomain) {
                add(location, 'Warning', `Seller domain ${seller.domain} differs from OWNERDOMAIN ${parsed.ownerDomain}; verify the owning business.`);
            }
            if (seller.is_confidential === 1 || !seller.domain) add(location, 'Warning', 'Identity/domain comparison is incomplete because the seller is confidential or has no published domain.');
        }
        return result();
    }
    return { check, fileURL, maxBytes };
})();

if (typeof module !== 'undefined') module.exports = SellersJson;
