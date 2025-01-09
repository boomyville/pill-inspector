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

let stream = null;

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
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        videoElement.srcObject = stream;
    } catch (err) {
        errorMessage.textContent = `Camera error: ${err.message}`;
        console.error('Camera error:', err);
    }
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
// This is used for the upload rectangle thingy
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
// This is used for the upload rectangle thingy
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
    
    const formData = new FormData();
    formData.append('file', file);
    
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
        const formData = new FormData();
        formData.append('file', blob, 'capture.jpg');
        
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

function handleFile(file) {
    if (!file) return;
    
    loading.style.display = 'block';
    result.textContent = '';
    preview.style.display = 'none';
    errorMessage.textContent = '';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', document.getElementById('modelSelect').value);
    
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
// Use captured image from camera for detection 
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
        const formData = new FormData();
        formData.append('file', blob, 'capture.jpg');
        formData.append('model', document.getElementById('modelSelect').value);
        
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