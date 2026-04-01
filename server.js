const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");
const helmet = require("helmet"); 
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// --- 1. CLOUD DATABASE CONNECTION ---
const cloudURI = "process.env.MONGO_URI";

mongoose.connect(cloudURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
})
.then(() => console.log("✅ GHOSTS-OF-ART: Cloud Database Connected!"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

const EconomySchema = new mongoose.Schema({
    id: { type: String, default: "main_stats" },
    total: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    revenue: [Number],
    labels: [String]
});
const Economy = mongoose.model('Economy', EconomySchema);

// --- 2. SYSTEM PROTECTION & CORS ---
app.use(helmet()); 
app.use(express.json({ limit: '10kb' })); 

app.use(cors({
    origin: "*", // Allows your local HTML files to talk to the server easily
    methods: ["POST", "GET"]
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 15, 
    message: { error: "Security Alert: Too many attempts." }
});

// --- 3. PRODUCT & GATEWAY CONFIG ---
const productDatabase = {
    "low-01": 200, "med-01": 500, "high-01": 1200, "manga-01": 450, "canvas-01": 2500
};

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// --- 4. CLOUD ECONOMICS LOGIC ---
async function recordSale(amount) {
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
        let stats = await Economy.findOne({ id: "main_stats" });
        if (!stats) {
            stats = new Economy({ id: "main_stats", total: 0, count: 0, revenue: [], labels: [] });
        }

        const newTotal = stats.total + amount;
        stats.total = newTotal;
        stats.count += 1;
        stats.revenue.push(newTotal);
        stats.labels.push(timeLabel);

        if (stats.revenue.length > 15) {
            stats.revenue.shift();
            stats.labels.shift();
        }

        await stats.save();
        console.log(`📈 MARKET UPDATE: +₹${amount} | Cloud Liquidity: ₹${newTotal}`);
    } catch (err) {
        console.error("❌ Cloud Update Failed:", err);
    }
}

// --- 5. ROUTES ---

app.get("/admin/economics", async (req, res) => {
    try {
        const stats = await Economy.findOne({ id: "main_stats" });
        res.json(stats || { total: 0, count: 0, revenue: [], labels: [] });
    } catch (err) {
        res.status(500).json({ error: "Cloud Offline" });
    }
});

// MATCHED LOGIN: Updated to match your new password
app.post("/admin-gate", (req, res) => {
    const { user, pass } = req.body;
    
    // Changing 'ghost123' to 'Teresussy' here to match your display log
    if (user === "admin" && pass === "Teresussy") { 
        const token = Buffer.from(pass + Date.now()).toString('base64');
        res.json({ auth: true, token: token });
    } else {
        res.status(401).json({ auth: false });
    }
});

app.post("/create-order", limiter, async (req, res) => {
    try {
        const { items } = req.body;
        let secureTotal = 0;
        items.forEach(item => {
            const price = productDatabase[item.id];
            if (price) secureTotal += price * Math.max(1, Math.min(item.qty, 10));
        });

        const order = await razorpay.orders.create({
            amount: secureTotal * 100, 
            currency: "INR",
            receipt: `rcpt_${Math.random().toString(36).substring(7)}`,
        });
        res.json({ ...order, finalAmount: secureTotal });
    } catch (err) {
        res.status(500).json({ error: "Gateway Error" });
    }
});

app.post("/verify-payment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
        console.log("✅ Verified: Payment Successful.");
        await recordSale(amount / 100); 
        res.json({ status: "success" });
    } else {
        res.status(400).json({ status: "tampered" });
    }
});

// --- 6. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    =========================================
    GHOSTS OF ART - CLOUD BACKEND ACTIVE
    Port: ${PORT} | Mode: MongoDB Atlas
    Security: Helmet & Rate-Limiter Active
    Admin User: admin | Admin Pass: Teresussy
    =========================================
    `);
});