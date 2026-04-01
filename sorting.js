/**
 * GHOSTS OF ART - PRODUCT DATA & SORTING ENGINE
 * E:\Ghostsofart\sorting.js
 */

// --- 1. THE PRODUCT DATABASE ---
// Add your products here. Ensure category matches your Sidebar exactly!
let products = [
    { id: "LL-101", name: "Naruto", price: 350, category: "Low", img: "Naruto.jpg" },
    { id: "LL-102", name: "Shadow", price: 420, category: "Low", img: "Shadow.jpg" },
    { id: "ML-201", name: "Midnight Bloom", price: 600, category: "Medium", img: "Midnight-bloom.jpg" },
    { id: "HL-301", name: "Golden Hour", price: 780, category: "High", img: "arts/high1.jpg" },
    { id: "CV-401", name: "Ocean Canvas", price: 1450, category: "Canvas", img: "arts/can1.jpg" },
    { id: "MG-901", name: "Naruto Vol 1", price: 450, category: "Manga", img: "arts/manga1.jpg" },
    { id: "MG-902", name: "Demon Slayer Set", price: 5500, category: "Manga", img: "arts/manga2.jpg" }
];

// Always keep items sorted by price (Cheapest first)
products.sort((a, b) => a.price - b.price);

/**
 * Renders products to the 'product-list' div in Store.html
 */
function renderProducts(list) {
    const container = document.getElementById("product-list");
    if (!container) return; 
    
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = "<p style='color:#888; padding:20px;'>No items found.</p>";
        return;
    }

    list.forEach(p => {
        const div = document.createElement("div");
        div.className = "product";
        
        // This is the HTML structure for each product card
        div.innerHTML = `
            <div style="font-size:9px; color:#444; text-align:right;">ID: ${p.id}</div>
            <img src="${p.img}" alt="${p.name}">
            <h4>${p.name}</h4>
            <p style="color:#fff; font-weight:bold;">₹${p.price}</p>
            <span style="font-size:0.7rem; color:#888; border:1px solid #333; padding:2px 6px; border-radius:4px;">
                ${p.category}
            </span>
            <button onclick="addItemToCart('${p.id}', '${p.name}', ${p.price})" style="margin-top:12px;">
                Add to Cart
            </button>`;
            
        container.appendChild(div);
    });
}

/**
 * Filter by Sidebar Categories
 */
function filterByCategory(categoryName) {
    // Clear other filters for a clean view
    document.getElementById("search-bar").value = "";
    document.getElementById("min-price").value = "";
    document.getElementById("max-price").value = "";

    if (categoryName === 'All') {
        renderProducts(products);
    } else {
        const filtered = products.filter(p => p.category === categoryName);
        renderProducts(filtered);
    }
}

/**
 * Filter by Search Bar and Manual Price inputs
 */
function applyFilters() {
    const searchText = document.getElementById("search-bar").value.toLowerCase();
    const min = Number(document.getElementById("min-price").value) || 0;
    const max = Number(document.getElementById("max-price").value) || Infinity;
    
    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchText);
        const matchesPrice = p.price >= min && p.price <= max;
        return matchesSearch && matchesPrice;
    });
    
    renderProducts(filtered);
}

// Initialize the store view
renderProducts(products);