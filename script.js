document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // Firebase ওয়েবসাইট থেকে পাওয়া আপনার নিজের কনফিগারেশন কোডটি এখানে পেস্ট করুন
    // =================================================================
    const firebaseConfig = {
      apiKey: "AIzaSyCnZkmB6RSqhq3-5osv-g7DLVoP30WBteY",
      authDomain: "arifurhackworld.firebaseapp.com",
      projectId: "arifurhackworld",
      storageBucket: "arifurhackworld.firebasestorage.app",
      messagingSenderId: "911113151211",
      appId: "1:911113151211:web:8a79b62c26870771aa14ae",
    measurementId: "G-REHTXT93C4"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- Views ---
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const appView = document.getElementById('app-view');

    // --- Forms & Buttons ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');
    const showRegisterBtn = document.getElementById('show-register-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    
    // --- App Elements ---
    const welcomeMessage = document.getElementById('welcome-message');
    const generateBtn = document.getElementById('generateBtn');

    // --- Authentication Logic ---
    auth.onAuthStateChanged(user => {
        if (user) {
            // User is signed in
            loginView.classList.add('hidden');
            registerView.classList.add('hidden');
            appView.classList.remove('hidden');
            welcomeMessage.textContent = `Welcome, ${user.email}`;
            // Load user-specific data if needed
        } else {
            // User is signed out
            loginView.classList.remove('hidden');
            registerView.classList.add('hidden');
            appView.classList.add('hidden');
        }
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const errorP = document.getElementById('register-error');

        auth.createUserWithEmailAndPassword(email, password)
            .catch(error => {
                errorP.textContent = error.message;
            });
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorP = document.getElementById('login-error');

        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                errorP.textContent = error.message;
            });
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    forgotPasswordBtn.addEventListener('click', () => {
        const email = document.getElementById('login-email').value;
        const errorP = document.getElementById('login-error');
        if (!email) {
            errorP.textContent = 'Please enter your email address to reset password.';
            return;
        }
        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert('Password reset email sent! Please check your inbox.');
                errorP.textContent = '';
            })
            .catch(error => {
                errorP.textContent = error.message;
            });
    });

    showRegisterBtn.addEventListener('click', () => {
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
    });

    showLoginBtn.addEventListener('click', () => {
        loginView.classList.remove('hidden');
        registerView.classList.add('hidden');
    });

    // --- App Logic ---
    generateBtn.addEventListener('click', () => {
        // Your existing generate email logic
        alert("Generate Email button clicked! (Add email generation logic here)");
        // e.g., createAccount().then(account => { ... });
    });
    
    // (এখানে আপনার createAccount, checkInbox, saveAccount, loadSavedAccounts ফাংশনগুলো যোগ করতে হবে)
    // গুরুত্বপূর্ণ: saveAccount ফাংশনটিকে পরিবর্তন করতে হবে যাতে এটি বর্তমান ব্যবহারকারীর uid ব্যবহার করে তথ্য সেভ করে।
});
