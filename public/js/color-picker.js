(function () {
    'use strict';

    const root = document.getElementById('color-picker');
    const input = document.getElementById('color-input');
    const hexInput = document.getElementById('color-hex');
    const preview = document.getElementById('color-preview');
    const status = document.getElementById('color-status');
    const harmony = document.getElementById('color-harmony');
    const matches = document.getElementById('color-matches');
    const eyedropper = document.getElementById('color-eyedropper');

    function toHsl(red, green, blue) {
        const r = red / 255, g = green / 255, b = blue / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const delta = max - min;
        const lightness = (max + min) / 2;
        let hue = 0;
        if (delta) {
            if (max === r) hue = ((g - b) / delta + 6) % 6;
            else if (max === g) hue = (b - r) / delta + 2;
            else hue = (r - g) / delta + 4;
        }
        return [hue * 60, delta ? delta / (1 - Math.abs(2 * lightness - 1)) * 100 : 0, lightness * 100];
    }

    function toHex(hue, saturation, lightness) {
        const s = saturation / 100, l = lightness / 100;
        const a = s * Math.min(l, 1 - l);
        const channel = n => {
            const k = (n + hue / 30) % 12;
            return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))))
                .toString(16).padStart(2, '0');
        };
        return `#${channel(0)}${channel(8)}${channel(4)}`.toUpperCase();
    }

    function swatches(container, colors) {
        container.replaceChildren();
        colors.forEach(color => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'color-swatch';
            button.dataset.color = color;
            button.setAttribute('aria-label', `Select ${color}`);
            const sample = document.createElement('span');
            sample.style.backgroundColor = color;
            button.appendChild(sample);
            button.appendChild(document.createTextNode(color));
            container.appendChild(button);
        });
    }

    function update(value, normalizeInput = true) {
        let hex = value.trim().replace(/^#/, '');
        if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
            hexInput.setAttribute('aria-invalid', 'true');
            status.textContent = 'Enter a valid 3- or 6-digit HEX color. The last valid color is still shown.';
            return;
        }
        if (hex.length === 3) hex = hex.split('').map(char => char + char).join('');
        hex = `#${hex.toUpperCase()}`;
        hexInput.setAttribute('aria-invalid', 'false');
        if (normalizeInput) hexInput.value = hex;
        input.value = hex.toLowerCase();
        preview.style.backgroundColor = hex;
        preview.setAttribute('aria-label', `Selected color ${hex}`);
        const rgb = [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));
        const [h, s, l] = toHsl(...rgb);
        document.getElementById('color-hex-output').value = hex;
        document.getElementById('color-rgb-output').value = `rgb(${rgb.join(', ')})`;
        document.getElementById('color-hsl-output').value = `hsl(${Math.round(h) % 360}, ${Math.round(s)}%, ${Math.round(l)}%)`;
        const offsets = { analogous: [330, 0, 30], complementary: [0, 180], triadic: [0, 120, 240] };
        const colors = harmony.value === 'shades'
            ? [10, 30, 50, 70, 90].map(lightness => toHex(h, s, lightness))
            : offsets[harmony.value].map(offset => offset === 0 ? hex : toHex((h + offset) % 360, s, l));
        swatches(matches, colors);
        status.textContent = `Selected ${hex}`;
    }

    input.addEventListener('input', () => update(input.value));
    hexInput.addEventListener('input', () => update(hexInput.value, false));
    harmony.addEventListener('change', () => update(input.value));
    root.addEventListener('click', async function (event) {
        const button = event.target.closest('button');
        if (!button) return;
        if (button.dataset.color) update(button.dataset.color);
        if (button.dataset.copy) {
            const output = document.getElementById(button.dataset.copy);
            const value = output.value;
            try {
                await navigator.clipboard.writeText(value);
                status.textContent = `Copied ${value}`;
            } catch (error) {
                output.focus();
                output.select();
                status.textContent = 'Clipboard unavailable. Copy the selected value manually.';
            }
        }
    });
    if (window.EyeDropper && window.isSecureContext) {
        eyedropper.hidden = false;
        eyedropper.addEventListener('click', async function () {
            eyedropper.disabled = true;
            try {
                const result = await new window.EyeDropper().open();
                update(result.sRGBHex);
            } catch (error) {
                status.textContent = error.name === 'AbortError' ? 'Screen picking canceled.' : 'Could not pick a screen color. Try the color control instead.';
            } finally {
                eyedropper.disabled = false;
            }
        });
    }

    swatches(document.getElementById('color-palette'), [
        '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
        '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
        '#FFFFFF', '#CBD5E1', '#64748B', '#334155', '#0F172A', '#000000'
    ]);
    update(input.value);
}());
