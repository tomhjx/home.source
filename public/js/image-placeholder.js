(function () {
    'use strict';

    const form = document.getElementById('placeholder-form');
    const widthInput = document.getElementById('wInput');
    const heightInput = document.getElementById('hInput');
    const textInput = document.getElementById('textInput');
    const backgroundInput = document.getElementById('bgColorInput');
    const textColorInput = document.getElementById('txtColorInput');
    const sizePreset = document.getElementById('sizePreset');
    const backgroundStyle = document.getElementById('backgroundStyle');
    const accentColorInput = document.getElementById('accentColorInput');
    const fontSizeInput = document.getElementById('fontSizeInput');
    const hideTextInput = document.getElementById('hideTextInput');
    const canvas = document.getElementById('preview');
    const download = document.getElementById('download');
    const downloadFormat = document.getElementById('downloadFormat');
    const formats = new Map([
        ['png', { label: 'PNG', mimeType: 'image/png' }],
        ['jpg', { label: 'JPG', mimeType: 'image/jpeg' }],
        ['webp', { label: 'WebP', mimeType: 'image/webp' }],
        ['avif', { label: 'AVIF', mimeType: 'image/avif' }]
    ]);
    const status = document.getElementById('placeholder-status');
    const context = canvas.getContext('2d');
    let timer;
    let exporting = false;

    function drawBackground(width, height) {
        const style = backgroundStyle.value;
        context.fillStyle = backgroundInput.value;
        if (style === 'gradient') {
            const gradient = context.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, backgroundInput.value);
            gradient.addColorStop(1, accentColorInput.value);
            context.fillStyle = gradient;
        }
        context.fillRect(0, 0, width, height);
        context.fillStyle = accentColorInput.value;
        const tile = Math.max(8, Math.round(Math.min(width, height) / 10));
        if (style === 'checkerboard') {
            for (let y = 0; y < height; y += tile) {
                for (let x = (y / tile % 2) * tile; x < width; x += tile * 2) {
                    context.fillRect(x, y, tile, tile);
                }
            }
        } else if (style === 'grid') {
            const thickness = Math.max(1, Math.round(tile / 20));
            for (let x = 0; x < width; x += tile) context.fillRect(x, 0, thickness, height);
            for (let y = 0; y < height; y += tile) context.fillRect(0, y, width, thickness);
        } else if (style === 'stripes') {
            context.beginPath();
            for (let x = -height; x < width; x += tile * 2) {
                context.moveTo(x, 0);
                context.lineTo(x + tile, 0);
                context.lineTo(x + tile + height, height);
                context.lineTo(x + height, height);
                context.closePath();
            }
            context.fill();
        }
    }

    function drawText(width, height, text, requestedSize) {
        const lines = text.split('\n');
        let fontSize = Math.min(requestedSize, height * 0.8 / (lines.length * 1.2));
        context.font = `bold ${fontSize}px Arial`;
        const textWidth = lines.reduce((maximum, line) => Math.max(maximum, context.measureText(line).width), 0);
        if (textWidth > width * 0.9) fontSize *= width * 0.9 / textWidth;
        context.font = `bold ${fontSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = textColorInput.value;
        const lineHeight = fontSize * 1.2;
        lines.forEach((line, index) => {
            context.fillText(line, width / 2, height / 2 + (index - (lines.length - 1) / 2) * lineHeight);
        });
    }

    function render() {
        clearTimeout(timer);
        download.disabled = true;
        const width = Number(widthInput.value);
        const height = Number(heightInput.value);
        accentColorInput.disabled = backgroundStyle.value === 'solid';
        fontSizeInput.disabled = hideTextInput.checked;
        textInput.disabled = hideTextInput.checked;
        const requestedSize = Number(fontSizeInput.value);
        if (![width, height].every(value => Number.isInteger(value) && value >= 1 && value <= 4096)) {
            status.textContent = 'Enter whole-number dimensions between 1 and 4096 px. Preview shows the last valid image.';
            return false;
        }
        if (!hideTextInput.checked && (!Number.isInteger(requestedSize) || requestedSize < 1 || requestedSize > 512)) {
            status.textContent = 'Enter a whole-number font size between 1 and 512 px.';
            return false;
        }
        if (!context) {
            status.textContent = 'Your browser does not support Canvas.';
            return false;
        }

        try {
            canvas.width = width;
            canvas.height = height;
            drawBackground(width, height);

            const text = hideTextInput.checked ? '' : textInput.value || `${width}x${height}`;
            if (!hideTextInput.checked) drawText(width, height, text, requestedSize);
            canvas.setAttribute('aria-label', `${width} by ${height} pixel placeholder: ${text}`);
            canvas.hidden = false;
            status.textContent = `${width} × ${height} px`;
            download.disabled = exporting;
            return true;
        } catch (error) {
            canvas.hidden = true;
            status.textContent = 'Could not generate this image. Try smaller dimensions.';
            return false;
        }
    }

    sizePreset.addEventListener('change', function () {
        if (!sizePreset.value) return;
        [widthInput.value, heightInput.value] = sizePreset.value.split('x');
        render();
    });
    form.addEventListener('input', function (event) {
        if (event.target === widthInput || event.target === heightInput) sizePreset.value = '';
        download.disabled = true;
        clearTimeout(timer);
        timer = setTimeout(render, 150);
    });
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        render();
    });
    downloadFormat.addEventListener('change', function () {
        const format = formats.get(downloadFormat.value) || formats.get('png');
        download.textContent = `Download ${format.label}`;
    });
    download.addEventListener('click', function () {
        if (exporting || !render()) return;
        const format = formats.has(downloadFormat.value) ? downloadFormat.value : 'png';
        const { mimeType, label } = formats.get(format);
        const filename = `placeholder-${canvas.width}x${canvas.height}.${format}`;
        exporting = true;
        download.disabled = true;

        function finish(error) {
            exporting = false;
            render();
            if (error) status.textContent = 'Could not export this image. Try again or use smaller dimensions.';
        }

        try {
            canvas.toBlob(function (blob) {
                if (!blob) {
                    finish(true);
                    return;
                }
                if (blob.type !== mimeType) {
                    finish(false);
                    status.textContent = `${label} export is not supported by your browser. Choose PNG or JPG.`;
                    return;
                }
                let url;
                try {
                    url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    document.body.appendChild(link);
                    try {
                        link.click();
                    } finally {
                        link.remove();
                    }
                    finish(false);
                } catch (error) {
                    finish(true);
                } finally {
                    if (url) setTimeout(() => URL.revokeObjectURL(url), 1000);
                }
            }, mimeType, 0.92);
        } catch (error) {
            finish(true);
        }
    });

    render();
}());
