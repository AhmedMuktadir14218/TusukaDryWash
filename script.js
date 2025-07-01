document.addEventListener('DOMContentLoaded', function () {
    fetch('./dataTable.json')
        .then(response => response.json())
        .then(data => {
            window.originalTableData = data.map((row, index) => ({ ...row, _originalIndex: index })); // Store original index
            window.currentTableState = JSON.parse(JSON.stringify(window.originalTableData)); // Initialize current state

            populateTable(window.currentTableState);
            setupModalEventListeners();
            setupMergeFunctionality();
        })
        .catch(error => console.error('Error fetching the JSON data:', error));
});

let dataTableInstance; // Global variable to hold the DataTable instance

function setupModalEventListeners() {
    document.querySelector('#productionTableBody').addEventListener('click', (event) => {
        if (event.target.classList.contains('open-batch-modal-btn')) {
            openBatchModal(event);
        }
    });
}

function populateTable(dataToDisplay) {
    const tableBody = document.getElementById('productionTableBody');

    // Destroy existing DataTable instance if it exists
    if (dataTableInstance) {
        dataTableInstance.destroy();
        tableBody.innerHTML = ''; // Clear the table body
    }

    dataToDisplay.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-gray-50 transition-all duration-200 pt-9";

        // Determine if it's a merged row and apply appropriate class and data attributes
        if (row._merged) {
            tr.classList.add('bg-yellow-100'); // Highlight merged rows
            tr.setAttribute('data-merged', 'true');
            tr.setAttribute('data-original-indices', JSON.stringify(row._originalIndices));
            tr.setAttribute('data-work-order', row['Work Order No']); // Work order for merged row
        } else {
            tr.setAttribute('data-original-indices', JSON.stringify([row._originalIndex]));
            tr.setAttribute('data-work-order', row['Work Order No']); // Original work ordermergedPOColors
        }

        const snDisplay = row._merged ? `${row['S/N']} (Merged)` : row['S/N'];
        const poColorDisplay = row._merged ? row['Color'] : row['Color']; // Color is already concatenated in merged row data

        tr.innerHTML = `
            <td class="px-4 py-3.5 text-gray-600">
                <input type="checkbox" class="row-checkbox h-4 w-4 text-gray-600 rounded-sm focus:ring-gray-500 border-gray-300">
            </td>
            <td class="px-4 py-3.5 text-gray-600" data-label="S/N">${snDisplay}</td>
            <td class="px-4 py-3.5 text-gray-600 font-medium" data-label="Fac">${row.Factory}</td>
            <td class="px-4 py-3.5 text-gray-600" data-label="Unit">${row.Unit}</td>
            <td class="px-4 py-3.5 font-semibold text-gray-700" data-label="Buyer">${row.Buyer}</td>
            <td class="px-4 py-3.5 text-gray-600 font-medium" data-label="Style">${row['Style Name']}</td>
            <td class="px-4 py-3.5 text-gray-600" data-label="PO/Color">${poColorDisplay}</td>
            <td class="px-4 py-3.5 text-gray-700 font-medium" data-label="Work Order">${row['Work Order No']}</td>
            <td class="px-4 py-3.5 text-gray-600" data-label="T. Date">${new Date(row.TOD).toLocaleDateString()}</td>
            <td class="px-4 py-3.5 text-gray-600" data-label="Ord. Qty">${row['Order Quantity']}</td>
            <td class="px-4 py-3.5 font-medium text-green-600" data-label="Wash Recv Qty">${row[' Total Wash Received ']}</td>
            <td class="px-4 py-3.5 font-medium text-orange-600" data-label="Bal. Qty">${row[' Wash Balance From Received ']}</td>
            <td class="px-4 py-3.5 text-gray-600" data-label="Marks">${row.Marks}</td>
            <td class="px-4 py-3.5 font-medium text-gray-600" data-label="1st Wash Qty">${row['1st Wash Qty'] || 0}</td>
            <td class="px-4 py-3.5">
                <button class="open-batch-modal-btn bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    1st Batch
                </button>
            </td>
            <td class="px-4 py-3.5 font-semibold text-gray-600" data-label="Total Order Quantity">${row['Order Quantity']}</td>
        `;
        tableBody.appendChild(tr);
    });

    // Initialize DataTable with data from the DOM
    dataTableInstance = $('#productionTable').DataTable({
        scrollY: '50vh',
        scrollCollapse: true,
        paging: true,
        destroy: true, // Allow re-initialization
        columnDefs: [
            { orderable: false, targets: 0 }
        ]
    });
}

const batchCardModal = document.getElementById('batchCardModal');
const closeBatchModalBtn = document.getElementById('closeBatchModal');
const saveBatchDataBtn = document.getElementById('saveBatchData');

const modalBatchWorkOrder = document.getElementById('modalBatchWorkOrder');
const modalBatchStyle = document.getElementById('modalBatchStyle');
const modalBatchPO = document.getElementById('modalBatchPO');
const modalBatchNo = document.getElementById('modalBatchNo');
const batchQtyInput = document.getElementById('batchQtyInput');
const batchWeightInput = document.getElementById('batchWeightInput');
const batchProcessCheckboxes = document.querySelectorAll('input[name="batchProcess"]');
const qrCodeCanvas = document.getElementById('qrCodeCanvas');

let currentActiveRow = null; // To keep track of which row opened the modal
const workOrderData = {}; // Stores batch numbers and 1st wash quantities for each work order

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
        resetBatchModal();
    }, 300);
}

function resetBatchModal() {
    modalBatchWorkOrder.textContent = '';
    modalBatchStyle.textContent = '';
    modalBatchPO.textContent = '';
    batchQtyInput.value = '';
    batchWeightInput.value = '';
    batchProcessCheckboxes.forEach(checkbox => checkbox.checked = false);
    modalBatchNo.textContent = '1';
    const context = qrCodeCanvas.getContext('2d');
    context.clearRect(0, 0, qrCodeCanvas.width, qrCodeCanvas.height);
}

function generateQRCode(workOrder, style, po, processStep) {
    const qrData = `Work Order ${workOrder}\nStyle ${style}\nPO ${po}\nProcess Step ${processStep}`;
    new QRious({
        element: qrCodeCanvas,
        value: qrData,
        size: 100,
        padding: 10,
        background: 'white',
        foreground: 'black'
    });
}

function openBatchModal(event) {
    currentActiveRow = event.target.closest('tr');
    const workOrder = currentActiveRow.querySelector('[data-label="Work Order"]').textContent;
    const style = currentActiveRow.querySelector('[data-label="Style"]').textContent;
    const po = currentActiveRow.querySelector('[data-label="PO/Color"]').textContent;
    const processStep = '1st Wash';

    modalBatchWorkOrder.textContent = workOrder;
    modalBatchStyle.textContent = style;
    modalBatchPO.textContent = po;

    if (!workOrderData[workOrder]) {
        workOrderData[workOrder] = { batchNo: 1, firstWashQty: 0 };
    }
    modalBatchNo.textContent = workOrderData[workOrder].batchNo;

    generateQRCode(workOrder, style, po, processStep);

    openModal(batchCardModal);
}

closeBatchModalBtn.addEventListener('click', () => closeModal(batchCardModal));

batchCardModal.addEventListener('click', (event) => {
    if (event.target === batchCardModal) {
        closeModal(batchCardModal);
    }
});

saveBatchDataBtn.addEventListener('click', () => {
    if (!currentActiveRow) {
        console.error("No active row selected.");
        return;
    }

    const batchQty = parseInt(batchQtyInput.value, 10);
    const batchWeight = parseFloat(batchWeightInput.value);
    const workOrder = currentActiveRow.querySelector('[data-label="Work Order"]').textContent;

    if (isNaN(batchQty) || batchQty <= 0) {
        alert("Please enter a valid Batch Quantity.");
        return;
    }
    if (isNaN(batchWeight) || batchWeight <= 0) {
        alert("Please enter a valid Batch Weight.");
        return;
    }

    const firstWashQtyCell = currentActiveRow.querySelector('[data-label="1st Wash Qty"]');
    let currentFirstWashQty = parseInt(firstWashQtyCell.textContent, 10) || 0;
    currentFirstWashQty += batchQty;
    firstWashQtyCell.textContent = currentFirstWashQty;

    // Update the quantity in the currentTableState as well
    const originalIndices = JSON.parse(currentActiveRow.getAttribute('data-original-indices'));
    const isMergedRow = currentActiveRow.hasAttribute('data-merged');

    if (isMergedRow) {
        // If it's a merged row, find it in currentTableState and update its 1st Wash Qty
        const mergedRowIndex = window.currentTableState.findIndex(row => 
            row._merged && JSON.stringify(row._originalIndices) === JSON.stringify(originalIndices)
        );
        if (mergedRowIndex !== -1) {
            window.currentTableState[mergedRowIndex]['1st Wash Qty'] = currentFirstWashQty;
        }
    } else {
        // If it's an original row, find it by its _originalIndex and update its 1st Wash Qty
        const originalRowIndex = originalIndices[0];
        const stateIndex = window.currentTableState.findIndex(row => !row._merged && row._originalIndex === originalRowIndex);
        if (stateIndex !== -1) {
            window.currentTableState[stateIndex]['1st Wash Qty'] = currentFirstWashQty;
        }
    }

    if (workOrderData[workOrder]) {
        workOrderData[workOrder].batchNo++;
        workOrderData[workOrder].firstWashQty = currentFirstWashQty;
    } else {
        workOrderData[workOrder] = { batchNo: 2, firstWashQty: currentFirstWashQty };
    }

    const selectedProcesses = [];
    batchProcessCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedProcesses.push(checkbox.value);
        }
    });
    console.log(`Work Order: ${workOrder}, Batch Qty: ${batchQty}, Batch Weight: ${batchWeight}, Selected Processes: ${selectedProcesses.join(', ')}`);

    closeModal(batchCardModal);
});

// --- Merge and Unmerge Functionality ---
function setupMergeFunctionality() {
    const mergeRowsBtn = document.getElementById('mergeRowsBtn');
    mergeRowsBtn.addEventListener('click', mergeSelectedRows);

    const unmergeRowsBtn = document.getElementById('unmergeRowsBtn');
    unmergeRowsBtn.addEventListener('click', unmergeSelectedRow);
}

function mergeSelectedRows() {
    const selectedRowsDOMElements = Array.from(document.querySelectorAll('#productionTableBody .row-checkbox:checked'))
        .map(checkbox => checkbox.closest('tr'));

    if (selectedRowsDOMElements.length < 2) {
        alert("Please select at least two rows to merge.");
        return;
    }

    if (!confirm(`Are you sure you want to merge ${selectedRowsDOMElements.length} selected rows?`)) {
        return;
    }

    // Get the actual data objects from currentTableState for the selected DOM elements
    let selectedDataObjects = [];
    let indicesToRemoveFromState = new Set();
    let firstSelectedRowStateIndex = -1; // To determine where to insert the merged row

    selectedRowsDOMElements.forEach(domRow => {
        const originalIndices = JSON.parse(domRow.getAttribute('data-original-indices'));
        const isMergedRow = domRow.hasAttribute('data-merged');

        // Find the corresponding object(s) in currentTableState
        const foundIndices = [];
        if (isMergedRow) {
            const indexInState = window.currentTableState.findIndex(stateRow =>
                stateRow._merged && JSON.stringify(stateRow._originalIndices) === JSON.stringify(originalIndices)
            );
            if (indexInState !== -1) {
                selectedDataObjects.push(window.currentTableState[indexInState]);
                foundIndices.push(indexInState);
            }
        } else {
            const originalIndex = originalIndices[0];
            const indexInState = window.currentTableState.findIndex(stateRow =>
                !stateRow._merged && stateRow._originalIndex === originalIndex
            );
            if (indexInState !== -1) {
                selectedDataObjects.push(window.currentTableState[indexInState]);
                foundIndices.push(indexInState);
            }
        }
        
        foundIndices.forEach(idx => {
            indicesToRemoveFromState.add(idx);
            // If this is the first selected row being processed, record its index in state
            if (firstSelectedRowStateIndex === -1 || idx < firstSelectedRowStateIndex) {
                 firstSelectedRowStateIndex = idx;
            }
        });
    });

    // Sort the indices to remove in descending order to avoid issues during splice
    const sortedIndicesToRemove = Array.from(indicesToRemoveFromState).sort((a, b) => b - a);

    // Create the new merged data object
    let mergedOrderQuantity = 0;
    let mergedWashReceived = 0;
    let mergedWashBalance = 0;
    let mergedFirstWashQty = 0;
    let mergedS_N = [];
    let mergedWorkOrders = [];
    let mergedPOColors = [];
    let mergedStyles = [];
    let mergedUnits = [];
    let mergedBuyers = [];


    let mergedCombinedOriginalIndices = [];
    let firstRowData = {}; // Data from the first actual row (not necessarily the first selected DOM row if it was merged)

    selectedDataObjects.forEach((dataRow, index) => {
        if (dataRow._merged) {
            mergedCombinedOriginalIndices = mergedCombinedOriginalIndices.concat(dataRow._originalIndices);
        } else {
            mergedCombinedOriginalIndices.push(dataRow._originalIndex);
        }

        mergedOrderQuantity += dataRow['Order Quantity'];
        mergedWashReceived += dataRow[' Total Wash Received '];
        mergedWashBalance += dataRow[' Wash Balance From Received '];
        mergedFirstWashQty += (dataRow['1st Wash Qty'] || 0);
        mergedS_N.push(dataRow['S/N']); // Keep individual S/Ns for concatenation
        mergedWorkOrders.push(dataRow['Work Order No']);
        mergedPOColors.push(dataRow['Color']);
        mergedStyles.push(dataRow['Style Name']);
        mergedUnits.push(dataRow.Unit);
        mergedBuyers.push(dataRow.Buyer);

        if (index === 0) { // Take common data from the first data object
            firstRowData = {
                Factory: dataRow.Factory,
                Unit: dataRow.Unit,
                Buyer: dataRow.Buyer,
                StyleName: dataRow['Style Name'],
                TOD: dataRow.TOD,
                Marks: dataRow.Marks,
            };
        }
    });

    // Ensure concatenated strings for S/N, Work Order, PO/Color are unique and sorted if desired
    const uniqueSN = [...new Set(mergedS_N)].join(', ');
    const uniqueWorkOrders = [...new Set(mergedWorkOrders)].join(', ');
    const uniquePOColors = [...new Set(mergedPOColors)].join(', ');

    const newMergedData = {
        _merged: true,
        _originalIndices: mergedCombinedOriginalIndices, // Store all original indices
        'S/N': uniqueSN,
        'Factory': firstRowData.Factory,
        'Unit': mergedUnits,
        'Buyer': mergedBuyers,
        'Style Name': mergedStyles,
        'Color': uniquePOColors, // This will be the concatenated string for merged rows
        'Work Order No': uniqueWorkOrders, // This will be the concatenated string for merged rows
        'TOD': firstRowData.TOD,
        'Order Quantity': mergedOrderQuantity,
        ' Total Wash Received ': mergedWashReceived,
        ' Wash Balance From Received ': mergedWashBalance,
        'Marks': firstRowData.Marks,
        '1st Wash Qty': mergedFirstWashQty // The summed 1st wash quantity
    };

    // Update currentTableState: Remove selected items and insert the new merged item
    for (let i = 0; i < sortedIndicesToRemove.length; i++) {
        window.currentTableState.splice(sortedIndicesToRemove[i], 1);
    }
    // Insert the new merged data at the position of the first selected row
    window.currentTableState.splice(firstSelectedRowStateIndex, 0, newMergedData);

    // Re-populate the table with the updated currentTableState
    populateTable(window.currentTableState);
}

function unmergeSelectedRow() {
    const selectedRowsDOMElements = Array.from(document.querySelectorAll('#productionTableBody .row-checkbox:checked'))
        .map(checkbox => checkbox.closest('tr'));

    if (selectedRowsDOMElements.length !== 1 || !selectedRowsDOMElements[0].hasAttribute('data-merged')) {
        alert("Please select exactly one merged row to unmerge.");
        return;
    }

    const rowToUnmergeDOM = selectedRowsDOMElements[0];
    const originalIndicesAttr = rowToUnmergeDOM.getAttribute('data-original-indices');
    if (!originalIndicesAttr) {
        alert("This row cannot be unmerged as it does not contain original indices data.");
        return;
    }

    if (!confirm("Are you sure you want to unmerge this row?")) {
        return;
    }

    const originalIndices = JSON.parse(originalIndicesAttr);

    // Find the merged row in currentTableState and its index
    const mergedRowStateIndex = window.currentTableState.findIndex(stateRow =>
        stateRow._merged && JSON.stringify(stateRow._originalIndices) === JSON.stringify(originalIndices)
    );

    if (mergedRowStateIndex === -1) {
        console.error("Merged row not found in currentTableState.");
        return;
    }

    // Remove the merged row from currentTableState
    window.currentTableState.splice(mergedRowStateIndex, 1);

    // Get the original data objects for the unmerged rows
    const unmergedOriginalData = originalIndices.map(idx => window.originalTableData[idx]);

    // Sort the unmerged rows by their original S/N or another stable identifier
    // This ensures they are re-inserted in a consistent, predictable order.
    unmergedOriginalData.sort((a, b) => {
        // Assuming S/N is numerical or can be compared as strings
        const snA = parseInt(a['S/N']) || a['S/N'];
        const snB = parseInt(b['S/N']) || b['S/N'];
        if (typeof snA === 'number' && typeof snB === 'number') {
            return snA - snB;
        }
        return String(snA).localeCompare(String(snB));
    });

    // Insert the original rows back into currentTableState at the position where the merged row was
    window.currentTableState.splice(mergedRowStateIndex, 0, ...unmergedOriginalData);

    // Re-populate the table with the updated currentTableState
    populateTable(window.currentTableState);

    alert("Row unmerged successfully.");
}
