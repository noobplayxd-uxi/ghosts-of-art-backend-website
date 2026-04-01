// cart.js
function getCart(){
    return JSON.parse(localStorage.getItem("ghostCart") || "[]");
}

function saveCart(cart){
    localStorage.setItem("ghostCart", JSON.stringify(cart));
}

function addToCart(item){
    let cart = getCart();
    let existing = cart.find(i => i.name === item.name);
    if(existing) existing.qty += 1;
    else cart.push({...item, qty:1});
    saveCart(cart);
}

function removeFromCart(index){
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
}

function changeQty(index, delta){
    let cart = getCart();
    cart[index].qty += delta;
    if(cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart(cart);
}

function getTotal(){
    let cart = getCart();
    return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

// --- UPDATED: GOOGLE SHEETS CONNECTION ---

async function sendOrderToSheet(orderData) {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxz4X9eZ7r6m8mSwwBTUrFz74mkCssoe5WcFGb8xi9rGdltL1eoImjWpV3Z9Hb43_TC/exec';

    try {
        // Using 'no-cors' means we can't read the response, but the data STILL goes through.
        await fetch(scriptURL, {
            method: 'POST',
            mode: 'no-cors', 
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        // Since we can't 'wait' for a result in no-cors mode, we assume the 
        // browser successfully handed the data to the internet.
        return true; 
    } catch (error) {
        console.error('Network Error:', error);
        return false;
    }
}

async function processOrder() {
    // 1. Check user data
    const userData = localStorage.getItem("ghostUser");
    const cart = getCart();

    if (!userData) {
        alert("Please sign up first at the entrance!");
        window.location.href = "web.html";
        return;
    }

    const user = JSON.parse(userData);

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // 2. Prepare order object
    const orderData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        order: cart.map(item => `${item.name} (x${item.qty})`).join(", "),
        total: getTotal()
    };

    // 3. Send it to the Manager's Sheet
    const sent = await sendOrderToSheet(orderData);

    if (sent) {
        alert("Sending order successful.");
        localStorage.removeItem("ghostCart"); 
        window.location.href = "Store.html";   
    } else {
        alert("Connection failed. Check your internet.");
        // Reset the button if you have a loading state in cart.html
        const buyBtn = document.getElementById('checkout-button');
        if(buyBtn) {
            buyBtn.innerText = "Buy Now";
            buyBtn.disabled = false;
        }
    }
}