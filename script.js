document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // Google Apps Script থেকে পাওয়া আপনার Web App URL টি এখানে পেস্ট করুন
    // =================================================================
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwJc2oEk2yOh-QJYLtC14_hdsKb5xQfIpI2Rl9BdGd2FaTW0DSHXQdPtziqZTxWQs0Q/exec";

    // --- ADMIN ---
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'Arifur';

    // --- HTML Elements ---
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

    // User Name Modal Elements
    const nameModal = document.getElementById('name-modal');
    const nameForm = document.getElementById('name-form');
    const userNameInput = document.getElementById('userNameInput');

    let tempSession = null;
    let currentUserName = null;

    // --- User Name Handling ---
    function checkUserName() {
        const savedName = localStorage.getItem('tempMailUserName');
        if (savedName) {
            currentUserName = savedName;
            nameModal.classList.add('hidden');
            userSection.classList.remove('hidden');
        } else {
            nameModal.classList.remove('hidden');
        }
    }

    nameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userName = userNameInput.value.trim();
        if (userName) {
            localStorage.setItem('tempMailUserName', userName);
            currentUserName = userName;
            nameModal.classList.add('hidden');
            userSection.classList.remove('hidden');
        }
    });
    
    // Initial check when page loads
    checkUserName();


    // --- Email Generation & Inbox Functions (using Mail.tm) ---
    async function createAccount() {
        try {
            // 1. Get a domain from Mail.tm
            const domainRes = await fetch('https://api.mail.tm/domains');
            if (!domainRes.ok) throw new Error('Failed to fetch domains from Mail.tm.');
            const domains = await domainRes.json();
            const domain = domains['hydra:member'][0]['domain'];

            // 2. Generate random credentials
            const username = Math.random().toString(36).substring(2, 12);
            const password = Math.random().toString(36).substring(2, 15);
            const email = `${username}@${domain}`;
            const accountData = { address: email, password: password };

            // 3. Create account on Mail.tm
            await fetch('https://api.mail.tm/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(accountData)
            });

            // 4. Get auth token for the new account
            const tokenRes = await fetch('https://api.mail.tm/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(accountData)
            });
            if (!tokenRes.ok) throw new Error('Failed to get auth token.');
            const tokenData = await tokenRes.json();
            
            return { email, password, token: tokenData.token };

        } catch (error) {
            console.error("Mail.tm API Error:", error);
            alert(`Error creating email: ${error.message}`);
            return null;
        }
    }

    async function checkInbox(token) {
        if (!token) return;
        inboxStatus.textContent = "Checking for new messages...";
        inboxMessages.innerHTML = '';
        try {
            const res = await fetch('https://api.mail.tm/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
        } catch (error)
 {
            console.error("Inbox Check Error:", error);
            inboxStatus.textContent = "Error checking inbox.";
        }
    }

    // --- Google Sheets Functions ---
    async function saveAccount(key, account) {
        loader.classList.remove('hidden');
        try {
            // ডেটার সাথে ব্যবহারকারীর নাম যোগ করা হলো
            const dataToSave = { 
                key, 
                email: account.email, 
                password: account.password,
                userName: currentUserName // Add user name
            };
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
            // টেবিলের 헤더 এ User Name যোগ করা হলো
            let tableHTML = `<table><thead><tr><th>${headers[0]}</th><th>${headers[1]}</th><th>${headers[2]}</th><th>User Name</th><th>${headers[3]}</th></tr></thead><tbody>`;
            data.forEach(row => {
                // টেবিলের সারিতে ব্যবহারকারীর নাম যোগ করা হলো
                tableHTML += `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[4] || 'N/A'}</td><td>${new Date(row[3]).toLocaleString('bn-BD')}</td></tr>`;
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
            nameModal.classList.add('hidden'); // Hide name modal in admin view
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
        checkUserName(); // Re-check user name on logout
    });
});
