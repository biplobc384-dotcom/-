document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // Supabase থেকে পাওয়া আপনার URL এবং Public Key এখানে পেস্ট করুন
    // =================================================================
    const SUPABASE_URL = 'https://fogywudjbxhafinnewth.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZ3l3dWRqYnhoYWZpbm5ld3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Mjg5MjUsImV4cCI6MjA3NTMwNDkyNX0.7UHH2a5SEPomulPjG-d3_WGrrSjyB6wwQh202qkE640';

    const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- Views & Forms ---
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const appView = document.getElementById('app-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');
    const showRegisterBtn = document.getElementById('show-register-btn');
    const showLoginBtn = document.getElementById('show-login-btn');
    const forgotPasswordBtn = document.getElementById('forgot-password-btn');
    const welcomeMessage = document.getElementById('welcome-message');
    const generateBtn = document.getElementById('generateBtn');
    
    // --- Authentication Logic ---
    const user = supabase.auth.user();
    if (user) {
        showAppView(user);
    } else {
        showLoginView();
    }
    
    supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
            showAppView(session.user);
        } else {
            showLoginView();
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const errorP = document.getElementById('register-error');
        errorP.textContent = '';

        const { error } = await supabase.auth.signUp({ email, password });
        if (error) errorP.textContent = error.message;
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorP = document.getElementById('login-error');
        errorP.textContent = '';
        
        const { error } = await supabase.auth.signIn({ email, password });
        if (error) errorP.textContent = error.message;
    });

    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
    });

    forgotPasswordBtn.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value;
        const errorP = document.getElementById('login-error');
        if (!email) {
            errorP.textContent = 'Please enter your email to reset password.';
            return;
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) {
            errorP.textContent = error.message;
        } else {
            alert('Password reset email sent! Please check your inbox.');
            errorP.textContent = '';
        }
    });

    showRegisterBtn.addEventListener('click', () => {
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
    });

    showLoginBtn.addEventListener('click', () => {
        loginView.classList.remove('hidden');
        registerView.classList.add('hidden');
    });

    // --- View Management ---
    function showLoginView() {
        loginView.classList.remove('hidden');
        registerView.classList.add('hidden');
        appView.classList.add('hidden');
    }

    function showAppView(user) {
        loginView.classList.add('hidden');
        registerView.classList.add('hidden');
        appView.classList.remove('hidden');
        welcomeMessage.textContent = `Welcome, ${user.email}`;
    }

    // --- App Logic ---
    generateBtn.addEventListener('click', () => {
        alert("Generate Email button clicked! (Add your email generation logic here)");
    });
});


