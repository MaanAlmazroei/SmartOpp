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

    // --- Drag & Drop ---
    dropzone.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragging');
    });

    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragging');
    });

    dropzone.addEventListener('dragover', (e) => e.preventDefault());

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragging');
        if (e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
        }
    });

    // --- File select ---
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    });

    // --- Process file (validate) ---
    function processFile(selectedFile) {
        errorContainer.style.display = 'none';
        statusContainer.style.display = 'none';
        matchesContainer.style.display = 'none';
        fileInfo.style.display = 'none';
        uploadButton.style.display = 'none';

        const validFileTypes = ['.docx', '.pdf'];
        const ext = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));

        if (!validFileTypes.includes(ext)) {
            showError(`${selectedFile.name} is not a DOCX or PDF file`);
            return;
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
            showError(`${selectedFile.name} exceeds the 10MB size limit`);
            return;
        }

        file = selectedFile;
        fileNameDisplay.textContent = `File: ${file.name}`;
        fileInfo.style.display = 'flex';
        uploadButton.style.display = 'block';
    }

    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
    }

    // --- Remove file ---
    removeFileButton.addEventListener('click', () => {
        file = null;
        fileInfo.style.display = 'none';
        uploadButton.style.display = 'none';
        matchesContainer.style.display = 'none';
    });

    // --- Upload file to Hugging Face backend ---
    uploadButton.addEventListener('click', async () => {
        if (!file || isProcessing) return;

        isProcessing = true;
        uploadButton.textContent = 'Processing...';
        statusContainer.style.display = 'none';

        try {
            let formData = new FormData();
            // backend expects "file" (not "cv")
            formData.append("file", file);

            const response = await fetch("https://maankau-cv-job-matcher.hf.space/match", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error("Server error");

            const data = await response.json();
            displayMatches(data.matches);

        } catch (error) {
            showError("Upload failed. Please try again.");
        } finally {
            isProcessing = false;
            uploadButton.textContent = 'Find Matching Opportunities';
        }
    });

    // --- Show job matches ---
    function displayMatches(matches) {
        matchesContainer.innerHTML = '';
        matchesContainer.style.display = 'block';

        if (!matches || matches.length === 0) {
            matchesContainer.textContent = 'No matching jobs found.';
            return;
        }

        const heading = document.createElement("h3");
        heading.textContent = "Top Matching Jobs:";
        matchesContainer.appendChild(heading);

        matches.forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.className = 'match-card';
            matchCard.innerHTML = `
                <div class="match-name">${match.predicted_category} — ${match.match_score}%</div>
                <div class="match-details">
                    <p>${match.url}</p>
                    <a href="${match.url}" target="_blank">View Job</a>
                </div>
            `;
            matchesContainer.appendChild(matchCard);
        });
    }
});
