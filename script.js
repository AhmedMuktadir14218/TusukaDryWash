function initSidebarAndMain() {
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
}
// Call the initializer only after sidebar is loaded
initSidebarAndMain();