$(document).ready(function() {
    $.getJSON('/dataTable.json', function(data) {
        let tableBody = '';

        data.forEach(item => {
            const firstDryInputQty = item["1st Dry Input Qty"] || 0;
            const processes = item["processes"] || [];  // Assuming an empty array if not specified
            tableBody += `
                <tr data-qty="${firstDryInputQty}" data-processes='${JSON.stringify(processes)}'>
                    <td>${item["S/N"]}</td>
                    <td>${item["Factory"]}</td>
                    <td>${item["Unit"]}</td>
                    <td>${item["Buyer"]}</td>
                    <td>${item["Style Name"]}</td>
                    <td>${item["FastReact No"]}</td>
                    <td>${item["Work Order No"]}</td>
                    <td>${item["Order Quantity"]}</td>
                    <td>${item[" Total Wash Received "]}</td>
                    <td>${item[" Total Wash Delivery "] || ''}</td>
                    <td>${item[" Wash Balance From Received "] || ''}</td>
                    <td>${item["Marks"]}</td>
                    <td>${firstDryInputQty}</td>
                    <td>
                        <button class="open-modal-btn bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-semibold tracking-wide">
                            1st Dry
                        </button>
                    </td>
                </tr>`;
        });

        $('#productionTableBody').html(tableBody);
        $('#productionTable').DataTable();

        $('#productionTableBody').on('click', '.open-modal-btn', function() {
            const row = $(this).closest('tr');
            
            // Populate modal content
            modalWorkOrder.textContent = row.find('td:eq(6)').text();
            modalStyleName.textContent = row.find('td:eq(4)').text();
            modalPOColor.textContent = row.find('td:eq(5)').text();

            const existingQty = parseInt(row.data('qty')) || 0;
            const existingProcesses = JSON.parse(row.attr('data-processes')) || [];

            dryProcessQty.value = existingQty;
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

        $('#closeModal').on('click', closeModal);
        $('#firstDryModal').on('click', (event) => {
            if (event.target === firstDryModal) {
                closeModal();
            }
        });

        processSelectCheckboxes = document.querySelectorAll('input[name="processSelect"]');
        saveModalData = document.getElementById('saveModalData');
    });
});

const firstDryModal = document.getElementById('firstDryModal');
const modalWorkOrder = document.getElementById('modalWorkOrder');
const modalStyleName = document.getElementById('modalStyleName');
const modalPOColor = document.getElementById('modalPOColor');
const dryProcessQty = document.getElementById('dryProcessQty');
let processSelectCheckboxes;
let saveModalData;
const selectedProcessCells = [
    document.getElementById('selectedProcess1st'),
    document.getElementById('selectedProcess2nd'),
    document.getElementById('selectedProcess3rd'),
    document.getElementById('selectedProcess4th'),
    document.getElementById('selectedProcess5th')
];

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

$('body').on('change', 'input[name="processSelect"]', function() {
    const processValue = this.value;

    if (this.checked) {
        if (!currentSelectedProcessOrder.includes(processValue)) {
            currentSelectedProcessOrder.push(processValue);
        }
    } else {
        currentSelectedProcessOrder = currentSelectedProcessOrder.filter(item => item !== processValue);
    }
    updateSelectedProcessesDisplay();
});

$('body').on('click', '#saveModalData', function() {
    const workOrder = modalWorkOrder.textContent;
    const newQty = parseInt(dryProcessQty.value) || 0;

    const tableRow = Array.from(document.querySelectorAll('#productionTableBody tr')).find(row => {
        return row.cells[6].textContent === workOrder;
    });

    if (tableRow) {
        const existingQty = parseInt(tableRow.getAttribute('data-qty')) || 0;
        const updatedQty = existingQty + newQty;
        tableRow.setAttribute('data-qty', updatedQty);
        tableRow.setAttribute('data-processes', JSON.stringify(currentSelectedProcessOrder));

        const qtyCell = tableRow.cells[12];
        qtyCell.textContent = updatedQty;

        closeModal();
    } else {
        console.error('Matching work order not found!');
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // Toggle Sidebar
    const toggleBtn = document.getElementById('toggleSidebar');
    const appContainer = document.getElementById('appContainer');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    // Initialize sidebar state
    function initSidebar() {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        
        if (isCollapsed) {
            appContainer.classList.add('sidebar-collapsed');
            sidebar.classList.remove('w-sidebar-expanded');
            sidebar.classList.add('w-sidebar-collapsed');
            mainContent.classList.remove('ml-sidebar-expanded');
            mainContent.classList.add('ml-sidebar-collapsed');
        }
    }
    
    // Toggle sidebar function
    function toggleSidebar() {
        appContainer.classList.toggle('sidebar-collapsed');
        
        if (sidebar.classList.contains('w-sidebar-expanded')) {
            sidebar.classList.remove('w-sidebar-expanded');
            sidebar.classList.add('w-sidebar-collapsed');
            mainContent.classList.remove('ml-sidebar-expanded');
            mainContent.classList.add('ml-sidebar-collapsed');
        } else {
            sidebar.classList.remove('w-sidebar-collapsed');
            sidebar.classList.add('w-sidebar-expanded');
            mainContent.classList.remove('ml-sidebar-collapsed');
            mainContent.classList.add('ml-sidebar-expanded');
        }
        
        // Save state to localStorage
        const isCollapsed = appContainer.classList.contains('sidebar-collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
    
    // Event listeners
    toggleBtn.addEventListener('click', toggleSidebar);
    
    // Highlight active navigation item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#sidebar li').forEach(item => {
        const link = item.querySelector('a');
        const href = link.getAttribute('href').split('/').pop();
        item.classList.toggle('bg-secondary', href === currentPage);
    });
    
    // Initialize
    initSidebar();
    
    // Settings modal (placeholder)
    document.querySelectorAll('a[href="#settings"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Settings modal would open here');
        });
    });
    
    // Logout functionality (placeholder)
    document.querySelectorAll('a[href="#logout"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = 'login.html';
            }
        });
    });
});