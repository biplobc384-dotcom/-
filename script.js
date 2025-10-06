document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // Google Apps Script থেকে পাওয়া আপনার Web App URL টি এখানে পেস্ট করুন
    // =================================================================
    const SCRIPT_URL = "https://script.google.com/macros/s/আপনার-ইউআরএল-এখানে/exec";

    // --- ADMIN ---
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'Arifur';

    // --- HTML Elements ---
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const appView = document.getElementById('app-view');
    const loginFormMain = document.getElementById('login-form-main');
    const registerForm = document.getElementById('register-form');
    const welcomeMessage = document.getElementById('welcome-message');
    const appLogoutBtn = document.getElementById('appLogoutBtn');
    const userSection = document.getElementById('user-section');
    const generateBtn = document.getElementById('generateBtn');
    const loader = document.getElementById('loader');
    const newEmailSection = document.getElementById('new-email-section');
    const emailDisplay = document.getElementById('email-display');
    const passwordDisplay = document.getElementById('password-display');
    const checkInboxBtn = document.getElementById('checkInboxBtn');
    const inboxStatus = document.getElementById('inbox-status');
    const inboxMessages = document.getElementById('inbox-messages');
    const saveKeyInput = document.getElementById('save-key');
    const saveBtn = document.getElementById('saveBtn');
    const discardBtn = document.getElementById('discardBtn');
    const adminPanel = document.getElementById('admin-panel');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminDataTable = document.getElementById('admin-data-table');
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const closeButton = document.querySelector('.close-button');
    const loginError = document.getElementById('login-error');
    const resetAccountBtn = document.getElementById('resetAccountBtn');

    let tempSession = null;

    // --- User Authentication Logic ---
    function checkUserStatus() {
        const user = JSON.parse(localStorage.getItem('userAccount'));
        const loggedInUser = localStorage.getItem('loggedInUser');

        if (loggedInUser) {
            showAppView(loggedInUser);
        } else if (user) {
            showLoginView();
        } else {
            showRegisterView();
        }
    }

    function showLoginView() {
        loginView.classList.remove('hidden');
        registerView.classList.add('hidden');
        appView.classList.add('hidden');
    }

    function showRegisterView() {
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
        appView.classList.add('hidden');
    }

    function showAppView(username) {
        loginView.classList.add('hidden');
        registerView.classList.add('hidden');
        appView.classList.remove('hidden');
        welcomeMessage.textContent = `Welcome, ${username}!`;
    }

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const userAccount = { username, password };
        localStorage.setItem('userAccount', JSON.stringify(userAccount));
        localStorage.setItem('loggedInUser', username);
        showAppView(username);
    });

    loginFormMain.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const mainLoginError = document.getElementById('main-login-error');
        const storedUser = JSON.parse(localStorage.getItem('userAccount'));
        if (storedUser && storedUser.username === username && storedUser.password === password) {
            localStorage.setItem('loggedInUser', username);
            showAppView(username);
            mainLoginError.textContent = '';
        } else {
            mainLoginError.textContent = 'ভুল ইউজারনেম অথবা পাসওয়ার্ড।';
        }
    });

    appLogoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        checkUserStatus();
    });

    resetAccountBtn.addEventListener('click', () => {
        const confirmation = confirm("Are you sure you want to reset your account? All saved data will be lost and you will have to register again.");
        if (confirmation) {
            localStorage.removeItem('userAccount');
            localStorage.removeItem('loggedInUser');
            window.location.reload();
        }
    });

    // --- Email Generation & Inbox Functions ---
    async function createAccount() {
        try {
            const domainRes = await fetch('https://api.mail.gw/domains');
            if (!domainRes.ok) throw new Error('Failed to fetch domains from Mail.gw.');
            const domains = await domainRes.json();
            const domain = domains['hydra:member'][0]['domain'];
            const username = Math.random().toString(36).substring(2, 12);
            const password = Math.random().toString(36).substring(2, 15);
            const email = `${username}@${domain}`;
            const accountData = { address: email, password: password };
            await fetch('https://api.mail.gw/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(accountData) });
            const tokenRes = await fetch('https://api.mail.gw/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(accountData) });
            if (!tokenRes.ok) throw new Error('Failed to get auth token.');
            const tokenData = await tokenRes.json();
            return { email, password, token: tokenData.token };
        } catch (error) {
            console.error("Mail.gw API Error:", error);
            alert(`Error creating email: ${error.message}`);
            return null;
        }
    }

    async function checkInbox(token) {
        if (!token) return;
        inboxStatus.textContent = "Checking for new messages...";
        inboxMessages.innerHTML = '';
        try {
            const res = await fetch('https://api.mail.gw/messages', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to fetch messages.');
            const data = await res.json();
            const messages = data['hydra:member'];
            if (messages.length === 0) {
                inboxStatus.textContent = "Your inbox is empty.";
            } else {
                inboxStatus.textContent = `You have ${messages.length} message(s).`;
                messages.forEach(msg => {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'message';
                    msgDiv.innerHTML = `<p><strong>From:</strong> <code>${msg.from.address}</code></p><p><strong>Subject:</strong> ${msg.subject}</p><p>${msg.intro}</p>`;
                    inboxMessages.appendChild(msgDiv);
                });
            }
        } catch (error) {
            console.error("Inbox Check Error:", error);
            inboxStatus.textContent = "Error checking inbox.";
        }
    }

    // --- Google Sheets Functions ---
    async function saveAccount(key, account) {
        loader.classList.remove('hidden');
        try {
            const loggedInUser = localStorage.getItem('loggedInUser') || 'guest';
            const dataToSave = { key, email: account.email, password: account.password, username: loggedInUser };
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: JSON.stringify(dataToSave)
            });
            alert(`"${key}" কী (Key) দিয়ে তথ্য সফলভাবে সেভ হয়েছে!`);
        } catch (error) {
            console.error("Error saving data:", error);
            alert("তথ্য সেভ করার সময় একটি সমস্যা হয়েছে।");
        } finally {
            loader.classList.add('hidden');
        }
    }

    async function loadAdminData() {
        adminDataTable.innerHTML = '<p>ব্যবহারকারীদের তথ্য লোড হচ্ছে...</p>';
        try {
            const response = await fetch(SCRIPT_URL);
            const data = await response.json();
            if (data.length < 2) {
                 adminDataTable.innerHTML = '<p>এখনও কোনো তথ্য সেভ করা হয়নি।</p>';
                 return;
            }
            const headers = data.shift();
            let tableHTML = `<table><thead><tr><th>${headers[0]}</th><th>${headers[1]}</th><th>${headers[2]}</th><th>${headers[3]}</th><th>${headers[4] || 'Username'}</th></tr></thead><tbody>`;
            data.forEach(row => {
                tableHTML += `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${new Date(row[3]).toLocaleString('bn-BD')}</td><td>${row[4] || ''}</td></tr>`;
            });
            tableHTML += '</tbody></table>';
            adminDataTable.innerHTML = tableHTML;
        } catch (error) {
            console.error("Error loading admin data:", error);
            adminDataTable.innerHTML = '<p>তথ্য লোড করার সময় একটি সমস্যা হয়েছে।</p>';
        }
    }

    // --- App Event Listeners ---
    generateBtn.addEventListener('click', async () => {
        loader.classList.remove('hidden');
        generateBtn.disabled = true;
        newEmailSection.classList.add('hidden');
        const account = await createAccount();
        loader.classList.add('hidden');
        generateBtn.disabled = false;
        if (account) {
            tempSession = account;
            emailDisplay.textContent = account.email;
            passwordDisplay.textContent = account.password;
            newEmailSection.classList.remove('hidden');
            inboxStatus.textContent = "Your inbox is empty.";
            inboxMessages.innerHTML = '';
        }
    });

    checkInboxBtn.addEventListener('click', () => {
        if (tempSession) checkInbox(tempSession.token);
    });

    saveBtn.addEventListener('click', () => {
        const key = saveKeyInput.value.trim();
        if (!key) {
            alert('তথ্য সেভ করার জন্য একটি কী (Key) দিন।');
            return;
        }
        if (tempSession) {
            saveAccount(key, tempSession).then(() => {
                tempSession = null;
                newEmailSection.classList.add('hidden');
                saveKeyInput.value = '';
            });
        }
    });

    discardBtn.addEventListener('click', () => {
        tempSession = null;
        newEmailSection.classList.add('hidden');
    });

    // --- Admin Modal Logic ---
    adminLoginBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
    });

    closeButton.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });

    window.addEventListener('click', (event) => {
        if (event.target == loginModal) loginModal.classList.add('hidden');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            loginModal.classList.add('hidden');
            appView.classList.add('hidden');
            adminPanel.classList.remove('hidden');
        } else {
            loginError.textContent = 'ভুল ইউজারনেম অথবা পাসওয়ার্ড।';
        }
    });

    logoutBtn.addEventListener('click', () => {
        appView.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        loginError.textContent = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    });

    // --- Initial Check ---
    checkUserStatus();
});
