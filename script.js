document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // Google Apps Script URL বা Firebase Config এখানে থাকবে
    // =================================================================
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwJc2oEk2yOh-QJYLtC14_hdsKb5xQfIpI2Rl9BdGd2FaTW0DSHXQdPtziqZTxWQs0Q/exec";

    // --- ADMIN ---
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'Arifur';

    // --- HTML Elements ---
    // User Section
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
    const savedAccountsList = document.getElementById('saved-accounts-list');

    // Admin Section
    const adminPanel = document.getElementById('admin-panel');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminDataTable = document.getElementById('admin-data-table');
    
    // Modal Section
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const closeButton = document.querySelector('.close-button');
    const loginError = document.getElementById('login-error');

    let tempSession = null;

    // --- Email Generation Functions ---
    async function createAccount() {
        try {
            const res = await fetch('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
            if (!res.ok) throw new Error('Failed to generate email from 1secmail.');
            const data = await res.json();
            const email = data[0];
            const password = Math.random().toString(36).substring(2, 12);
            return { email, password, token: email };
        } catch (error) {
            console.error("1secmail API Error:", error);
            alert(`Error creating email: ${error.message}`);
            return null;
        }
    }

    async function checkInbox(email) {
        if (!email) return;
        inboxStatus.textContent = "Checking for new messages...";
        inboxMessages.innerHTML = '';
        const [login, domain] = email.split('@');
        try {
            const res = await fetch(`https://www.1secmail.com/api/v1/?action=getMessages&login=${login}&domain=${domain}`);
            const messages = await res.json();
            if (messages.length === 0) {
                inboxStatus.textContent = "Your inbox is empty.";
            } else {
                inboxStatus.textContent = `You have ${messages.length} message(s).`;
                messages.forEach(msg => {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'message';
                    msgDiv.innerHTML = `<p><strong>From:</strong> <code>${msg.from}</code></p><p><strong>Subject:</strong> ${msg.subject}</p><p>${msg.date}</p>`;
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
            const dataToSave = { key, email: account.email, password: account.password };
            await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify(dataToSave)
            });
            alert(`"${key}" কী (Key) দিয়ে তথ্য সফলভাবে সেভ হয়েছে!`);
        } catch (error) {
            console.error("Error saving data to Google Sheet:", error);
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
            let tableHTML = `<table><thead><tr><th>${headers[0]}</th><th>${headers[1]}</th><th>${headers[2]}</th><th>${headers[3]}</th></tr></thead><tbody>`;
            data.forEach(row => {
                tableHTML += `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${new Date(row[3]).toLocaleString('bn-BD')}</td></tr>`;
            });
            tableHTML += '</tbody></table>';
            adminDataTable.innerHTML = tableHTML;
        } catch (error) {
            console.error("Error loading admin data:", error);
            adminDataTable.innerHTML = '<p>তথ্য লোড করার সময় একটি সমস্যা হয়েছে।</p>';
        }
    }

    // --- Event Listeners ---
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
        if (tempSession) checkInbox(tempSession.email);
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
            userSection.classList.add('hidden');
            adminPanel.classList.remove('hidden');
            adminLoginBtn.classList.add('hidden');
            loadAdminData();
        } else {
            loginError.textContent = 'ভুল ইউজারনেম অথবা পাসওয়ার্ড।';
        }
    });

    logoutBtn.addEventListener('click', () => {
        userSection.classList.remove('hidden');
        adminPanel.classList.add('hidden');
        adminLoginBtn.classList.remove('hidden');
        loginError.textContent = '';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    });
});
