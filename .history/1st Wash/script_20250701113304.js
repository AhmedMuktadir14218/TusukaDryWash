//load data

document.addEventListener('DOMContentLoaded', function () {
    fetch('path/to/dataTable.json')
        .then(response => response.json())
        .then(data => populateTable(data))
        .catch(error => console.error('Error fetching the JSON data:', error));
});

function populateTable(data) {
    const tableBody = document.getElementById('productionTableBody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 transition-all duration-200";
        
        tr.innerHTML = `
            <td class="px-4 py-3.5 text-gray-600" data-label="S/N">${row['S/N']}</td>
            <td class="px-4 py-3.5 text-gray-600 font-medium" data-label="Fac">${row.Factory}</td>
            <td class="px-4 py-3.5 text-gray-600" data-label="Unit">${row.Unit}</td>
            <td class="px-4 py-3.5 font-semibold text-gray-700" data-label="Buyer">${row.Buyer}</td>
            <td class="px-4 py-3.5 text-gray-600 font-medium" data-label="Style">${row['Style Name']}</td>
            <td class="px-4 py-3.5 text-gray-600" data-label="PO/Color">${row['FastReact No']}</td>
            <td class="px-4 py-3.5 text-gray-700 font-medium" data-label="Work Order">${row['Work Order No']}</td>
            <td class="px-4 py-3.5 text-gray-600" data-label="T. Date">${new Date(row.TOD).toLocaleDateString()}</td>
            <td class="px-4 py-3.5 text-gray-600 font-medium" data-label="Ord. Qty">${row['Order Quantity']}</td>
            <td class="px-4 py-3.5 font-medium text-green-600" data-label="Wash Recv Qty">${row[' Total Wash Received ']}</td>
            <td class="px-4 py-3.5 font-medium text-orange-600" data-label="Bal. Qty">${row[' Wash Balance From Received ']}</td>
            <td class="px-4 py-3.5 text-gray-600" data-label="Marks">${row.Marks}</td>
            <td class="px-4 py-3.5 font-medium text-gray-600" data-label="1st Wash Qty">0</td>
            <td class="px-4 py-3.5">
                <button class="open-batch-modal-btn bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    1st Wash Batch
                </button>
            </td>
        `;
        
        tableBody.appendChild(tr);
    });
}



const batchCardModal = document.getElementById('batchCardModal');
const closeBatchModalBtn = document.getElementById('closeBatchModal');
const openBatchModalButtons = document.querySelectorAll('.open-batch-modal-btn');
const saveBatchDataBtn = document.getElementById('saveBatchData');

// Modal elements for Batch Card
const modalBatchWorkOrder = document.getElementById('modalBatchWorkOrder');
const modalBatchStyle = document.getElementById('modalBatchStyle');
const modalBatchPO = document.getElementById('modalBatchPO');
const modalBatchNo = document.getElementById('modalBatchNo');
const batchQtyInput = document.getElementById('batchQtyInput');
const batchWeightInput = document.getElementById('batchWeightInput');
const batchProcessCheckboxes = document.querySelectorAll('input[name="batchProcess"]');
const qrCodeCanvas = document.getElementById('qrCodeCanvas');

let currentActiveRow = null; // To keep track of which row opened the modal

// Object to store batch numbers and 1st wash quantities for each work order
// In a real application, this data would come from a backend/database
const workOrderData = {
    "00059371": { batchNo: 1, firstWashQty: 0 },
    "00059372": { batchNo: 1, firstWashQty: 0 },
    "00059526": { batchNo: 1, firstWashQty: 0 },
    "00059527": { batchNo: 1, firstWashQty: 0 },
    "00051652": { batchNo: 1, firstWashQty: 0 },
    "00051651": { batchNo: 1, firstWashQty: 0 },
};

function openModal(modalElement) {
    modalElement.classList.remove('hidden');
    setTimeout(() => {
        modalElement.classList.remove('opacity-0');
        modalElement.querySelector('div').classList.remove('scale-95');
        modalElement.querySelector('div').classList.add('scale-100');
    }, 10);
}

function closeModal(modalElement) {
    modalElement.classList.add('opacity-0');
    modalElement.querySelector('div').classList.remove('scale-100');
    modalElement.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        modalElement.classList.add('hidden');
        resetBatchModal(); // Reset content specific to batch modal
    }, 300);
}

function resetBatchModal() {
    modalBatchWorkOrder.textContent = '';
    modalBatchStyle.textContent = '';
    modalBatchPO.textContent = '';
    batchQtyInput.value = '';
    batchWeightInput.value = '';
    batchProcessCheckboxes.forEach(checkbox => checkbox.checked = false); // Ensure checkboxes are reset
    modalBatchNo.textContent = '1'; // Default, will be overwritten on open
    // Clear QR code
    const context = qrCodeCanvas.getContext('2d');
    context.clearRect(0, 0, qrCodeCanvas.width, qrCodeCanvas.height);
}

function generateQRCode(workOrder, style, po, processStep) {
    const qrData = `Work Order ${workOrder}\nStyle ${style}\nPO ${po}\nProcess Step ${processStep}`;
    new QRious({
        element: qrCodeCanvas,
        value: qrData,
        size: 100, // Adjust size as needed
        padding: 10,
        background: 'white',
        foreground: 'black'
    });
}

// Event listener for opening the Batch Card modal
openBatchModalButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        currentActiveRow = event.target.closest('tr'); // Set the active row
        const workOrder = currentActiveRow.getAttribute('data-work-order');
        const style = currentActiveRow.querySelector('[data-label="Style"]').textContent;
        const po = currentActiveRow.querySelector('[data-label="PO/Color"]').textContent;
        const processStep = '1st Wash'; // Hardcoded as per requirement

        // Populate modal fields
        modalBatchWorkOrder.textContent = workOrder;
        modalBatchStyle.textContent = style;
        modalBatchPO.textContent = po;
        
        // Set the current batch number for this work order
        modalBatchNo.textContent = (workOrderData[workOrder]?.batchNo || 1) + ' ';

        // Generate QR Code
        generateQRCode(workOrder, style, po, processStep);

        openModal(batchCardModal);
    });
});

// Event listener for closing the Batch Card modal
closeBatchModalBtn.addEventListener('click', () => closeModal(batchCardModal));

// Close modal when clicking outside of it
batchCardModal.addEventListener('click', (event) => {
    if (event.target === batchCardModal) {
        closeModal(batchCardModal);
    }
});

// Save Batch Data (Confirm & Save button)
saveBatchDataBtn.addEventListener('click', () => {
    if (!currentActiveRow) {
        console.error("No active row selected.");
        return;
    }

    const batchQty = parseInt(batchQtyInput.value, 10);
    const batchWeight = parseFloat(batchWeightInput.value); // Use parseFloat for weight
    const workOrder = currentActiveRow.getAttribute('data-work-order');

    if (isNaN(batchQty) || batchQty <= 0) {
        alert("Please enter a valid Batch Quantity.");
        return;
    }
    if (isNaN(batchWeight) || batchWeight <= 0) {
        alert("Please enter a valid Batch Weight.");
        return;
    }

    // Update 1st wash qty in the main table
    const firstWashQtyCell = currentActiveRow.querySelector('[data-label="1st Wash Qty"]');
    let currentFirstWashQty = parseInt(firstWashQtyCell.textContent, 10) || 0;
    currentFirstWashQty += batchQty;
    firstWashQtyCell.textContent = currentFirstWashQty;

    // Update stored data for the work order
    if (workOrderData[workOrder]) {
        workOrderData[workOrder].batchNo++; // Increment batch number for next time
        workOrderData[workOrder].firstWashQty = currentFirstWashQty;
    } else {
        // If somehow a new work order appears, initialize it
        workOrderData[workOrder] = { batchNo: 2, firstWashQty: currentFirstWashQty };
    }

    // Optionally, you could collect selected processes here:
    const selectedProcesses = [];
    batchProcessCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedProcesses.push(checkbox.value);
        }
    });
    console.log(`Work Order: ${workOrder}, Batch Qty: ${batchQty}, Batch Weight: ${batchWeight}, Selected Processes: ${selectedProcesses.join(', ')}`);

    closeModal(batchCardModal);
});