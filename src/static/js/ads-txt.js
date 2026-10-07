'use strict';

const AdsTxt = (() => {
    const maxBytes = 1024 * 1024;
    function isDomain(value) {
        return value.length <= 253 && value.includes('.') && !/^\d+(\.\d+){3}$/.test(value)
            && value.split('.').every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label));
    }

    function fileURL(input) {
        const url = new URL(input.includes('://') ? input.trim() : `https://${input.trim()}`);
        if (url.protocol !== 'https:' || url.username || url.password || url.port || !isDomain(url.hostname)
            || !['/', '/ads.txt'].includes(url.pathname) || url.search || url.hash) {
            throw new Error('Enter a domain or an HTTPS /ads.txt URL without credentials, ports, queries, or fragments.');
        }
        url.pathname = '/ads.txt';
        return url.href;
    }

    function check(text) {
        const findings = [];
        const sellerRecords = [];
        let ownerDomain = null;
        const records = new Set();
        const accounts = new Map();
        const managers = new Set();
        let direct = 0;
        let reseller = 0;
        let declarations = 0;
        let placeholders = 0;
        let owners = 0;
        const add = (line, level, message) => findings.push({ line, level, message });
        if (new TextEncoder().encode(text).length > maxBytes) {
            add(0, 'Error', 'Content exceeds the 1 MiB limit.');
            return { findings, direct, reseller, declarations, placeholders, sellerRecords, ownerDomain };
        }
        text.replace(/^\uFEFF/, '').split(/\r\n|\r|\n/).forEach((raw, index) => {
            const line = index + 1;
            const content = raw.split('#')[0].trim();
            if (!content) return;
            const variable = content.match(/^([^\s,=]+)\s*=(.*)$/);
            if (variable) {
                const name = variable[1].toUpperCase();
                const value = variable[2].trim();
                declarations++;
                if (name === 'OWNERDOMAIN' && ownerDomain === null) ownerDomain = value.toLowerCase();
                if (!value) { add(line, 'Error', `${name} has an empty value.`); return; }
                if (['OWNERDOMAIN', 'SUBDOMAIN', 'INVENTORYPARTNERDOMAIN'].includes(name) && !isDomain(value)) {
                    add(line, 'Error', `${name} must contain a domain, not a URL or path.`);
                }
                if (name === 'OWNERDOMAIN' && ++owners > 1) add(line, 'Warning', 'Repeated OWNERDOMAIN; consumers use the first declaration.');
                if (name === 'MANAGERDOMAIN') {
                    const parts = value.split(',').map(part => part.trim());
                    if (parts.length > 2 || !isDomain(parts[0]) || (parts.length === 2 && !/^[a-z]{2}$/i.test(parts[1]))) {
                        add(line, 'Error', 'MANAGERDOMAIN requires a domain and an optional two-letter country code.');
                    } else {
                        const country = (parts[1] || 'GLOBAL').toUpperCase();
                        if (managers.has(country)) add(line, 'Warning', `Multiple managers declared for ${country}; only one is allowed per scope.`);
                        managers.add(country);
                    }
                }
                if (!['CONTACT', 'OWNERDOMAIN', 'MANAGERDOMAIN', 'SUBDOMAIN', 'INVENTORYPARTNERDOMAIN'].includes(name)) {
                    add(line, 'Warning', `Unknown variable ${name}; value not validated.`);
                }
                return;
            }
            const fields = content.split(';')[0].split(',').map(field => field.trim());
            if (fields.length < 3 || fields.length > 4) {
                add(line, 'Error', 'Expected three required fields and an optional fourth certification ID.');
                return;
            }
            const [domain, account, rawRelationship, certification = ''] = fields;
            const relationship = rawRelationship.toUpperCase();
            let valid = true;
            const invalid = message => { valid = false; add(line, 'Error', message); };
            if (!isDomain(domain)) invalid('Advertising system must be a DNS domain, not a URL, IP address, or path.');
            if (!account || /\s/.test(account)) invalid('Account ID is required and must not contain unescaped whitespace.');
            if (!['DIRECT', 'RESELLER'].includes(relationship)) invalid('Relationship must be DIRECT or RESELLER (case-insensitive).');
            if (/\s/.test(certification)) invalid('Certification ID must not contain unescaped whitespace.');
            if (!valid) return;
            if (content.includes(';')) add(line, 'Warning', 'Extension data after the semicolon was not validated.');
            const key = JSON.stringify([domain.toLowerCase(), account, relationship, certification]);
            if (records.has(key)) add(line, 'Warning', 'Duplicate seller record.');
            records.add(key);
            const accountKey = JSON.stringify([domain.toLowerCase(), account]);
            if (accounts.has(accountKey) && accounts.get(accountKey) !== relationship) add(line, 'Warning', 'Same account declared as both DIRECT and RESELLER; review the relationship.');
            accounts.set(accountKey, relationship);
            if (domain.toLowerCase() === 'placeholder.example.com' && account === 'placeholder' && relationship === 'DIRECT' && certification === 'placeholder') {
                placeholders++;
            } else {
                sellerRecords.push({ line, domain: domain.toLowerCase(), account, relationship });
                if (relationship === 'DIRECT') direct++;
                else reseller++;
            }
        });
        if (!direct && !reseller && !placeholders) add(0, 'Warning', 'No valid seller records found. An empty or comments-only file does not explicitly declare no authorized sellers; use the standard placeholder if that is your intent. Referrals are not followed.');
        if (placeholders && (direct || reseller)) add(0, 'Warning', 'Placeholder appears alongside seller records; review whether you intend to authorize sellers.');
        return { findings, direct, reseller, declarations, placeholders, sellerRecords, ownerDomain };
    }
    return { check, fileURL, maxBytes, isDomain };
})();

if (typeof module !== 'undefined') module.exports = AdsTxt;
