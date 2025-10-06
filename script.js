document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // ধাপ ১ থেকে কপি করা আপনার সঠিক Firebase কনফিগারেশন কোডটি এখানে পেস্ট করুন
    // =================================================================
    const firebaseConfig = {
     apiKey: "AIzaSyCNoI8_de_V5kc6WukRGb6KU5KAPOwQQaY",
  authDomain: "web-site-b12eb.firebaseapp.com",
  projectId: "web-site-b12eb",
  storageBucket: "web-site-b12eb.firebasestorage.app",
  messagingSenderId: "624092074743",
  appId: "1:624092074743:web:505afcc9172481ff4239f2",
  measurementId: "G-5958JRM3KX"
    };

    // Firebase মাত্র একবার Initialize করা হচ্ছে
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
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

    // --- Authentication State Observer ---
    auth.onAuthStateChanged(user => {
        if (user) {
            loginView.classList.add('hidden');
            registerView.classList.add('hidden');
            appView.classList.remove('hidden');
            welcomeMessage.textContent = `Welcome, ${user.email}`;
        } else {
            loginView.classList.remove('hidden');
            registerView.classList.add('hidden');
            appView.classList.add('hidden');
        }
    });

    // --- Authentication Event Listeners ---
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const errorP = document.getElementById('register-error');
        errorP.textContent = '';

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
        errorP.textContent = '';

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
            errorP.textContent = 'Please enter your email to reset the password.';
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
        alert("Generate Email button clicked! (Add email generation logic here)");
    });
});
