<script>
        const firstDryModal = document.getElementById('firstDryModal');
        const closeModalBtn = document.getElementById('closeModal');
        const openModalButtons = document.querySelectorAll('.open-modal-btn');

        // Modal content elements
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

        // Array to store the order of selected processes
        let currentSelectedProcessOrder = [];

        function openModal() {
            firstDryModal.classList.remove('hidden');
            setTimeout(() => {
                firstDryModal.classList.remove('opacity-0');
                firstDryModal.querySelector('div').classList.remove('scale-95');
                firstDryModal.querySelector('div').classList.add('scale-100');
            }, 10); // Small delay for transition
        }

        function closeModal() {
            firstDryModal.classList.add('opacity-0');
            firstDryModal.querySelector('div').classList.remove('scale-100');
            firstDryModal.querySelector('div').classList.add('scale-95');
            setTimeout(() => {
                firstDryModal.classList.add('hidden');
                // Reset modal state when closed
                resetSelectedProcesses();
                resetProcessCheckboxes();
                dryProcessQty.value = ''; // Clear quantity input
                currentSelectedProcessOrder = []; // Clear the order array
            }, 300); // Wait for transition to finish
        }

        // Event listener for opening the modal
        openModalButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const row = event.target.closest('tr'); // Get the parent row of the clicked button

                // Extract data using data-label attributes
                modalWorkOrder.textContent = row.querySelector('[data-label="Work Order"]').textContent;
                modalStyleName.textContent = row.querySelector('[data-label="Style"]').textContent;
                modalPOColor.textContent = row.querySelector('[data-label="PO/Color"]').textContent;
                
                // For the "1st Dry Input Qty" to populate the input field
                dryProcessQty.value = row.querySelector('[data-label="1st Dry Input Qty"]').textContent.trim() || '';

                // Reset for a new modal opening
                resetSelectedProcesses();
                resetProcessCheckboxes();
                currentSelectedProcessOrder = []; // Ensure it's empty for a new interaction

                // NO HARDCODED LOGIC HERE FOR INITIAL SELECTION
                // If you want to load *saved* selections, that logic would go here,
                // populating `currentSelectedProcessOrder` based on loaded data,
                // and then checking the respective checkboxes and calling `updateSelectedProcessesDisplay()`.

                openModal();
            });
        });

        // Event listener for closing the modal
        closeModalBtn.addEventListener('click', closeModal);

        // Close modal when clicking outside of it
        firstDryModal.addEventListener('click', (event) => {
            if (event.target === firstDryModal) {
                closeModal();
            }
        });

        // Function to update selected processes based on checkbox selection order
        processSelectCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (event) => {
                const processValue = event.target.value;

                if (event.target.checked) {
                    // Add to array only if not already present (prevents duplicates if clicked multiple times quickly)
                    if (!currentSelectedProcessOrder.includes(processValue)) {
                        currentSelectedProcessOrder.push(processValue);
                    }
                } else {
                    // Remove from array if unchecked
                    currentSelectedProcessOrder = currentSelectedProcessOrder.filter(item => item !== processValue);
                }
                updateSelectedProcessesDisplay(); // Call a dedicated function to update display
            });
        });

        function updateSelectedProcessesDisplay() {
            // Clear all display cells first
            selectedProcessCells.forEach(cell => cell.textContent = '');

            // Populate cells based on the order in currentSelectedProcessOrder
            currentSelectedProcessOrder.slice(0, 5).forEach((process, index) => {
                if (index < selectedProcessCells.length) {
                    selectedProcessCells[index].textContent = process;
                }
            });
            
            // If there are more than 5 processes, you could add an indicator
            // For example, in the 5th cell:
            if (currentSelectedProcessOrder.length > 5) {
                selectedProcessCells[4].textContent = currentSelectedProcessOrder[4] + ' (+' + (currentSelectedProcessOrder.length - 5) + ' more)';
            }
            // Or you could make the 5th cell dynamically show all remaining as a comma-separated list
            // selectedProcessCells[4].textContent = currentSelectedProcessOrder.slice(4).join(', ');
        }

        // This function is mainly for initial setup or clearing when modal opens/closes
        function resetSelectedProcesses() {
            selectedProcessCells.forEach(cell => {
                cell.textContent = '';
            });
            // If you had dynamic cells (from previous discussion), you'd remove them here too
            // document.querySelectorAll('.dynamic-process-cell').forEach(cell => cell.remove());
        }

        function resetProcessCheckboxes() {
            processSelectCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            // Clear the order tracking array
            currentSelectedProcessOrder = [];
        }
    // </script>