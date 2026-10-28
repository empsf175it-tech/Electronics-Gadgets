/**
 * VOLTARIS OPERATIONAL DASHBOARD CONTROLLER (dashboard.js)
 * SPA Hash Routing, Inventory Management (CRUD, Search, Sort, Pagination),
 * Role-Based Access Enforcement, Live Telemetry, and Export Handlers.
 */

import { requireAuth, logout, getSession, hasPermission, getPermissions, updateRolePermission } from './auth.js';
import { 
  renderDashboardRevenueChart, 
  renderDashboardCategoryDonut, 
  renderAnalyticsComparisonChart, 
  renderSparkline 
} from './charts.js';
import { exportToCSV, exportToExcel, exportToPDF } from './export.js';
import { initTilt } from './tilt.js';

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentSort = { field: 'name', dir: 'asc' };
let editingProductId = null;

// Active chart instances to prevent re-creation leaks
let revenueChartInstance = null;
let categoryDonutInstance = null;
let analyticsCompareInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  const session = requireAuth();
  if (!session) return;

  setupUserInterface(session);
  setupSidebarToggle();
  await loadDashboardData();
  setupRouting();
  setupInventoryListeners();
  setupReportListeners();
  setupRoleListeners();
  setupSettingsListeners();
  initTilt();
  startLiveTelemetryTicker();
  initScrollUp();
});

/**
 * Populate user avatar, name, and role badge across the dashboard shell
 */
function setupUserInterface(session) {
  const nameElems = document.querySelectorAll('.user-name');
  const roleElems = document.querySelectorAll('.user-role-tag');
  const avatarElems = document.querySelectorAll('.user-avatar');

  nameElems.forEach(el => el.textContent = session.name);
  roleElems.forEach(el => el.textContent = session.role);
  avatarElems.forEach(el => el.textContent = session.avatar || session.name.substring(0, 2).toUpperCase());

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Enforce role-based element visibility
  enforceRoleRestrictions();
}

/**
 * Tablet & Mobile Hamburger Navigation Drawer for Dashboard Options
 */
function setupSidebarToggle() {
  const toggleBtn = document.getElementById('dashSidebarToggle');
  const sidebar = document.getElementById('dashSidebar');
  const backdrop = document.getElementById('dashSidebarBackdrop');
  const closeBtn = document.getElementById('dashSidebarClose');

  if (!toggleBtn || !sidebar) return;

  const openSidebar = () => {
    sidebar.classList.add('open');
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    if (backdrop) backdrop.classList.add('active');
    document.body.classList.add('sidebar-drawer-open');
  };

  const closeSidebar = () => {
    sidebar.classList.remove('open');
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('sidebar-drawer-open');
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeSidebar();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeSidebar);
  }

  // Close drawer when any navigation option inside the sidebar is clicked
  sidebar.querySelectorAll('.sidebar-nav-item a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1024) {
        closeSidebar();
      }
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });
}

/**
 * Enforces role-based display rules
 */
function enforceRoleRestrictions() {
  const canManageInventory = hasPermission('manageInventory');
  const canExport = hasPermission('exportData');
  const canManageUsers = hasPermission('manageUsers');

  // Add Product Button
  const addProductBtn = document.getElementById('openAddProductModal');
  if (addProductBtn) {
    addProductBtn.style.display = canManageInventory ? 'inline-flex' : 'none';
  }

  // Export buttons
  const exportBtns = document.querySelectorAll('.btn-export-action');
  exportBtns.forEach(btn => {
    btn.style.display = canExport ? 'inline-flex' : 'none';
  });

  // User permission switches
  const permSwitches = document.querySelectorAll('.rbac-perm-switch');
  permSwitches.forEach(sw => {
    sw.disabled = !canManageUsers;
  });
}

/**
 * Fetch products and initialize dashboard data
 */
async function loadDashboardData() {
  try {
    const res = await fetch('assets/data/products.json');
    allProducts = await res.json();
    filteredProducts = [...allProducts];
    renderInventoryTable();
    updateOverviewStats();
    renderLowStockAlerts();
    renderHealthGauge(94.8);
  } catch (err) {
    console.error('Failed to load products.json:', err);
  }
}

/**
 * SPA Hash Routing: #overview, #inventory, #analytics, #reports, #users, #settings
 */
function setupRouting() {
  const views = ['overview', 'inventory', 'analytics', 'reports', 'users', 'settings'];

  const handleRoute = () => {
    const hash = window.location.hash.replace('#', '') || 'overview';
    const activeView = views.includes(hash) ? hash : 'overview';

    // Role gate check
    const session = getSession();
    if (session && session.role === 'Viewer') {
      if (['inventory', 'analytics', 'reports', 'users'].includes(activeView)) {
        alert('Viewer Role Notice: Your account has read-only access limited to Overview.');
        window.location.hash = '#overview';
        return;
      }
    }

    // Toggle view elements
    document.querySelectorAll('.dash-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${activeView}`);
    });

    // Toggle sidebar active item
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      const link = item.querySelector('a');
      const href = link ? link.getAttribute('href') : '';
      item.classList.toggle('active', href === `#${activeView}`);
    });

    // Toggle mobile bottom bar
    document.querySelectorAll('.bottom-tab-item').forEach(item => {
      const href = item.getAttribute('href');
      item.classList.toggle('active', href === `#${activeView}`);
    });

    // Update Topbar Breadcrumb
    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = activeView.toUpperCase();
    }

    // Render charts on demand
    if (activeView === 'overview') {
      if (!revenueChartInstance) {
        revenueChartInstance = renderDashboardRevenueChart('dashRevenueChart');
      }
      if (!categoryDonutInstance) {
        categoryDonutInstance = renderDashboardCategoryDonut('dashCategoryDonut');
      }
    } else if (activeView === 'analytics') {
      if (!analyticsCompareInstance) {
        analyticsCompareInstance = renderAnalyticsComparisonChart('analyticsCompareChart');
      }
    }
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

/**
 * Update Overview View KPI cards and indicators
 */
function updateOverviewStats() {
  const totalStock = allProducts.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = allProducts.filter(p => p.status === 'Low Stock' || p.stock <= p.minStock).length;
  const totalValuation = allProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);

  const stockEl = document.getElementById('kpiTotalStock');
  const lowStockEl = document.getElementById('kpiLowStockCount');
  const valEl = document.getElementById('kpiValuation');

  if (stockEl) stockEl.textContent = totalStock.toLocaleString();
  if (lowStockEl) lowStockEl.textContent = lowStockCount;
  if (valEl) valEl.textContent = `$${(totalValuation / 1000).toFixed(1)}k`;

  // Sparklines
  renderSparkline('sparkline1', [12, 19, 15, 25, 22, 30], '#C6FF3D');
  renderSparkline('sparkline2', [45, 52, 48, 60, 58, 71], '#22E5FF');
  renderSparkline('sparkline3', [8, 12, 6, 14, 11, 4], '#FFB020');
  renderSparkline('sparkline4', [98, 97, 99, 98.5, 99.2, 99.4], '#8B5CFF');
}

/**
 * Render Low Stock Alerts Widget in Overview
 */
function renderLowStockAlerts() {
  const container = document.getElementById('lowStockAlertsList');
  if (!container) return;

  const lowItems = allProducts
    .filter(p => p.status === 'Low Stock' || p.stock <= p.minStock)
    .slice(0, 5);

  container.innerHTML = lowItems.map(p => `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem 0; border-bottom:1px solid var(--border-line);">
      <div>
        <div style="font-weight:600; color:var(--text-pure); font-size:0.875rem;">${p.name}</div>
        <div style="font-size:0.75rem; color:var(--muted); font-family:var(--font-mono);">${p.sku} • ${p.warehouse}</div>
      </div>
      <div style="text-align:right;">
        <span class="status-chip low-stock">${p.stock} left</span>
      </div>
    </div>
  `).join('');
}

/**
 * Animated Device Health Gauge (SVG circular stroke)
 */
function renderHealthGauge(score) {
  const strokeCircle = document.getElementById('healthGaugeCircle');
  const textVal = document.getElementById('healthGaugeValue');
  if (strokeCircle) {
    const circumference = 2 * Math.PI * 45; // r=45
    const offset = circumference - (score / 100) * circumference;
    strokeCircle.style.strokeDashoffset = offset;
  }
  if (textVal) {
    textVal.textContent = `${score}%`;
  }
}

/**
 * INVENTORY TABLE CONTROLLER
 */
function renderInventoryTable() {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const canManage = hasPermission('manageInventory');
  const canDelete = hasPermission('deleteInventory');

  if (paginated.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:2rem; color:var(--muted);">No matching gadgets found.</td></tr>`;
    return;
  }

  tbody.innerHTML = paginated.map(p => {
    let chipClass = 'in-stock';
    if (p.status === 'Low Stock' || (p.stock > 0 && p.stock <= p.minStock)) chipClass = 'low-stock';
    if (p.status === 'Out of Stock' || p.stock === 0) chipClass = 'out-stock';

    const stockPercent = Math.min(100, Math.round((p.stock / (p.minStock * 4 || 40)) * 100));

    return `
      <tr>
        <td><input type="checkbox" class="product-row-select" data-id="${p.id}"></td>
        <td style="font-family:var(--font-mono); font-size:0.8125rem; color:var(--signal);">${p.sku}</td>
        <td style="font-weight:600; color:var(--text-pure);">${p.name}</td>
        <td><span style="font-size:0.75rem; background:rgba(34,229,255,0.08); padding:0.2rem 0.5rem; border-radius:4px; color:var(--signal);">${p.category}</span></td>
        <td>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-family:var(--font-mono); font-weight:700;">${p.stock}</span>
            <div style="width:50px; height:4px; background:rgba(34,229,255,0.15); border-radius:2px; overflow:hidden;">
              <div style="width:${stockPercent}%; height:100%; background:${chipClass === 'out-stock' ? 'var(--flare)' : (chipClass === 'low-stock' ? 'var(--amber)' : 'var(--volt)')};"></div>
            </div>
          </div>
        </td>
        <td style="font-family:var(--font-mono);">$${p.price.toFixed(2)}</td>
        <td style="font-family:var(--font-mono); color:var(--volt);">${p.margin.toFixed(1)}%</td>
        <td><span class="status-chip ${chipClass}">${p.status}</span></td>
        <td style="text-align:center;">
          <div class="row-actions-wrap">
            ${canManage ? `<button class="btn btn-ghost btn-sm btn-edit-product" data-id="${p.id}" title="Edit Product">Edit</button>` : ''}
            ${canDelete ? `<button class="btn btn-ghost btn-sm btn-delete-product" data-id="${p.id}" title="Delete Product">✕</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  updatePaginationControls();
}

/**
 * Table Pagination Bar
 */
function updatePaginationControls() {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const pageInfo = document.getElementById('inventoryPageInfo');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${filteredProducts.length} devices)`;
  }
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

/**
 * Setup Inventory Search, Filters, Sorting, and Modal CRUD
 */
function setupInventoryListeners() {
  // Search input
  const searchInput = document.getElementById('inventorySearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      filterInventory(q);
    });
  }

  // Category filter dropdown
  const catFilter = document.getElementById('inventoryCategoryFilter');
  if (catFilter) {
    catFilter.addEventListener('change', () => {
      const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      filterInventory(q);
    });
  }

  // Warehouse filter
  const whFilter = document.getElementById('inventoryWarehouseFilter');
  if (whFilter) {
    whFilter.addEventListener('change', () => {
      const q = searchInput ? searchInput.value.toLowerCase().trim() : '';
      filterInventory(q);
    });
  }

  // Pagination buttons
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderInventoryTable();
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderInventoryTable();
      }
    });
  }

  // Select all checkbox
  const selectAll = document.getElementById('selectAllProducts');
  if (selectAll) {
    selectAll.addEventListener('change', (e) => {
      const checkboxes = document.querySelectorAll('.product-row-select');
      checkboxes.forEach(cb => cb.checked = e.target.checked);
    });
  }

  // Add Product Modal open/close
  const openAddModal = document.getElementById('openAddProductModal');
  const addModal = document.getElementById('productFormModal');
  const closeAddModal = document.getElementById('closeProductModal');
  const productForm = document.getElementById('productCrudForm');

  if (openAddModal && addModal) {
    openAddModal.addEventListener('click', () => {
      editingProductId = null;
      document.getElementById('productModalTitle').textContent = 'Add New Electronics Gadget';
      productForm.reset();
      addModal.classList.add('active');
    });
  }

  if (closeAddModal && addModal) {
    closeAddModal.addEventListener('click', () => addModal.classList.remove('active'));
  }

  // Edit and Delete delegators
  const tbody = document.getElementById('inventoryTableBody');
  if (tbody) {
    tbody.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.btn-edit-product');
      const deleteBtn = e.target.closest('.btn-delete-product');

      if (editBtn) {
        const id = editBtn.dataset.id;
        openEditProduct(id);
      }
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        deleteProduct(id);
      }
    });
  }

  // Product CRUD Form submit
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProductFormData();
    });
  }

  // Export buttons
  const csvBtn = document.getElementById('exportInventoryCSV');
  const xlsBtn = document.getElementById('exportInventoryExcel');
  const pdfBtn = document.getElementById('exportInventoryPDF');

  if (csvBtn) csvBtn.addEventListener('click', () => exportToCSV(filteredProducts));
  if (xlsBtn) xlsBtn.addEventListener('click', () => exportToExcel(filteredProducts));
  if (pdfBtn) pdfBtn.addEventListener('click', () => exportToPDF('VOLTARIS Inventory Report'));
}

/**
 * Filters inventory by search string, category, and warehouse
 */
function filterInventory(searchQuery) {
  const catFilter = document.getElementById('inventoryCategoryFilter');
  const whFilter = document.getElementById('inventoryWarehouseFilter');

  const selectedCat = catFilter ? catFilter.value : 'All';
  const selectedWh = whFilter ? whFilter.value : 'All';

  filteredProducts = allProducts.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery) || 
      p.sku.toLowerCase().includes(searchQuery) ||
      (p.imei && p.imei.toLowerCase().includes(searchQuery));

    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    const matchesWh = selectedWh === 'All' || p.warehouse === selectedWh;

    return matchesSearch && matchesCat && matchesWh;
  });

  currentPage = 1;
  renderInventoryTable();
}

/**
 * Open Edit Product Modal with populated fields
 */
function openEditProduct(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  editingProductId = productId;
  document.getElementById('productModalTitle').textContent = `Edit Gadget: ${product.name}`;

  document.getElementById('inputGadgetName').value = product.name;
  document.getElementById('inputGadgetSKU').value = product.sku;
  document.getElementById('inputGadgetCategory').value = product.category;
  document.getElementById('inputGadgetPrice').value = product.price;
  document.getElementById('inputGadgetCost').value = product.costPrice;
  document.getElementById('inputGadgetStock').value = product.stock;
  document.getElementById('inputGadgetWarehouse').value = product.warehouse;

  document.getElementById('productFormModal').classList.add('active');
}

/**
 * Save new or edited product
 */
function saveProductFormData() {
  const name = document.getElementById('inputGadgetName').value.trim();
  const sku = document.getElementById('inputGadgetSKU').value.trim();
  const category = document.getElementById('inputGadgetCategory').value;
  const price = parseFloat(document.getElementById('inputGadgetPrice').value) || 0;
  const cost = parseFloat(document.getElementById('inputGadgetCost').value) || 0;
  const stock = parseInt(document.getElementById('inputGadgetStock').value, 10) || 0;
  const warehouse = document.getElementById('inputGadgetWarehouse').value;

  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
  let status = 'In Stock';
  if (stock === 0) status = 'Out of Stock';
  else if (stock < 15) status = 'Low Stock';

  if (editingProductId) {
    const idx = allProducts.findIndex(p => p.id === editingProductId);
    if (idx !== -1) {
      allProducts[idx] = {
        ...allProducts[idx],
        name, sku, category, price, costPrice: cost, stock, warehouse, margin, status
      };
    }
  } else {
    const newId = `PRD-${Date.now().toString().slice(-4)}`;
    allProducts.unshift({
      id: newId,
      sku: sku || `VLT-GEN-${Math.floor(Math.random() * 900 + 100)}`,
      name,
      category,
      price,
      costPrice: cost,
      stock,
      minStock: 15,
      margin,
      status,
      serial: `SN-GEN${Date.now().toString().slice(-6)}`,
      imei: `86419206${Math.floor(Math.random() * 9000000 + 1000000)}`,
      warrantyMonths: 24,
      warehouse,
      monthlySales: 0,
      rating: 5.0,
      lifecycleStage: 'New Launch'
    });
  }

  document.getElementById('productFormModal').classList.remove('active');
  filteredProducts = [...allProducts];
  renderInventoryTable();
  updateOverviewStats();
  renderLowStockAlerts();
}

/**
 * Delete a product
 */
function deleteProduct(productId) {
  if (!confirm(`Are you sure you want to remove device ${productId}?`)) return;

  allProducts = allProducts.filter(p => p.id !== productId);
  filteredProducts = filteredProducts.filter(p => p.id !== productId);
  renderInventoryTable();
  updateOverviewStats();
  renderLowStockAlerts();
}

/**
 * Setup Reports View listeners
 */
function setupReportListeners() {
  const exportAllBtn = document.getElementById('exportAllReportsBtn');
  if (exportAllBtn) {
    exportAllBtn.addEventListener('click', () => {
      exportToCSV(allProducts, 'voltaris-complete-audit.csv');
    });
  }

  const scheduleModal = document.getElementById('scheduleReportModal');
  const openScheduleBtn = document.getElementById('openScheduleModalBtn');
  const closeScheduleBtn = document.getElementById('closeScheduleModal');

  if (openScheduleBtn && scheduleModal) {
    openScheduleBtn.addEventListener('click', () => scheduleModal.classList.add('active'));
  }
  if (closeScheduleBtn && scheduleModal) {
    closeScheduleBtn.addEventListener('click', () => scheduleModal.classList.remove('active'));
  }

  const scheduleForm = document.getElementById('scheduleReportForm');
  if (scheduleForm) {
    scheduleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Scheduled Report successfully registered! Dispatches will be sent automatically.');
      scheduleModal.classList.remove('active');
    });
  }
}

/**
 * Setup Users & RBAC Matrix toggle listeners
 */
function setupRoleListeners() {
  const switches = document.querySelectorAll('.rbac-perm-switch');
  switches.forEach(sw => {
    sw.addEventListener('change', (e) => {
      const role = e.target.dataset.role;
      const permKey = e.target.dataset.perm;
      const isAllowed = e.target.checked;
      updateRolePermission(role, permKey, isAllowed);
      enforceRoleRestrictions();
    });
  });
}

/**
 * Setup Settings View Listeners (API key reveal, profile, notifications)
 */
function setupSettingsListeners() {
  const apiKeyInput = document.getElementById('apiKeyField');
  const revealKeyBtn = document.getElementById('revealApiKeyBtn');

  if (revealKeyBtn && apiKeyInput) {
    revealKeyBtn.addEventListener('click', () => {
      if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        revealKeyBtn.textContent = 'Hide';
      } else {
        apiKeyInput.type = 'password';
        revealKeyBtn.textContent = 'Reveal';
      }
    });
  }
}

/**
 * Simulated Live Telemetry Ticker
 */
function startLiveTelemetryTicker() {
  setInterval(() => {
    const livePill = document.querySelector('.mock-live-pill');
    if (livePill) {
      const jitter = (Math.random() * 0.4 - 0.2).toFixed(1);
      const currentHealth = 94.8 + parseFloat(jitter);
      renderHealthGauge(parseFloat(currentHealth.toFixed(1)));
    }
  }, 4000);
}

/**
 * Scroll Up (Back to Top) Controller
 */
function initScrollUp() {
  let scrollBtn = document.getElementById('scrollUpBtn');
  if (!scrollBtn) {
    scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollUpBtn';
    scrollBtn.className = 'scroll-up-btn';
    scrollBtn.type = 'button';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
    document.body.appendChild(scrollBtn);
  }

  const toggleVisibility = () => {
    if (window.scrollY > 280) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
