const API_URL = 'http://localhost:8080';

// Check URL params for mode
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode'); // 'login' or 'signup'

    // Default to login if no mode
    if (mode === 'signup') {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('signup-form').classList.remove('hidden');
        document.getElementById('page-title').innerHTML = "Lets<br>Go";
    }
});


function toggleForms() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const title = document.getElementById('page-title');

    loginForm.classList.toggle('hidden');
    signupForm.classList.toggle('hidden');
    document.getElementById('otp-form').classList.add('hidden');

    if (loginForm.classList.contains('hidden')) {
        // We are now in Signup mode
        title.innerHTML = "Lets<br>Go";
    } else {
        // We are now in Login mode
        title.innerHTML = "Welcome<br>Back";
    }
}

// Context to know if we are verifying registration or login
let currentOtpContext = 'login'; // 'register' or 'login'

function showOtpForm(username, context) {
    currentOtpContext = context;
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('otp-form').classList.remove('hidden');
    document.getElementById('otp-username').value = username;
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        // Robust error handling
        const text = await response.text(); // Get raw text first
        let data;
        try {
            data = JSON.parse(text); // Try parsing JSON
        } catch (e) {
            console.error("Server returned non-JSON:", text);
            throw new Error("Server Error: " + (text || response.statusText));
        }

        if (response.ok) {
            if (data.message === "OTP_SENT") {
                alert('Credentials valid. OTP sent to your email.');
                showOtpForm(username, 'login');
            } else {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = 'dashboard.html';
            }
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (err) {
        console.error(err);
        alert('Error: ' + err.message);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email,
                password,
                role: [role]
            })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! OTP sent to your email.');
            showOtpForm(username, 'register');
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (err) {
        console.error("Signup error:", err);
        alert('Error: ' + err.message);
    }
}

async function handleVerifyOtp(e) {
    e.preventDefault();
    const username = document.getElementById('otp-username').value;
    const otp = document.getElementById('otp-code').value;

    // Choose endpoint based on context
    const endpoint = currentOtpContext === 'login'
        ? '/auth/verify-login-otp'
        : '/auth/verify-otp'; /* verify-otp is for activation */

    try {
        const url = `${API_URL}${endpoint}?username=${username}&otp=${otp}`;
        const response = await fetch(url, { method: 'POST' });

        const data = await response.json();

        if (response.ok) {
            if (currentOtpContext === 'login') {
                // Login OTP success = Get Token
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = 'dashboard.html';
            } else {
                // Register OTP success = Account Activated
                alert('Account verified! Please sign in.');
                document.getElementById('otp-form').classList.add('hidden');
                document.getElementById('login-form').classList.remove('hidden');
            }
        } else {
            alert(data.message || 'Verification failed');
        }
    } catch (err) {
        // If the server returns a 400 with a text body (not JSON), response.json() fails.
        // We should check content-type or wrap this better, but for now catch the JSON parse error.
        console.error("OTP Verification Error:", err);
        alert('Error: ' + err.message);
    }
}

/* Password Visibility */
function togglePasswordVisibility(fieldId) {
    const input = document.getElementById(fieldId);
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}

/* Password Strength */
function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('password-strength-bar');
    if (!strengthBar) return;

    let strength = 0;
    if (password.length >= 6) strength++; // Length
    if (/[A-Z]/.test(password)) strength++; // Uppercase
    if (/[0-9]/.test(password)) strength++; // Number
    if (/[^A-Za-z0-9]/.test(password)) strength++; // Special Char

    strengthBar.className = ''; // Reset
    if (strength <= 1) strengthBar.classList.add('strength-weak');
    else if (strength === 2 || strength === 3) strengthBar.classList.add('strength-medium');
    else strengthBar.classList.add('strength-strong');
}

/* Logout Flow */
function confirmLogout() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-box">
            <h3>Are you sure you want to logout?</h3>
            <div class="modal-buttons">
                <button class="btn-primary" onclick="performLogout()">Yes</button>
                <button class="btn-secondary" style="background:#ddd; color:#333; border:none;" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function performLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// ... existing dashboard code ...
async function loadDashboard() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return; // safety check

    const user = JSON.parse(userStr);
    const token = localStorage.getItem('token');

    document.getElementById('welcome-msg').innerText = `Welcome, ${user.username}`;
    document.getElementById('profile-username').innerText = user.username;
    document.getElementById('profile-email').innerText = user.email;
    document.getElementById('profile-roles').innerText = user.roles.join(', ');

    if (user.roles.includes('ROLE_ADMIN')) {
        document.getElementById('admin-section').classList.remove('hidden');
        loadAllUsers(token);
    }
}

async function loadAllUsers(token) {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();

        const container = document.getElementById('users-list');
        container.innerHTML = users.map(u => `
            <div class="user-card">
                <h3>${u.username}</h3>
                <p>${u.email}</p>
                <div style="margin: 0.5rem 0">
                    ${u.roles.map(r => `<span class="badge ${r.name === 'ROLE_ADMIN' ? 'badge-admin' : 'badge-user'}">${r.name}</span>`).join(' ')}
                </div>
                <p>Status: ${u.enabled ? 'Active' : 'Blocked/Pending'}</p>
                ${u.roles.some(r => r.name === 'ROLE_ADMIN') ? '' : `
                    <button class="action-btn btn-warning" onclick="toggleBlock(${u.id}, ${u.enabled})">
                        ${u.enabled ? 'Block' : 'Unblock'}
                    </button>
                    <button class="action-btn" onclick="makeAdmin(${u.id})">Make Admin</button>
                `}
            </div>
        `).join('');
    } catch (err) {
        console.error('Failed to load users', err);
    }
}

async function toggleBlock(userId, currentStatus) {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/admin/block-user?userId=${userId}&block=${currentStatus}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    loadAllUsers(token);
}

async function makeAdmin(userId) {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/admin/change-role?userId=${userId}&roleName=admin`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    loadAllUsers(token);
}
