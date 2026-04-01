// account.js - GHOSTS OF ART SESSION MANAGER

// 1. Initial Handshake: Run when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    loadUserAccount();
    loadPurchaseHistory();
});

function loadUserAccount() {
    // Pull the user object from LocalStorage
    const sessionData = localStorage.getItem("ghostUser");

    // --- THE GUARD: SECURITY LAYER ---
    if (!sessionData) {
        console.warn("Unauthorized access attempt. Redirecting...");
        window.location.href = "web.html";
        return;
    }

    try {
        const user = JSON.parse(sessionData);

        // Fill HTML elements (using innerText is safer than innerHTML for user data)
        const nameEl = document.getElementById('display-name');
        const emailEl = document.getElementById('display-email');
        const phoneEl = document.getElementById('display-phone');

        if(nameEl) nameEl.innerText = user.name || "Collector";
        if(emailEl) emailEl.innerText = user.email || "Not Provided";
        if(phoneEl) phoneEl.innerText = user.phone || "Not Provided";

    } catch (error) {
        console.error("Session Data Corrupted:", error);
        localStorage.removeItem("ghostUser");
        window.location.href = "web.html";
    }
}

// 2. Load the Razorpay Receipt ID
function loadPurchaseHistory() {
    const list = document.getElementById("order-list");
    const lastID = localStorage.getItem("lastGhostOrderID");

    if (lastID && list) {
        list.innerHTML = `
            <div class="order-item" style="border: 1px solid rgba(0, 255, 204, 0.2); background: rgba(0, 255, 204, 0.02);">
                <span style="color:#888; font-size: 0.8em;">RECENT ORDER:</span><br>
                <span class="order-id-glow" style="color:#00ffcc; font-family:monospace; font-weight:bold; cursor:pointer;" onclick="copyToClipboard('${lastID}')">
                    ${lastID}
                </span>
                <div style="font-size:0.7em; color: #00ffcc; margin-top:5px; text-transform: uppercase;">Verified Success ✓</div>
            </div>
        `;
    }
}

// 3. Helper: Copy Order ID to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Order ID copied to clipboard!");
    });
}

// 4. Logout Logic
function handleLogout() {
    const confirmLogout = confirm("Are you sure? Your current session and cart will be cleared.");
    
    if (confirmLogout) {
        // We clear the session and cart
        localStorage.removeItem("ghostUser");
        localStorage.removeItem("ghostCart"); 
        
        // NOTE: We do NOT remove 'lastGhostOrderID' so the receipt stays on the device
        
        window.location.href = "web.html";
    }
}