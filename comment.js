// comment.js

// 1. Initial Load and Auth Check
const userSession = JSON.parse(localStorage.getItem("ghostUser"));
const welcomeText = document.getElementById('user-welcome');
const commentList = document.getElementById('comment-list');

if (!userSession) {
    // If no user found, kick them back to sign up
    alert("Please sign up at the entrance to post a message.");
    window.location.href = 'web.html';
} else {
    welcomeText.innerText = `Signed in as: ${userSession.name} (Email hidden for safety)`;
}

// 2. Load comments on start
window.onload = loadComments;

function handlePost() {
    const input = document.getElementById('comment-input');
    const message = input.value.trim();

    if (message.length < 3) {
        alert("Please write a bit more!");
        return;
    }

    // Safety: ONLY take the name from the session, leave email/phone behind
    const newComment = {
        name: userSession.name,
        text: message,
        time: new Date().toLocaleString()
    };

    // Save to LocalStorage
    let existingComments = JSON.parse(localStorage.getItem("ghostComments") || "[]");
    existingComments.unshift(newComment); // Newest first
    localStorage.setItem("ghostComments", JSON.stringify(existingComments));

    // Clear input and refresh
    input.value = "";
    loadComments();
}

function loadComments() {
    const comments = JSON.parse(localStorage.getItem("ghostComments") || "[]");
   
    if (comments.length === 0) {
        commentList.innerHTML = `<p style="text-align:center; color:#444; margin-top:40px;">No messages yet. Be the first!</p>`;
        return;
    }

    commentList.innerHTML = comments.map(c => `
        <div class="comment-item">
            <div class="comment-header">
                <span class="author-name">@${c.name}</span>
                <span class="timestamp">${c.time}</span>
            </div>
            <div class="message-text">${escapeHTML(c.text)}</div>
        </div>
    `).join('');
}

// Security: Prevent people from typing <script> tags into your comments
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}