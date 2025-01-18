// DOM Elements
const cameraContainer = document.getElementById('cameraContainer');
const cameraFeed = document.getElementById('camera-feed');
const captureButton = document.getElementById('captureButton');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const uploadButton = document.getElementById('uploadButton');
const cameraButton = document.getElementById('cameraButton');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const result = document.getElementById('result');

let stream = null;

// Hide loading initially
loading.style.display = 'none';

// Browser compatibility check and polyfill for older browsers
if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices. We need a consistent API.
if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
        // First get ahold of the legacy getUserMedia, if present
        const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        // Some browsers just don't implement it - return a rejected promise with an error
        if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
        return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject);
        });
    }
}

// Camera handling functions
async function startCamera() {
    try {
        // Check if mediaDevices API is available
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error('Camera access is not supported in this browser');
        }

        // Request camera access with constraints
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Prefer back camera on mobile
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        // Show camera container and hide drop zone
        cameraContainer.style.display = 'block';
        dropZone.style.display = 'none';

        // Connect stream to video element
        cameraFeed.srcObject = stream;
        cameraFeed.play().catch(e => {
            showError('Failed to play camera feed: ' + e.message);
        });

    } catch (error) {
        showError('Camera error: ' + error.message);
        console.error('Camera access error:', error);
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    cameraContainer.style.display = 'none';
    cameraFeed.srcObject = null;
}

// Capture image from camera
function captureImage() {
    if (!stream) return;

    // Set canvas dimensions to match video feed
    canvas.width = cameraFeed.videoWidth;
    canvas.height = cameraFeed.videoHeight;

    // Draw current frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraFeed, 0, 0);

    // Convert to blob and process
    canvas.toBlob(processImage, 'image/jpeg');
}

// Process and send image to server
function processImage(blob) {
    const formData = new FormData();
    formData.append('file', blob, 'capture.jpg');
    formData.append('model', document.getElementById('modelSelect').value);

    loading.style.display = 'block';
    errorMessage.textContent = '';

    fetch('/detect', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        displayResult(data);
    })
    .catch(error => {
        showError('Processing error: ' + error.message);
    })
    .finally(() => {
        loading.style.display = 'none';
    });
}

// Display results
function displayResult(data) {
    result.innerHTML = `<p>Detected ${data.count} object(s)</p>`;
    preview.src = '/uploads/' + data.image;
    preview.style.display = 'block';
}

// Error handling
function showError(message) {
    errorMessage.textContent = message;
    loading.style.display = 'none';
    console.error(message);
}

// Event Listeners
cameraButton.addEventListener('click', startCamera);
captureButton.addEventListener('click', captureImage);

// File upload handling
uploadButton.addEventListener('click', () => {
    fileInput.click();
    stopCamera();
});

fileInput.addEventListener('change', (event) => {
    if (event.target.files && event.target.files[0]) {
        processImage(event.target.files[0]);
    }
});

// Drag and drop handling
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processImage(e.dataTransfer.files[0]);
    }
});

// Cleanup when leaving page
window.addEventListener('beforeunload', stopCamera);