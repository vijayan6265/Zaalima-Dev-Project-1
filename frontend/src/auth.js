import './style.css';

const USER_API = 'http://192.168.1.2:8081/api/users';

document.querySelector('#app').innerHTML = `
<div class="auth-wrapper">
  <div class="auth-container" id="authContainer">
    
    <!-- SLIDING GREEN BLADE OVERLAY -->
    <div class="blade-overlay">
      <div class="overlay-panel panel-left">
        <span class="brand-tag">MINISHOP</span>
        <h1>Welcome<br><em>back.</em></h1>
        <p>Your orders, cart items, and account details are waiting for you.</p>
        <button class="ghost-btn" id="toRegister">Create an account</button>
      </div>

      <div class="overlay-panel panel-right">
        <span class="brand-tag">MINISHOP</span>
        <h1>Start the<br><em>first page.</em></h1>
        <p>One account for every purchase, order tracking, and seamless checkout.</p>
        <button class="ghost-btn" id="toLogin">Sign in</button>
      </div>
    </div>

    <!-- SIGN IN FORM (LEFT PANEL) -->
    <div class="form-container sign-in-container">
      <form id="loginForm">
        <h2>Sign in</h2>
        <p class="auth-sub">Enter your account credentials</p>

        <div class="input-field">
          <input type="email" id="loginEmail" placeholder=" " required />
          <label>Email address</label>
        </div>

        <div class="input-field">
          <input type="password" id="loginPassword" placeholder=" " required />
          <label>Password</label>
        </div>

        <button type="submit" class="primary-btn" id="loginBtn">Sign In</button>
        <p id="loginMessage" class="message"></p>

        <div class="mobile-switch">
          New to MiniShop? <a href="#" id="mobileToRegister">Create an account</a>
        </div>
      </form>
    </div>

    <!-- SIGN UP FORM (RIGHT PANEL) -->
    <div class="form-container sign-up-container">
      <form id="registerForm">
        <h2>Create account</h2>
        <p class="auth-sub">Register a new account to get started</p>

        <div class="input-field">
          <input type="text" id="regName" placeholder=" " required />
          <label>Full name</label>
        </div>

        <div class="input-field">
          <input type="email" id="regEmail" placeholder=" " required />
          <label>Email address</label>
        </div>

        <div class="input-field">
          <input type="tel" id="regPhone" placeholder=" " required />
          <label>Phone number</label>
        </div>

        <div class="input-field">
          <input type="password" id="regPassword" placeholder=" " required />
          <label>Password</label>
        </div>

        <div class="input-field">
          <input type="password" id="regConfirmPassword" placeholder=" " required />
          <label>Confirm Password</label>
        </div>

        <button type="submit" class="primary-btn" id="registerBtn">Create account</button>
        <p id="registerMessage" class="message"></p>

        <div class="mobile-switch">
          Already have an account? <a href="#" id="mobileToLogin">Sign in</a>
        </div>
      </form>
    </div>

  </div>
</div>
`;

// ==========================================
// SLIDE TOGGLE LOGIC
// ==========================================
const authContainer = document.getElementById('authContainer');
const toRegisterBtn = document.getElementById('toRegister');
const toLoginBtn = document.getElementById('toLogin');
const mobileToRegister = document.getElementById('mobileToRegister');
const mobileToLogin = document.getElementById('mobileToLogin');

const switchToRegister = () => authContainer.classList.add('right-panel-active');
const switchToLogin = () => authContainer.classList.remove('right-panel-active');

toRegisterBtn?.addEventListener('click', switchToRegister);
toLoginBtn?.addEventListener('click', switchToLogin);
mobileToRegister?.addEventListener('click', (e) => { e.preventDefault(); switchToRegister(); });
mobileToLogin?.addEventListener('click', (e) => { e.preventDefault(); switchToLogin(); });

// Check URL Params for Default View (?mode=register)
if (window.location.search.includes('mode=register')) {
  switchToRegister();
}

// ==========================================
// LOGIN FORM SUBMIT
// ==========================================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const message = document.getElementById('loginMessage');
  const loginBtn = document.getElementById('loginBtn');

  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';
  message.textContent = '';
  message.className = 'message';

  try {
    const response = await fetch(`${USER_API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!response.ok) {
      throw new Error(typeof data === 'string' ? data : 'Invalid email or password');
    }

    localStorage.setItem('user', JSON.stringify(data));
    message.textContent = 'Login successful!';
    message.className = 'message success';

    setTimeout(() => { window.location.href = '/'; }, 800);
  } catch (error) {
    message.textContent = error.message || 'Login failed';
    message.className = 'message error';
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
  }
});

// ==========================================
// REGISTER FORM SUBMIT
// ==========================================
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const confirmPassword = document.getElementById('regConfirmPassword').value.trim();
  const message = document.getElementById('registerMessage');
  const registerBtn = document.getElementById('registerBtn');

  if (password !== confirmPassword) {
    message.textContent = 'Passwords do not match';
    message.className = 'message error';
    return;
  }

  if (!/^[0-9]{10}$/.test(phone)) {
    message.textContent = 'Enter a valid 10 digit phone number';
    message.className = 'message error';
    return;
  }

  registerBtn.disabled = true;
  registerBtn.textContent = 'Creating Account...';
  message.textContent = '';
  message.className = 'message';

  try {
    const response = await fetch(USER_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!response.ok) {
      throw new Error(typeof data === 'string' ? data : 'Registration failed');
    }

    message.textContent = 'Account created! Switching to login...';
    message.className = 'message success';
    document.getElementById('registerForm').reset();

    setTimeout(() => {
      switchToLogin();
      message.textContent = '';
    }, 1200);
  } catch (error) {
    message.textContent = error.message || 'Registration failed';
    message.className = 'message error';
  } finally {
    registerBtn.disabled = false;
    registerBtn.textContent = 'Create account';
  }
});