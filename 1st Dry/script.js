 const firstDryModal = document.getElementById('firstDryModal');
        const closeModalBtn = document.getElementById('closeModal');
        const openModalButtons = document.querySelectorAll('.open-modal-btn');
        const saveModalData = document.getElementById('saveModalData');

        const modalWorkOrder = document.getElementById('modalWorkOrder');
        const modalStyleName = document.getElementById('modalStyleName');
        const modalPOColor = document.getElementById('modalPOColor');
        const dryProcessQty = document.getElementById('dryProcessQty');
        const selectedProcessCells = [
            document.getElementById('selectedProcess1st'),
            document.getElementById('selectedProcess2nd'),
            document.getElementById('selectedProcess3rd'),
            document.getElementById('selectedProcess4th'),
            document.getElementById('selectedProcess5th')
        ];
        const processSelectCheckboxes = document.querySelectorAll('input[name="processSelect"]');

        let currentSelectedProcessOrder = [];

        function openModal() {
            firstDryModal.classList.remove('hidden');
            setTimeout(() => {
                firstDryModal.classList.remove('opacity-0');
                firstDryModal.querySelector('div').classList.remove('scale-95');
                firstDryModal.querySelector('div').classList.add('scale-100');
            }, 10);
        }

        function closeModal() {
            firstDryModal.classList.add('opacity-0');
            firstDryModal.querySelector('div').classList.remove('scale-100');
            firstDryModal.querySelector('div').classList.add('scale-95');
            setTimeout(() => {
                firstDryModal.classList.add('hidden');
                resetSelectedProcesses();
                resetProcessCheckboxes();
                dryProcessQty.value = '';
                currentSelectedProcessOrder = [];
            }, 300);
        }

        openModalButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const row = event.target.closest('tr');

                modalWorkOrder.textContent = row.querySelector('[data-label="Work Order"]').textContent;
                modalStyleName.textContent = row.querySelector('[data-label="Style"]').textContent;
                modalPOColor.textContent = row.querySelector('[data-label="PO/Color"]').textContent;

                const existingQty = parseInt(row.getAttribute('data-qty')) || 0;
                const existingProcesses = JSON.parse(row.getAttribute('data-processes')) || [];

                dryProcessQty.value = '';

                resetSelectedProcesses();
                resetProcessCheckboxes();

                existingProcesses.forEach(process => {
                    currentSelectedProcessOrder.push(process);
                    const checkbox = Array.from(processSelectCheckboxes).find(cb => cb.value === process);
                    if (checkbox) checkbox.checked = true;
                });

                updateSelectedProcessesDisplay();
                openModal();
            });
        });

        closeModalBtn.addEventListener('click', closeModal);

        firstDryModal.addEventListener('click', (event) => {
            if (event.target === firstDryModal) {
                closeModal();
            }
        });

        processSelectCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const processValue = event.target.value;

                if (event.target.checked) {
                    if (!currentSelectedProcessOrder.includes(processValue)) {
                        currentSelectedProcessOrder.push(processValue);
                    }
                } else {
                    currentSelectedProcessOrder = currentSelectedProcessOrder.filter(item => item !== processValue);
                }
                updateSelectedProcessesDisplay();
            });
        });

        function updateSelectedProcessesDisplay() {
            selectedProcessCells.forEach(cell => cell.textContent = '');

            currentSelectedProcessOrder.slice(0, 5).forEach((process, index) => {
                if (index < selectedProcessCells.length) {
                    selectedProcessCells[index].textContent = process;
                }
            });
            if (currentSelectedProcessOrder.length > 5) {
                selectedProcessCells[4].textContent = currentSelectedProcessOrder[4] + ' (+' + (currentSelectedProcessOrder.length - 5) + ' more)';
            }
        }

        function resetSelectedProcesses() {
            selectedProcessCells.forEach(cell => {
                cell.textContent = '';
            });
        }

        function resetProcessCheckboxes() {
            processSelectCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            currentSelectedProcessOrder = [];
        }

        saveModalData.addEventListener('click', () => {
            const workOrder = modalWorkOrder.textContent;
            const newQty = parseInt(dryProcessQty.value) || 0;

            const tableRow = Array.from(document.querySelectorAll('#productionTableBody tr')).find(row => {
                return row.querySelector('[data-label="Work Order"]').textContent === workOrder;
            });

            if (tableRow) {
                const existingQty = parseInt(tableRow.getAttribute('data-qty')) || 0;
                const updatedQty = existingQty + newQty;
                tableRow.setAttribute('data-qty', updatedQty);
                tableRow.setAttribute('data-processes', JSON.stringify(currentSelectedProcessOrder));

                const qtyCell = tableRow.querySelector('[data-label="1st Dry Input Qty"]');
                qtyCell.textContent = updatedQty;

                closeModal();
            } else {
                console.error('Matching work order not found!');
            }
        });