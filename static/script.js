// =============================================
// Grab various elements within the document
// =============================================

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const result = document.getElementById('result');
const loading = document.getElementById('loading');
const uploadButton = document.getElementById('uploadButton');
const cameraButton = document.getElementById('cameraButton');
const cameraContainer = document.getElementById('cameraContainer');
const captureButton = document.getElementById('captureButton');
const videoElement = document.getElementById('camera-feed');
const canvas = document.getElementById('canvas');
const errorMessage = document.getElementById('errorMessage');
const confidenceSelect = document.getElementById('confidenceSelect'); // Confidence dropdown element

let stream = null;
let currentFacingMode = 'environment';  // Start with the rear camera

// =============================================
// Event listeners for the various buttons
// =============================================

uploadButton.addEventListener('click', () => {
    dropZone.style.display = 'block';
    cameraContainer.style.display = 'none';
    stopCamera();
});

cameraButton.addEventListener('click', async () => {
    dropZone.style.display = 'none';
    cameraContainer.style.display = 'block';
    errorMessage.textContent = '';

    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: currentFacingMode,  // Use the current facing mode (environment or user)
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        videoElement.srcObject = stream;

        // Fix the flipped camera issue for the rear camera
        if (currentFacingMode === 'environment') {
            videoElement.style.transform = 'scaleX(1)'; 
        } else {
            videoElement.style.transform = '';  // Reset to normal for the front camera
        }
    } catch (err) {
        errorMessage.textContent = `Camera error: ${err.message}`;
        console.error('Camera error:', err);
    }
});

// Add a button to switch between front and rear camera
const switchCameraButton = document.getElementById('switchCameraButton');
switchCameraButton.addEventListener('click', () => {
    // Toggle between 'user' and 'environment'
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    stopCamera();  // Stop the current stream before switching
    cameraButton.click();  // Restart the camera with the new facing mode
});

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        videoElement.srcObject = null;
    }
}

// =============================================
// Handle drag and drop of files
// =============================================

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
    handleFile(e.dataTransfer.files[0]);
});

// =============================================
// Handle upload file dialog
// =============================================

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
});

function handleFile(file) {
    if (!file) return;
    
    loading.style.display = 'block';
    result.textContent = '';
    preview.style.display = 'none';
    errorMessage.textContent = '';
    
    // Get the selected confidence level from the dropdown
    const confidenceLevel = confidenceSelect.value;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', document.getElementById('modelSelect').value);
    formData.append('confidence', confidenceLevel);  // Add confidence level to form data
    
    fetch('/detect', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        loading.style.display = 'none';
        
        if (data.error) {
            errorMessage.textContent = `Error: ${data.error}`;
            return;
        }
        
        result.textContent = `Detected ${data.count} objects`;
        preview.src = `/uploads/${data.image}`;
        preview.style.display = 'block';
    })
    .catch(error => {
        loading.style.display = 'none';
        errorMessage.textContent = `Error: ${error.message}`;
    });
}

// =============================================
// Handle image capture via device camera
// =============================================

captureButton.addEventListener('click', () => {
    if (!stream) {
        errorMessage.textContent = 'Camera not available';
        return;
    }

    loading.style.display = 'block';
    result.textContent = '';
    preview.style.display = 'none';
    errorMessage.textContent = '';
    
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
        // Get the selected confidence level from the dropdown
        const confidenceLevel = confidenceSelect.value;
        
        const formData = new FormData();
        formData.append('file', blob, 'capture.jpg');
        formData.append('model', document.getElementById('modelSelect').value);
        formData.append('confidence', confidenceLevel);  // Add confidence level to form data
        
        fetch('/detect', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            loading.style.display = 'none';
            
            if (data.error) {
                errorMessage.textContent = `Error: ${data.error}`;
                return;
            }
            
            result.textContent = `Detected ${data.count} objects`;
            preview.src = `/uploads/${data.image}`;
            preview.style.display = 'block';
        })
        .catch(error => {
            loading.style.display = 'none';
            errorMessage.textContent = `Error: ${error.message}`;
        });
    }, 'image/jpeg', 0.95);
});

// =============================================
// Page cleanup on unload
// =============================================

window.addEventListener('beforeunload', stopCamera);
