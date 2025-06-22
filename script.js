// DOM Elements
const stateSelect = document.getElementById('stateSelect');
const districtSelect = document.getElementById('districtSelect');
const searchInput = document.getElementById('searchInput');
const rationTable = document.getElementById('rationTable');
const rationTableBody = document.getElementById('rationTableBody');
const loadingState = document.getElementById('loadingState');
const noStateState = document.getElementById('noStateState');
const noItemsState = document.getElementById('noItemsState');
const tableContainer = document.getElementById('tableContainer');
const lastUpdated = document.getElementById('lastUpdated');
const exportButton = document.getElementById('exportButton');
const printButton = document.getElementById('printButton');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// App State
let states = [];
let districts = [];
let rationItems = [];
let filteredItems = [];
let selectedState = '';
let selectedDistrict = '';
let searchTerm = '';
let darkMode = false;

// Initialize App
function initApp() {
    // Load theme preference
    loadTheme();
    
    // Add event listeners
    stateSelect.addEventListener('change', handleStateChange);
    districtSelect.addEventListener('change', handleDistrictChange);
    searchInput.addEventListener('input', handleSearch);
    exportButton.addEventListener('click', exportToPdf);
    printButton.addEventListener('click', handlePrint);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Load states
    fetchStates();
}

// Theme Management
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        darkMode = true;
        document.body.classList.add('dark-theme');
        themeIcon.className = 'ri-sun-line';
    } else {
        darkMode = false;
        document.body.classList.remove('dark-theme');
        themeIcon.className = 'ri-moon-line';
    }
}

function toggleTheme() {
    darkMode = !darkMode;
    
    if (darkMode) {
        document.body.classList.add('dark-theme');
        themeIcon.className = 'ri-sun-line';
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-theme');
        themeIcon.className = 'ri-moon-line';
        localStorage.setItem('theme', 'light');
    }
}

// API Data Fetching
function fetchStates() {
    showLoading();
    
    // Sample data - in a real app, this would be an API call
    setTimeout(() => {
        states = [
            { value: 'andhra-pradesh', label: 'Andhra Pradesh' },
            { value: 'assam', label: 'Assam' },
            { value: 'bihar', label: 'Bihar' },
            { value: 'delhi', label: 'Delhi' },
            { value: 'gujarat', label: 'Gujarat' },
            { value: 'karnataka', label: 'Karnataka' },
            { value: 'kerala', label: 'Kerala' },
            { value: 'maharashtra', label: 'Maharashtra' },
            { value: 'tamil-nadu', label: 'Tamil Nadu' },
            { value: 'uttar-pradesh', label: 'Uttar Pradesh' },
            { value: 'west-bengal', label: 'West Bengal' }
        ];
        
        populateStates();
        hideLoading();
    }, 500);
}

function fetchDistricts(state) {
    districtSelect.disabled = true;
    
    if (!state) {
        districts = [];
        populateDistricts();
        return;
    }
    
    // Sample data - in a real app, this would be an API call
    setTimeout(() => {
        const districtMap = {
            'andhra-pradesh': ['Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna'],
            'assam': ['Baksa', 'Barpeta', 'Biswanath', 'Cachar', 'Darrang'],
            'bihar': ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai'],
            'delhi': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi'],
            'gujarat': ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha'],
            'karnataka': ['Bagalkot', 'Bangalore Rural', 'Bangalore Urban', 'Belgaum', 'Bellary'],
            'kerala': ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod'],
            'maharashtra': ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed'],
            'tamil-nadu': ['Ariyalur', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri'],
            'uttar-pradesh': ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi'],
            'west-bengal': ['Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur']
        };
        
        const stateDistricts = districtMap[state] || [];
        districts = stateDistricts.map(name => ({
            value: name.toLowerCase().replace(/\s+/g, '-'),
            label: name
        }));
        
        populateDistricts();
        districtSelect.disabled = false;
    }, 300);
}

function fetchRationItems(state, district) {
    if (!state) {
        rationItems = [];
        updateRationDisplay();
        return;
    }
    
    showLoading();
    
    // Sample data - in a real app, this would be an API call
    setTimeout(() => {
        const now = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        rationItems = generateRationItems(state, now, lastWeek, twoWeeksAgo);
        updateRationDisplay();
        hideLoading();
    }, 800);
}

function generateRationItems(state, now, lastWeek, twoWeeksAgo) {
    // Price variations based on state
    const priceMultiplier = {
        'delhi': 1.0,
        'maharashtra': 1.1,
        'kerala': 0.9,
        'tamil-nadu': 0.95,
        'andhra-pradesh': 0.85,
        'gujarat': 1.05,
        'karnataka': 1.0,
        'uttar-pradesh': 0.8,
        'west-bengal': 0.9,
        'assam': 1.15,
        'bihar': 0.85
    }[state] || 1.0;
    
    // Base prices 
    const baseItems = [
        { 
            id: 1,
            name: 'Rice', 
            variety: 'Common', 
            category: 'Essential', 
            basePrice: 3,
            unitPrice: 'per kg',
            limit: '5 kg per person', 
            updatedAt: now,
            icon: 'ri-seedling-line',
            bgColor: 'rgba(59, 130, 246, 0.1)',
            iconColor: 'var(--primary-color)' 
        },
        { 
            id: 2,
            name: 'Wheat', 
            variety: 'Grade A', 
            category: 'Essential', 
            basePrice: 2,
            unitPrice: 'per kg',
            limit: '5 kg per person', 
            updatedAt: now,
            icon: 'ri-plant-line',
            bgColor: 'rgba(245, 158, 11, 0.1)',
            iconColor: 'var(--warning-color)' 
        },
        { 
            id: 3,
            name: 'Sugar', 
            variety: 'White', 
            category: 'Regular', 
            basePrice: 19,
            unitPrice: 'per kg',
            limit: '0.5 kg per person', 
            updatedAt: lastWeek,
            icon: 'ri-cake-2-line',
            bgColor: 'rgba(236, 72, 153, 0.1)',
            iconColor: '#EC4899' 
        },
        { 
            id: 4,
            name: 'Oil', 
            variety: 'Palm', 
            category: 'Regular', 
            basePrice: 24,
            unitPrice: 'per liter',
            limit: '1 L per family', 
            updatedAt: lastWeek,
            icon: 'ri-drop-line',
            bgColor: 'rgba(239, 68, 68, 0.1)',
            iconColor: 'var(--danger-color)' 
        },
        { 
            id: 5,
            name: 'Dal', 
            variety: 'Toor', 
            category: 'Regular', 
            basePrice: 34,
            unitPrice: 'per kg',
            limit: '1 kg per family', 
            updatedAt: twoWeeksAgo,
            icon: 'ri-medicine-bottle-line',
            bgColor: 'rgba(139, 92, 246, 0.1)',
            iconColor: '#8B5CF6' 
        },
        { 
            id: 6,
            name: 'Salt', 
            variety: 'Iodized', 
            category: 'Essential', 
            basePrice: 4,
            unitPrice: 'per kg',
            limit: '1 kg per family', 
            updatedAt: twoWeeksAgo,
            icon: 'ri-water-flash-line',
            bgColor: 'rgba(59, 130, 246, 0.1)',
            iconColor: 'var(--primary-color)' 
        },
        { 
            id: 7,
            name: 'Kerosene', 
            variety: 'Standard', 
            category: 'Fuel', 
            basePrice: 14,
            unitPrice: 'per liter',
            limit: '3 L per family', 
            updatedAt: twoWeeksAgo,
            icon: 'ri-fire-line',
            bgColor: 'rgba(245, 158, 11, 0.1)',
            iconColor: 'var(--warning-color)' 
        }
    ];
    
    // Apply price variations
    return baseItems.map(item => {
        const adjustedPrice = Math.round(item.basePrice * priceMultiplier * 10) / 10;
        const priceText = `₹${adjustedPrice}/${item.unitPrice.includes('kg') ? 'kg' : 'L'}`;
        
        return {
            ...item,
            price: priceText,
            updated: formatDate(item.updatedAt)
        };
    });
}

// UI Update Functions
function populateStates() {
    // Clear current options except placeholder
    while (stateSelect.options.length > 1) {
        stateSelect.remove(1);
    }
    
    // Add state options
    states.forEach(state => {
        const option = document.createElement('option');
        option.value = state.value;
        option.textContent = state.label;
        stateSelect.appendChild(option);
    });
}

function populateDistricts() {
    // Clear current options except placeholder
    while (districtSelect.options.length > 1) {
        districtSelect.remove(1);
    }
    
    // Add district options
    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district.value;
        option.textContent = district.label;
        districtSelect.appendChild(option);
    });
    
    // Reset selection
    districtSelect.selectedIndex = 0;
    selectedDistrict = '';
}

function updateRationDisplay() {
    // Apply search filter
    filterItems();
    
    // Check if there are items to display
    if (!selectedState) {
        // No state selected
        showNoState();
    } else if (filteredItems.length === 0) {
        // No items found
        showNoItems();
    } else {
        // Show items
        populateRationTable();
        showTable();
        
        // Update last updated date
        if (filteredItems.length > 0) {
            lastUpdated.textContent = `Last Updated: ${filteredItems[0].updated}`;
        }
    }
}

function populateRationTable() {
    // Clear current table rows
    rationTableBody.innerHTML = '';
    
    // Add rows for each item
    filteredItems.forEach(item => {
        const row = document.createElement('tr');
        
        // Item cell
        const itemCell = document.createElement('td');
        const itemInfo = document.createElement('div');
        itemInfo.className = 'item-info';
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'item-icon';
        iconDiv.style.backgroundColor = item.bgColor;
        
        const icon = document.createElement('i');
        icon.className = item.icon;
        icon.style.color = item.iconColor;
        
        const itemDetails = document.createElement('div');
        itemDetails.className = 'item-details';
        
        const itemName = document.createElement('h4');
        itemName.textContent = item.name;
        
        const itemVariety = document.createElement('div');
        itemVariety.className = 'variety';
        itemVariety.textContent = item.variety;
        
        iconDiv.appendChild(icon);
        itemDetails.appendChild(itemName);
        itemDetails.appendChild(itemVariety);
        itemInfo.appendChild(iconDiv);
        itemInfo.appendChild(itemDetails);
        itemCell.appendChild(itemInfo);
        
        // Category cell
        const categoryCell = document.createElement('td');
        const categoryBadge = document.createElement('span');
        categoryBadge.className = `category-badge category-${item.category.toLowerCase()}`;
        categoryBadge.textContent = item.category;
        categoryCell.appendChild(categoryBadge);
        
        // Price cell
        const priceCell = document.createElement('td');
        priceCell.textContent = item.price;
        
        // Limit cell
        const limitCell = document.createElement('td');
        limitCell.textContent = item.limit;
        
        // Updated cell
        const updatedCell = document.createElement('td');
        updatedCell.textContent = item.updated;
        updatedCell.style.color = 'var(--text-color-light)';
        
        // Add cells to row
        row.appendChild(itemCell);
        row.appendChild(categoryCell);
        row.appendChild(priceCell);
        row.appendChild(limitCell);
        row.appendChild(updatedCell);
        
        // Add row to table
        rationTableBody.appendChild(row);
    });
}

function filterItems() {
    if (!searchTerm) {
        filteredItems = [...rationItems];
        return;
    }
    
    const term = searchTerm.toLowerCase();
    filteredItems = rationItems.filter(item => 
        item.name.toLowerCase().includes(term) ||
        item.variety.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term)
    );
}

// Event Handlers
function handleStateChange() {
    selectedState = stateSelect.value;
    fetchDistricts(selectedState);
    fetchRationItems(selectedState, selectedDistrict);
}

function handleDistrictChange() {
    selectedDistrict = districtSelect.value;
    fetchRationItems(selectedState, selectedDistrict);
}

function handleSearch(e) {
    searchTerm = e.target.value;
    updateRationDisplay();
}

function handlePrint() {
    window.print();
}

// Loading States
function showLoading() {
    loadingState.classList.remove('hidden');
    noStateState.classList.add('hidden');
    noItemsState.classList.add('hidden');
    tableContainer.classList.add('hidden');
}

function hideLoading() {
    loadingState.classList.add('hidden');
}

function showNoState() {
    noStateState.classList.remove('hidden');
    noItemsState.classList.add('hidden');
    tableContainer.classList.add('hidden');
}

function showNoItems() {
    noStateState.classList.add('hidden');
    noItemsState.classList.remove('hidden');
    tableContainer.classList.add('hidden');
}

function showTable() {
    noStateState.classList.add('hidden');
    noItemsState.classList.add('hidden');
    tableContainer.classList.remove('hidden');
}

// Utility Functions
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// PDF Export
function exportToPdf() {
    if (!selectedState || filteredItems.length === 0) {
        alert('Please select a state and ensure there are ration items to export.');
        return;
    }
    
    // Create new PDF document
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Ration Price List', 14, 20);
    
    // Add current date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Get state and district information
    const stateName = stateSelect.options[stateSelect.selectedIndex].text;
    const districtName = selectedDistrict ? districtSelect.options[districtSelect.selectedIndex].text : 'All Districts';
    
    // Add location information
    doc.setFontSize(12);
    doc.text(`State: ${stateName}`, 14, 40);
    doc.text(`District: ${districtName}`, 14, 47);
    
    // Prepare table data
    const tableData = filteredItems.map(item => [
        `${item.name} (${item.variety})`,
        item.category,
        item.price,
        item.limit,
        item.updated
    ]);
    
    // Define table headers
    const headers = [['Item', 'Category', 'Unit Price', 'Monthly Limit', 'Last Updated']];
    
    // Generate table
    doc.autoTable({
        head: headers,
        body: tableData,
        startY: 55,
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
            'Smart Ration Price Checker - Public Distribution System Prices',
            14,
            doc.internal.pageSize.height - 10
        );
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width - 25,
            doc.internal.pageSize.height - 10
        );
    }
    
    // Save PDF
    doc.save('ration-prices.pdf');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);