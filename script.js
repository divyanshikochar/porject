// Patient data storage
let patientData = {
    name: '',
    id: '',
    dob: '',
    gender: '',
    email: '',
    phone: '',
    notes: ''
};

// DOM Elements
const patientDetailsSection = document.getElementById('patientDetailsSection');
const patientDetailsForm = document.getElementById('patientDetailsForm');
const uploadSection = document.getElementById('uploadSection');
const patientSummary = document.getElementById('patientSummary');
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const previewImage = document.getElementById('previewImage');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set up patient form submission
    patientDetailsForm.addEventListener('submit', handlePatientFormSubmit);

    // Set up file handling
    setupFileHandling();
});

// Handle patient form submission
function handlePatientFormSubmit(e) {
    e.preventDefault();

    // Collect patient data
    patientData = {
        name: document.getElementById('patientName').value,
        id: document.getElementById('patientId').value,
        dob: document.getElementById('patientDob').value,
        gender: document.getElementById('patientGender').value,
        email: document.getElementById('patientEmail').value,
        phone: document.getElementById('patientPhone').value,
        notes: document.getElementById('patientNotes').value
    };

    // Show patient summary
    displayPatientSummary();

    // Hide patient form and show upload section
    patientDetailsSection.style.display = 'none';
    uploadSection.style.display = 'block';

    // Scroll to upload section
    uploadSection.scrollIntoView({ behavior: 'smooth' });
}

// Display patient summary
function displayPatientSummary() {
    // Format date of birth
    const dobDate = patientData.dob ? new Date(patientData.dob) : null;
    const formattedDob = dobDate ? dobDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '';

    // Calculate age if DOB is provided
    let age = '';
    if (dobDate) {
        const ageDifMs = Date.now() - dobDate.getTime();
        const ageDate = new Date(ageDifMs);
        age = Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    // Create patient summary HTML
    patientSummary.innerHTML = `
        <p class="patient-name">${patientData.name}</p>
        <p><strong>ID:</strong> ${patientData.id || 'Not provided'}</p>
        <p><strong>DOB:</strong> ${formattedDob} ${age ? `(${age} years)` : ''}</p>
        <p><strong>Gender:</strong> ${patientData.gender}</p>
    `;
}

// Edit patient details
function editPatientDetails() {
    // Hide upload section and show patient form
    uploadSection.style.display = 'none';
    patientDetailsSection.style.display = 'block';

    // Scroll to patient form
    patientDetailsSection.scrollIntoView({ behavior: 'smooth' });
}

// Set up file handling
function setupFileHandling() {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when dragging over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    // Handle selected files
    fileInput.addEventListener('change', handleFiles);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    dropZone.style.borderColor = 'var(--primary-color)';
    dropZone.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
}

function unhighlight() {
    dropZone.style.borderColor = 'var(--border-color)';
    dropZone.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(e) {
    const files = e.target ? e.target.files : e;
    if (files.length) {
        const file = files[0];
        if (file.type.match('image.*')) {
            const reader = new FileReader();

            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
                dropZone.style.display = 'none';
            }

            reader.readAsDataURL(file);
        } else {
            alert('Please upload an image file');
        }
    }
}

function analyzeXray() {
    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('resultBox');
    const analysisResult = document.getElementById('analysisResult');

    if (fileInput.files.length === 0 && !previewImage.src) {
        alert("Please upload an X-ray image.");
        return;
    }

    loading.style.display = 'block';
    resultBox.style.display = 'none';

    setTimeout(() => {
        const results = [
            {text: "Normal lung X-ray detected. No signs of pneumonia or other abnormalities. (Confidence: 95%)", class: "result-normal"},
            {text: "Possible pneumonia detected. Consultation with a healthcare professional is recommended. (Confidence: 78%)", class: "result-warning"},
            {text: "Abnormal findings detected. Immediate medical attention may be required. (Confidence: 87%)", class: "result-danger"}
        ];

        const result = results[Math.floor(Math.random() * results.length)];
        analysisResult.innerHTML = `<span class="${result.class}">${result.text}</span>`;

        loading.style.display = 'none';
        resultBox.style.display = 'block';
    }, 2500);
}

function resetUpload() {
    previewImage.style.display = 'none';
    previewImage.src = '';
    dropZone.style.display = 'block';
    fileInput.value = '';
    document.getElementById('resultBox').style.display = 'none';
}

function downloadResult() {
    if (!previewImage.src) {
        alert("No X-ray image to download.");
        return;
    }

    // Get the analysis result
    const analysisResultElement = document.getElementById('analysisResult');
    if (!analysisResultElement.textContent) {
        alert("Please analyze the X-ray first before downloading the report.");
        return;
    }

    // Create a loading indicator
    const downloadBtn = document.querySelector('.btn-secondary');
    const originalBtnText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    downloadBtn.disabled = true;

    try {
        // Create a new PDF document
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // Set document properties
        doc.setProperties({
            title: 'Pneumoscan X-ray Analysis Report',
            subject: 'Medical Report',
            author: 'Pneumoscan AI System',
            keywords: 'x-ray, pneumonia, medical, report, ai',
            creator: 'Pneumoscan'
        });

        // Add logo and header
        const pageWidth = doc.internal.pageSize.getWidth();

        // Add header with logo (simulated)
        doc.setFillColor(52, 152, 219); // Primary color
        doc.rect(0, 0, pageWidth, 30, 'F');

        // Add logo text in white
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('PNEUMOSCAN', 15, 15);

        // Add lung icon (simulated with text)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('AI-Powered Pulmonary Analysis', 15, 22);

        // Add report title
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('X-RAY ANALYSIS REPORT', pageWidth / 2, 45, { align: 'center' });

        // Add date and report ID
        const now = new Date();
        const reportDate = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const reportTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        const reportId = `PSC-${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Report ID: ${reportId}`, 15, 55);
        doc.text(`Date: ${reportDate}`, pageWidth - 15, 55, { align: 'right' });
        doc.text(`Time: ${reportTime}`, pageWidth - 15, 60, { align: 'right' });

        // Add patient information section
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PATIENT INFORMATION', 15, 70);

        // Format date of birth
        const dobDate = patientData.dob ? new Date(patientData.dob) : null;
        const formattedDob = dobDate ? dobDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : 'Not provided';

        // Calculate age if DOB is provided
        let age = '';
        if (dobDate) {
            const ageDifMs = Date.now() - dobDate.getTime();
            const ageDate = new Date(ageDifMs);
            age = Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        // Add patient details
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(15, 75, pageWidth - 30, 35, 3, 3, 'FD');

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${patientData.name}`, 20, 83);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        const patientDetails = [
            { label: 'Patient ID:', value: patientData.id || 'Not provided' },
            { label: 'Date of Birth:', value: `${formattedDob}${age ? ` (${age} years)` : ''}` },
            { label: 'Gender:', value: patientData.gender || 'Not provided' },
            { label: 'Contact:', value: patientData.phone || patientData.email || 'Not provided' }
        ];

        let yPos = 90;
        patientDetails.forEach(detail => {
            doc.setFont('helvetica', 'bold');
            doc.text(detail.label, 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(detail.value, 60, yPos);
            yPos += 6;
        });

        // Add clinical notes if provided
        if (patientData.notes) {
            yPos += 2;
            doc.setFont('helvetica', 'bold');
            doc.text('Clinical Notes:', 15, yPos);
            doc.setFont('helvetica', 'normal');

            const splitNotes = doc.splitTextToSize(patientData.notes, pageWidth - 40);
            doc.text(splitNotes, 15, yPos + 6);

            yPos += 8 + (splitNotes.length * 5);
        } else {
            yPos += 8;
        }

        // Add a line separator
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(15, yPos, pageWidth - 15, yPos);

        // Get the dimensions of the image
        const imgWidth = previewImage.naturalWidth;
        const imgHeight = previewImage.naturalHeight;

        // Calculate the aspect ratio
        const ratio = imgWidth / imgHeight;

        // Set the maximum width and height for the image in the PDF
        const maxWidth = 180; // mm
        const maxHeight = 120; // mm

        // Calculate the dimensions to fit within the PDF
        let pdfWidth, pdfHeight;

        if (ratio > 1) {
            // Landscape image
            pdfWidth = maxWidth;
            pdfHeight = pdfWidth / ratio;
        } else {
            // Portrait image
            pdfHeight = maxHeight;
            pdfWidth = pdfHeight * ratio;
        }

        // Calculate the position to center the image
        const x = (pageWidth - pdfWidth) / 2;
        const y = yPos + 10; // Position after patient info

        // Add the image to the PDF
        doc.addImage(
            previewImage.src,
            'JPEG',
            x,
            y,
            pdfWidth,
            pdfHeight
        );

        // Add image details
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Chest X-ray Image (PA View)', pageWidth / 2, y + pdfHeight + 10, { align: 'center' });

        // Add analysis results section
        const resultY = y + pdfHeight + 25;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('ANALYSIS RESULTS', 15, resultY);

        // Add a colored box based on the result
        const resultText = analysisResultElement.textContent.trim();
        let resultColor;

        if (resultText.includes('Normal')) {
            resultColor = [0, 184, 148]; // Success color
        } else if (resultText.includes('Possible')) {
            resultColor = [253, 203, 110]; // Warning color
        } else {
            resultColor = [231, 76, 60]; // Danger color
        }

        doc.setFillColor(resultColor[0], resultColor[1], resultColor[2]);
        doc.setDrawColor(resultColor[0], resultColor[1], resultColor[2]);
        doc.roundedRect(15, resultY + 5, pageWidth - 30, 25, 3, 3, 'FD');

        // Add the result text
        doc.setTextColor(255, 255, 255);
        if (resultText.includes('Normal')) {
            doc.setTextColor(0, 0, 0); // Black text for light background
        }
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');

        // Split the result text to fit in the box
        const splitResult = doc.splitTextToSize(resultText, pageWidth - 60);
        doc.text(splitResult, pageWidth / 2, resultY + 18, { align: 'center' });

        // Add additional details section
        const detailsY = resultY + 45;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('ADDITIONAL INFORMATION', 15, detailsY);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Add technical details
        const technicalDetails = [
            { label: 'Analysis Method:', value: 'Deep Learning Convolutional Neural Network' },
            { label: 'Model Version:', value: 'PneumoNet v2.3.1' },
            { label: 'Image Resolution:', value: `${imgWidth} x ${imgHeight} pixels` },
            { label: 'Processing Time:', value: '2.5 seconds' }
        ];

        let currentY = detailsY + 10;
        technicalDetails.forEach(detail => {
            doc.setFont('helvetica', 'bold');
            doc.text(detail.label, 15, currentY);
            doc.setFont('helvetica', 'normal');
            doc.text(detail.value, 70, currentY);
            currentY += 7;
        });

        // Add disclaimer
        const disclaimerY = currentY + 10;
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('DISCLAIMER', 15, disclaimerY);

        const disclaimer = 'This report was generated by an AI system and is intended for informational purposes only. The analysis provided should not be considered as a definitive medical diagnosis. Please consult with a qualified healthcare professional for proper medical advice and treatment. Pneumoscan is not responsible for any decisions made based on this report.';

        const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 30);
        doc.text(splitDisclaimer, 15, disclaimerY + 5);

        // Add footer
        const footerY = doc.internal.pageSize.getHeight() - 10;
        doc.setFontSize(8);
        doc.text('Pneumoscan - AI Pulmonary Disease Detection', pageWidth / 2, footerY, { align: 'center' });
        doc.text(`Report generated on ${reportDate} at ${reportTime}`, pageWidth / 2, footerY + 4, { align: 'center' });
        doc.text(`Report ID: ${reportId}`, pageWidth / 2, footerY + 8, { align: 'center' });

        // Generate a filename with date and time
        const filename = `pneumoscan_report_${reportId}.pdf`;

        // Save the PDF
        doc.save(filename);
    } catch (error) {
        console.error('PDF generation error:', error);
        alert("Error generating PDF. Please try again.");
    } finally {
        // Restore the button
        downloadBtn.innerHTML = originalBtnText;
        downloadBtn.disabled = false;
    }
}

function shareResult() {
    alert("Sharing results...");
    // In a real implementation, this would open sharing options
}