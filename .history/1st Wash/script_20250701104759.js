document.addEventListener("DOMContentLoaded", () => {
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
    
    const workOrderData = {
        "00059371": { batchNo: 1, firstWashQty: 0 },
        "00059372": { batchNo: 1, firstWashQty: 0 },
        "00059526": { batchNo: 1, firstWashQty: 0 },
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

    openBatchModalButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            currentActiveRow = event.target.closest('tr');
            const workOrder = currentActiveRow.getAttribute('data-work-order');
            const style = currentActiveRow.querySelector('[data-label="Style"]').textContent;
            const po = currentActiveRow.querySelector('[data-label="PO/Color"]').textContent;
            const processStep = '1st Wash';

            modalBatchWorkOrder.textContent = workOrder;
            modalBatchStyle.textContent = style;
            modalBatchPO.textContent = po;
            modalBatchNo.textContent = (workOrderData[workOrder]?.batchNo || 1) + ' ';
            generateQRCode(workOrder, style, po, processStep);

            openModal(batchCardModal);
        });
    });

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
        const workOrder = currentActiveRow.getAttribute('data-work-order');

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
});