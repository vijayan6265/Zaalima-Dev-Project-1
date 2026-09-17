import './style.css';

const USER_API = 'http://localhost:8081/api/users';

//const USER_API = 'http://192.168.1.5:8081/api/users';

document.querySelector('#app').innerHTML = `
    <div class="auth-page">
    
        <div class="auth-card">

            <div class="auth-logo">
                MiniShop
            </div>

            <h2>Welcome Back</h2>

            <p class="auth-subtitle">
                Login to your account
            </p>

            <form id="loginForm">

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

                    <label>Password</label>

                    <input
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        required
                    >

                </div>

                <button
                    type="submit"
                    class="auth-btn"
                    id="loginBtn"
                >
                    Login
                </button>

            </form>

            <p id="message" class="message"></p>

            <div class="auth-footer">

                <p>
                    Don't have an account?
                    <a href="/register.html">
                        Register
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
// LOGIN
// ==========================================

document
    .querySelector('#loginForm')
    .addEventListener('submit', async (event) => {

        event.preventDefault();

        const email =
            document.querySelector('#email')
                .value
                .trim();

        const password =
            document.querySelector('#password')
                .value
                .trim();

        const message =
            document.querySelector('#message');

        const loginBtn =
            document.querySelector('#loginBtn');

        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';

        message.textContent = '';
        message.className = 'message';

        try {

            const response = await fetch(
                `${USER_API}/login`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            /*
             * Backend returns:
             *
             * SUCCESS:
             * User object
             *
             * FAILURE:
             * "Invalid email or password"
             */

            const text = await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                data = text;
            }

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : 'Invalid email or password'
                );
            }

            // ==========================================
            // SAVE LOGGED-IN USER
            // ==========================================

            localStorage.setItem(
                'user',
                JSON.stringify(data)
            );

            message.textContent =
                'Login successful!';

            message.className =
                'message success';

            // ==========================================
            // REDIRECT HOME
            // ==========================================

            setTimeout(() => {

                window.location.href = '/';

            }, 800);

        } catch (error) {

            console.error(
                'Login Error:',
                error
            );

            message.textContent =
                error.message ||
                'Login failed';

            message.className =
                'message error';

        } finally {

            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
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


  