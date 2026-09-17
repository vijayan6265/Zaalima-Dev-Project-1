import './style.css';

const USER_API = 'http://localhost:8081/api/users';

//const USER_API = 'http://192.168.1.5:8081/api/users';

document.querySelector('#app').innerHTML = `
    <div class="auth-page">

        <div class="auth-card">

            <div class="auth-logo">
                MiniShop
            </div>

            <h2>Create Account</h2>

            <p class="auth-subtitle">
                Register a new account
            </p>

            <form id="registerForm">

                <div class="form-group">

                    <label>Name</label>

                    <input
                        type="text"
                        id="name"
                        placeholder="Enter your name"
                        required
                    >

                </div>

                <div class="form-group">

                    <label>Email</label>

                    <input
                        type="email"
                        id="email"
                        placeholder="Enter your email"
                        required
                    >

                </div>

                <div class="form-group">

                    <label>Phone</label>

                    <input
                        type="tel"
                        id="phone"
                        placeholder="Enter your phone number"
                        required
                    >

                </div>

                <div class="form-group">

                    <label>Password</label>

                    <input
                        type="password"
                        id="password"
                        placeholder="Enter password"
                        required
                    >

                </div>

                <div class="form-group">

                    <label>Confirm Password</label>

                    <input
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm password"
                        required
                    >

                </div>

                <button
                    type="submit"
                    class="auth-btn"
                    id="registerBtn"
                >
                    Register
                </button>

            </form>

            <p id="message" class="message"></p>

            <div class="auth-footer">

                <p>
                    Already have an account?
                    <a href="/login.html">
                        Login
                    </a>
                </p>

                <a href="/">
                    ← Back to Home
                </a>

            </div>

        </div>

    </div>
`;

// ==========================================
// REGISTER
// ==========================================

document
    .querySelector('#registerForm')
    .addEventListener('submit', async (event) => {

        event.preventDefault();

        const name =
            document.querySelector('#name')
                .value
                .trim();

        const email =
            document.querySelector('#email')
                .value
                .trim();

        const phone =
            document.querySelector('#phone')
                .value
                .trim();

        const password =
            document.querySelector('#password')
                .value
                .trim();

        const confirmPassword =
            document.querySelector('#confirmPassword')
                .value
                .trim();

        const message =
            document.querySelector('#message');

        const registerBtn =
            document.querySelector('#registerBtn');

        // ==========================================
        // PASSWORD VALIDATION
        // ==========================================

        if (password !== confirmPassword) {

            message.textContent =
                'Passwords do not match';

            message.className =
                'message error';

            return;
        }

        // ==========================================
        // PHONE VALIDATION
        // ==========================================

        if (!/^[0-9]{10}$/.test(phone)) {

            message.textContent =
                'Enter a valid 10 digit phone number';

            message.className =
                'message error';

            return;
        }

        registerBtn.disabled = true;
        registerBtn.textContent = 'Creating Account...';

        message.textContent = '';
        message.className = 'message';

        try {

            const response = await fetch(
                USER_API,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        phone: phone,
                        password: password
                    })
                }
            );

            /*
             * Backend UserController:
             *
             * @PostMapping
             * ResponseEntity<User>
             */

            const text = await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }

            if (!response.ok) {

                if (
                    response.status === 409 ||
                    response.status === 400
                ) {
                    throw new Error(
                        typeof data === 'string'
                            ? data
                            : 'Email already exists or invalid data'
                    );
                }

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : 'Registration failed'
                );
            }

            // ==========================================
            // SUCCESS
            // ==========================================

            message.textContent =
                'Registration successful! Redirecting to login...';

            message.className =
                'message success';

            document
                .querySelector('#registerForm')
                .reset();

            setTimeout(() => {

                window.location.href =
                    '/login.html';

            }, 1200);

        } catch (error) {

            console.error(
                'Registration Error:',
                error
            );

            message.textContent =
                error.message ||
                'Registration failed';

            message.className =
                'message error';

        } finally {

            registerBtn.disabled = false;
            registerBtn.textContent = 'Register';
        }
    });



    //smooth behaviour



  // Add dynamic overlay for 1-second smooth click loader
  document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.createElement('div');
    overlay.className = 'page-loading-overlay';
    document.body.appendChild(overlay);

    document.querySelectorAll('a, button').forEach(element => {
      element.addEventListener('click', (e) => {
        // Skip for simple submit inputs or same-page interactions if needed
        if (element.classList.contains('no-loader')) return;

        overlay.classList.add('active');
        setTimeout(() => {
          overlay.classList.remove('active');
        }, 1000); // Exact 1-second smooth loading screen delay
      });
    });
  });
