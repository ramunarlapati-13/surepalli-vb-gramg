// State Management
let documents = JSON.parse(localStorage.getItem('docuflow_documents')) || [];
let categories = JSON.parse(localStorage.getItem('docuflow_categories')) || [
    { id: 'cat-1', name: 'Legal', color: '#ef4444' },
    { id: 'cat-2', name: 'Finance', color: '#10b981' },
    { id: 'cat-3', name: 'Personal', color: '#ec4899' },
    { id: 'cat-4', name: 'Work', color: '#06b6d4' }
];
let currentCategory = 'all';

// DOM Elements
const docGrid = document.getElementById('document-grid');
const categoryList = document.getElementById('category-list');
const uploadModal = document.getElementById('upload-modal');
const categoryModal = document.getElementById('category-modal');
const searchInput = document.getElementById('search-input');
const emptyState = document.getElementById('empty-state');
const pageTitle = document.getElementById('page-title');

// Initialize
function init() {
    renderCategories();
    renderDocuments();
    setupEventListeners();
}

// Render Functions
function renderCategories() {
    categoryList.innerHTML = categories.map(cat => `
        <button class="nav-item ${currentCategory === cat.id ? 'active' : ''}" 
                onclick="filterCategory('${cat.id}')">
            <i class="fa-solid fa-folder" style="color: ${cat.color}"></i>
            <span>${cat.name}</span>
        </button>
    `).join('');
    
    // Also update selector in upload modal
    const docCategorySelect = document.getElementById('doc-category');
    docCategorySelect.innerHTML = categories.map(cat => 
        `<option value="${cat.id}">${cat.name}</option>`
    ).join('');
}

function renderDocuments() {
    let filteredDocs = documents;
    
    // Category Filter
    if (currentCategory !== 'all') {
        filteredDocs = filteredDocs.filter(doc => doc.categoryId === currentCategory);
    }
    
    // Search Filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filteredDocs = filteredDocs.filter(doc => 
            doc.name.toLowerCase().includes(searchTerm)
        );
    }

    // Toggle Empty State
    if (filteredDocs.length === 0) {
        docGrid.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        docGrid.innerHTML = filteredDocs.map(doc => {
            const category = categories.find(c => c.id === doc.categoryId) || categories[0];
            return `
                <div class="document-card" onclick="openDoc('${doc.id}')">
                    <div class="card-icon">
                        <i class="fa-solid ${getFileIcon(doc.type)}"></i>
                    </div>
                    <div class="card-info">
                        <h3>${doc.name}</h3>
                        <p>${formatDate(doc.date)} • ${doc.size}</p>
                    </div>
                    <div class="card-meta">
                        <span class="tag-badge" style="background: ${category.color}20; color: ${category.color}">
                            ${category.name}
                        </span>
                        <button class="doc-menu-btn" onclick="deleteDoc('${doc.id}', event)">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Helper Functions
function getFileIcon(type) {
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('image')) return 'fa-file-image';
    if (type.includes('spreadsheet') || type.includes('excel')) return 'fa-file-excel';
    if (type.includes('word') || type.includes('doc')) return 'fa-file-word';
    return 'fa-file';
}

function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Actions
function filterCategory(catId) {
    currentCategory = catId;
    
    // Update active class
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if (catId === 'all') {
        document.querySelector('[data-category="all"]').classList.add('active');
        pageTitle.innerText = 'All Documents';
    } else {
        const catName = categories.find(c => c.id === catId)?.name || 'Documents';
        pageTitle.innerText = catName + ' Documents';
    }
    
    renderCategories(); // Re-render to show active state
    renderDocuments();
}

function saveDocument() {
    const nameInput = document.getElementById('doc-name');
    const categorySelect = document.getElementById('doc-category');
    
    if (!nameInput.value) {
        alert('Please enter a document name');
        return;
    }

    const newDoc = {
        id: generateId(),
        name: nameInput.value,
        categoryId: categorySelect.value,
        type: 'pdf', // Simulating PDF for now
        size: '1.2 MB',
        date: new Date().toISOString()
    };

    documents.unshift(newDoc);
    localStorage.setItem('docuflow_documents', JSON.stringify(documents));
    
    renderDocuments();
    closeUploadModal();
    nameInput.value = ''; // Reset
}

function deleteDoc(id, event) {
    event.stopPropagation(); // Prevent card click
    if(confirm('Are you sure you want to delete this document?')) {
        documents = documents.filter(d => d.id !== id);
        localStorage.setItem('docuflow_documents', JSON.stringify(documents));
        renderDocuments();
    }
}

function saveCategory() {
    const nameInput = document.getElementById('cat-name');
    const selectedColor = document.querySelector('.color-option.selected').dataset.color;
    
    if (!nameInput.value) {
        alert('Please enter a category name');
        return;
    }

    const newCat = {
        id: generateId(),
        name: nameInput.value,
        color: selectedColor
    };

    categories.push(newCat);
    localStorage.setItem('docuflow_categories', JSON.stringify(categories));
    
    renderCategories();
    closeCategoryModal();
    nameInput.value = '';
}

function openDoc(id) {
    console.log("Opening doc", id);
    alert('Document preview would open here!');
}

// Modal Toggle
function openUploadModal() {
    uploadModal.classList.remove('hidden');
}
function closeUploadModal() {
    uploadModal.classList.add('hidden');
}
function openCategoryModal() {
    categoryModal.classList.remove('hidden');
}
function closeCategoryModal() {
    categoryModal.classList.add('hidden');
}

// Event Listeners
function setupEventListeners() {
    searchInput.addEventListener('input', renderDocuments);

    // Color picker
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            colorOptions.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });

    // File Drop Zone - Visual only for now
    const dropZone = document.getElementById('drop-zone');
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        // Handle file drop here if needed
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById('doc-name').value = files[0].name;
        }
    });
    
    dropZone.addEventListener('click', () => {
        document.getElementById('file-input').click();
    });
    
    document.getElementById('file-input').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
           document.getElementById('doc-name').value = e.target.files[0].name;
        }
    });

    // Category Buttons
    document.querySelector('[data-category="all"]').onclick = () => filterCategory('all');
}

// Run
init();
