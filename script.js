const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

function handleDragOver(e) {
    console.log('Drag over event triggered');
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    console.log('Drop event triggered');
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    console.log('Dropped files:', files);
    if (files.length) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    console.log('File select event triggered');
    const files = e.target.files;
    if (files.length) {
        processFile(files[0]);
    }
}

function processFile(file) {
    console.log('Processing file:', file);
    if (file && file.type === 'image/png') {
        const reader = new FileReader();
        reader.onload = function(e) {
            const arrayBuffer = e.target.result;
            const uint8Array = new Uint8Array(arrayBuffer);
            const metadata = extractPngMetadata(uint8Array);
            displayMetadata(metadata);

            // Display the selected image
            const imgElement = document.getElementById('selectedImage');
            imgElement.src = URL.createObjectURL(file);
            imgElement.style.display = 'block';
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Please select a PNG file.');
    }
}

// ... rest of the code remains the same

function extractPngMetadata(uint8Array) {
    const textDecoder = new TextDecoder('utf-8');
    const metadata = {};
    let i = 8; // Skip the PNG signature

    while (i < uint8Array.length) {
        const length = (uint8Array[i] << 24) | (uint8Array[i + 1] << 16) | (uint8Array[i + 2] << 8) | uint8Array[i + 3];
        const type = textDecoder.decode(uint8Array.slice(i + 4, i + 8));
        const data = uint8Array.slice(i + 8, i + 8 + length);

        if (type === 'tEXt') {
            const text = textDecoder.decode(data);
            const [key, value] = text.split('\0');
            metadata[key] = value;
        }

        i += 8 + length + 4; // Move to the next chunk (length + type + data + CRC)
    }

    return metadata;
}

function displayMetadata(metadata) {
    const metadataDiv = document.getElementById('metadata');
    metadataDiv.innerHTML = '<h2>Metadata</h2>';
    for (const key in metadata) {
        if (metadata.hasOwnProperty(key)) {
            const p = document.createElement('p');
            p.innerHTML = `${key}: ${highlightPositiveNegative(metadata[key])}`;
            metadataDiv.appendChild(p);
        }
    }
}

function highlightPositiveNegative(text) {
    const positiveWords = ['positive'];
    const negativeWords = ['negative'];
    const token_n = ['token_normalization']
    
    positiveWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        text = text.replace(regex, `<span style="color: green;">${word}</span>`);
    });
    
    negativeWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        text = text.replace(regex, `<span style="color: red;">${word}</span>`);
    });

    token_n.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        text = text.replace(regex, `<span style="color: blue;">${word}</span>`);
    });
    
    return text;
}