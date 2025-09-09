document.addEventListener("DOMContentLoaded", () => {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const errorContainer = document.getElementById('error-container');
    const statusContainer = document.getElementById('status-container');
    const fileInfo = document.getElementById('file-info');
    const fileNameDisplay = document.getElementById('file-name');
    const removeFileButton = document.getElementById('remove-file-button');
    const uploadButton = document.getElementById('upload-button');
    const matchesContainer = document.getElementById('matches-container');

    let file = null;
    let isProcessing = false;

    dropzone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragging');
    });

    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragging');
    });

    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragging');
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            processFile(droppedFiles[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        const selectedFiles = e.target.files;
        if (selectedFiles.length > 0) {
            processFile(selectedFiles[0]);
        }
    });

    function processFile(selectedFile) {
        errorContainer.style.display = 'none';
        statusContainer.style.display = 'none';
        matchesContainer.style.display = 'none';
        fileInfo.style.display = 'none';
        uploadButton.style.display = 'none';

        const validFileTypes = ['.docx', '.pdf'];

        const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
        if (!validFileTypes.includes(fileExtension)) {
            showError(`${selectedFile.name} is not a DOCX or PDF file`);
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
            showError(`${selectedFile.name} exceeds the 10MB size limit`);
            return;
        }

        file = selectedFile;
        displayFileInfo();
        uploadButton.style.display = 'block';
    }

    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }

    function displayFileInfo() {
        fileNameDisplay.textContent = `File: ${file.name}`;
        fileInfo.style.display = 'flex';
    }

    removeFileButton.addEventListener('click', () => {
        file = null;
        fileInfo.style.display = 'none';
        uploadButton.style.display = 'none';
        matchesContainer.style.display = 'none';
    });

    uploadButton.addEventListener('click', async () => {
        if (!file || isProcessing) return;
        
        isProcessing = true;
        uploadButton.textContent = 'Processing...';
        statusContainer.style.display = 'none';

        try {
            // Simulate processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock the response
            const mockMatches = [
                { id: 1, name: 'Opportunity 1', category: 'Business', date: '2023-10-15', status: 'Completed', matchScore: 92 },
                { id: 2, name: 'Opportunity 2', category: 'Business', date: '2023-09-20', status: 'Reviewed', matchScore: 85 }
            ];

            displayMatches(mockMatches);
        } catch (error) {
            showError('Upload failed. Please try again.');
        } finally {
            isProcessing = false;
            uploadButton.textContent = 'Find Matching Opportunities';
        }
    });

    function displayMatches(matches) {
        matchesContainer.innerHTML = '';
        matchesContainer.style.display = 'block';
        if (matches.length > 0) {
            matches.forEach(match => {
                const matchCard = document.createElement('div');
                matchCard.className = 'match-card';
                matchCard.innerHTML = `
                    <div class="match-name">${match.name}</div>
                    <div class="match-details">
                        <p>Category: ${match.category}</p>
                        <p>Date: ${match.date}</p>
                        <p>Status: ${match.status} (${match.matchScore}% match)</p>
                    </div>
                `;
                matchesContainer.appendChild(matchCard);
            });
        } else {
            matchesContainer.textContent = 'No matching documents found.';
        }
    }
});