// checkout.js - SECURE VERSION

const masterPrices = {
    "low-01": 200,
    "med-01": 500,
    "high-01": 1200,
    "manga-01": 450,
    "canvas-01": 2500
};

let finalTotalAmount = 0;

window.onload = function() {
    renderSummary();
    setupCardFormatting();
    autoFillUserData(); 
};

// 1. AUTO-FILL (UX Optimization)
function autoFillUserData() {
    const sessionData = localStorage.getItem("ghostUser");
    if (sessionData) {
        const user = JSON.parse(sessionData);
        if (user.name) document.getElementById("cust-name").value = user.name;
        if (user.phone) document.getElementById("cust-phone").value = user.phone;
    }
}

// 2. SUMMARY (Data Integrity)
function renderSummary() {
    const securePack = JSON.parse(localStorage.getItem('ghostSecurePack')) || [];
    const container = document.getElementById("order-summary");
    let total = 0;
    
    container.innerHTML = "";
    
    if (securePack.length === 0) {
        container.innerHTML = "<p style='color:#555; text-align:center;'>Your cart is empty.</p>";
        document.getElementById("pay-button").disabled = true;
        return;
    }

    securePack.forEach(item => {
        const realPrice = masterPrices[item.id] || 0;
        const subtotal = realPrice * item.qty;
        container.innerHTML += `
            <div class="summary-item">
                <span>ID: ${item.id} (x${item.qty})</span>
                <span>₹${subtotal}</span>
            </div>`;
        total += subtotal;
    });

    finalTotalAmount = total;
    document.getElementById("final-total").textContent = total;
}

function togglePaymentFields() {
    const method = document.getElementById('pay-method').value;
    const cardSection = document.getElementById('card-section');
    cardSection.style.display = (method === 'card') ? 'block' : 'none';
}

// 3. SECURE PAYMENT GATEWAY (Logic Zone)
async function startPayment() {
    const btn = document.getElementById("pay-button");
    const loader = document.getElementById("loading-msg");
    const method = document.getElementById('pay-method').value;

    const name = document.getElementById("cust-name").value;
    const phone = document.getElementById("cust-phone").value;
    const address = document.getElementById("cust-address").value;

    // Validation
    if(!name || !phone || !address) {
        alert("Please fill in all shipping details!");
        return;
    }

    if(phone.length !== 10 || isNaN(phone)) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }

    // --- SECURITY PROTOCOL: DATA MASKING ---
    // We generate a random ID so we don't need card info to identify the order
    let paymentRef = "GHOST-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    let cardLog = "N/A";

    if(method === 'card') {
        const num = document.getElementById('card-num').value.replace(/\s/g, '');
        const exp = document.getElementById('card-exp').value;
        const cvv = document.getElementById('card-cvv').value;
        
        if(num.length < 16 || exp.length < 5 || cvv.length < 3) {
            alert("Please check your card details.");
            return;
        }

        // MASKING: We only keep the last 4 digits. The rest is deleted immediately.
        cardLog = "**** **** **** " + num.slice(-4);
    }

    // UI Feedback
    btn.disabled = true;
    btn.innerText = "Encrypting...";
    loader.style.display = "block";

    // Simulate Secure Server Handshake
    setTimeout(() => {
        // FINAL DATA PACK (This is what goes to your Google Sheet)
        const secureReceipt = {
            orderID: paymentRef,
            customer: name,
            contact: phone,
            total: finalTotalAmount,
            method: method,
            card_last4: cardLog, 
            status: "SUCCESS"
        };

        // Log locally for debugging (In production, you'd fetch() to your script)
        console.log("Secure Transaction Completed:", secureReceipt);
        
        alert("Order Successful!\nTransaction ID: " + paymentRef + "\nKeep this for your records.");
        
        // CLEAR SENSITIVE DATA
        localStorage.removeItem("ghostCart");
        localStorage.removeItem("ghostSecurePack");
        
        // Redirect
        window.location.href = "account.html"; 
    }, 3000);
}

// 4. INPUT FORMATTING (UX)
function setupCardFormatting() {
    const cardInput = document.getElementById('card-num');
    const expInput = document.getElementById('card-exp');

    if(cardInput) {
        cardInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim();
        });
    }

    if(expInput) {
        expInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^\d]/g, '');
            if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
            e.target.value = val;
        });
    }
}