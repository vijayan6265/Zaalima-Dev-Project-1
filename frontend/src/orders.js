import './style.css';

const ORDER_API = 'http://localhost:8083/api/orders';

//const ORDER_API = 'http://192.168.1.5:8083/api/orders';


// ==========================================
// GET USER
// ==========================================

function getCurrentUser() {

    const user = localStorage.getItem('user');

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {

        localStorage.removeItem('user');

        return null;
    }
}


// ==========================================
// USER LOGIN CHECK
// ==========================================

const currentUser = getCurrentUser();

if (!currentUser) {

    alert('Please login to view your orders.');

    window.location.href = '/login.html';
}


// ==========================================
// UI
// ==========================================

document.querySelector('#app').innerHTML = `

    <nav class="navbar">

        <div class="logo">
            MiniShop
        </div>

        <div class="nav-links">

            <button onclick="goHome()">
                Home
            </button>

            <button onclick="goProducts()">
                Products
            </button>

            <button onclick="goCart()">
                🛒 Cart
            </button>

            <span class="welcome">
                Hi, ${currentUser?.name || 'User'}
            </span>

            <button
                onclick="logout()"
                class="logout-btn"
            >
                Logout
            </button>

        </div>

    </nav>


    <main class="orders-page">

        <div class="orders-header">

            <div>

                <h1>
                    My Orders
                </h1>

                <p>
                    Track your recent orders
                </p>

            </div>

            <button
                class="refresh-btn"
                onclick="loadOrders()"
            >
                ↻ Refresh
            </button>

        </div>


        <div id="ordersContainer">

            <div class="loading">
                Loading your orders...
            </div>

        </div>

    </main>


    <footer>

        <p>
            © 2026 MiniShop. All Rights Reserved.
        </p>

    </footer>

`;


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    const container =
        document.querySelector('#ordersContainer');


    container.innerHTML = `

        <div class="loading">
            Loading your orders...
        </div>

    `;


    try {

        /*
         * Current user ID
         */

        const userId =
            currentUser.id;


        /*
         * We first try:
         *
         * GET /api/orders/user/{userId}
         */

        const response =
            await fetch(
                `${ORDER_API}/user/${userId}`
            );


        if (!response.ok) {

            throw new Error(
                `Unable to load orders (${response.status})`
            );
        }


        const orders =
            await response.json();


        displayOrders(orders);


    } catch (error) {

        console.error(
            'Orders Error:',
            error
        );


        container.innerHTML = `

            <div class="orders-error">

                <h3>
                    Unable to load orders
                </h3>

                <p>
                    ${error.message}
                </p>

                <button
                    onclick="loadOrders()"
                >
                    Try Again
                </button>

            </div>

        `;
    }
}


// ==========================================
// DISPLAY ORDERS
// ==========================================

function displayOrders(orders) {

    const container =
        document.querySelector('#ordersContainer');


    if (!orders || orders.length === 0) {

        container.innerHTML = `

            <div class="empty-orders">

                <div class="empty-orders-icon">
                    📦
                </div>

                <h2>
                    No Orders Yet
                </h2>

                <p>
                    You haven't placed any orders yet.
                </p>

                <button
                    onclick="goProducts()"
                >
                    Start Shopping
                </button>

            </div>

        `;

        return;
    }


    /*
     * Latest orders first
     */

    orders.sort(
        (a, b) =>
            Number(b.id) - Number(a.id)
    );


    container.innerHTML =
        orders.map(order => {

            const status =
                String(
                    order.status || 'PENDING'
                ).toUpperCase();


            const statusClass =
                status.toLowerCase();


            const price =
                Number(
                    order.totalPrice || 0
                );


            const canCancel =
                status === 'PENDING' ||
                status === 'CONFIRMED';


            return `

                <div class="order-card">


                    <div class="order-top">

                        <div>

                            <span class="order-label">
                                Order ID
                            </span>

                            <h3>
                                #${order.id}
                            </h3>

                        </div>


                        <span
                            class="status ${statusClass}"
                        >
                            ${status}
                        </span>

                    </div>


                    <div class="order-details">


                        <div class="order-detail">

                            <span>
                                Product ID
                            </span>

                            <strong>
                                ${order.productId}
                            </strong>

                        </div>


                        <div class="order-detail">

                            <span>
                                Quantity
                            </span>

                            <strong>
                                ${order.quantity}
                            </strong>

                        </div>


                        <div class="order-detail">

                            <span>
                                Total Price
                            </span>

                            <strong>
                                ₹${price.toLocaleString('en-IN')}
                            </strong>

                        </div>


                        <div class="order-detail">

                            <span>
                                User ID
                            </span>

                            <strong>
                                ${order.userId}
                            </strong>

                        </div>


                    </div>


                    <div class="order-bottom">


                        <div class="order-progress">

                            ${getProgressHTML(status)}

                        </div>


                        ${
                            canCancel
                                ? `
                                    <button
                                        class="cancel-order-btn"
                                        onclick="cancelOrder(${order.id})"
                                    >
                                        Cancel Order
                                    </button>
                                  `
                                : ''
                        }


                    </div>

                </div>

            `;

        }).join('');
}


// ==========================================
// ORDER PROGRESS
// ==========================================

function getProgressHTML(status) {

    const statuses = [
        'PENDING',
        'CONFIRMED',
        'SHIPPED',
        'DELIVERED'
    ];


    if (status === 'CANCELLED') {

        return `

            <div class="cancelled-progress">

                <span>
                    ✕
                </span>

                <strong>
                    Order Cancelled
                </strong>

            </div>

        `;
    }


    const currentIndex =
        statuses.indexOf(status);


    return `

        <div class="progress-line">

            ${statuses.map(
                (item, index) => {

                    const completed =
                        index <= currentIndex;

                    return `

                        <div
                            class="
                                progress-step
                                ${
                                    completed
                                        ? 'completed'
                                        : ''
                                }
                            "
                        >

                            <div class="progress-circle">

                                ${
                                    completed
                                        ? '✓'
                                        : index + 1
                                }

                            </div>

                            <span>
                                ${item}
                            </span>

                        </div>

                    `;
                }
            ).join('')}

        </div>

    `;
}


// ==========================================
// CANCEL ORDER
// ==========================================

async function cancelOrder(orderId) {

    const confirmCancel =
        confirm(
            `Are you sure you want to cancel Order #${orderId}?`
        );

    if (!confirmCancel) {
        return;
    }

    try {

        const response =
            await fetch(
                `${ORDER_API}/${orderId}/status?status=CANCELLED`,
                {
                    method: 'PUT'
                }
            );

        const text =
            await response.text();

        if (!response.ok) {

            throw new Error(
                text || 'Unable to cancel order'
            );
        }

        alert(
            'Order cancelled successfully.'
        );

        loadOrders();

    } catch (error) {

        console.error(
            'Cancel Order Error:',
            error
        );

        alert(
            error.message ||
            'Failed to cancel order'
        );
    }
}


// ==========================================
// NAVIGATION
// ==========================================

function goHome() {

    window.location.href = '/';
}


function goProducts() {

    window.location.href =
        '/#productsSection';
}


function goCart() {

    window.location.href =
        '/cart.html';
}


function logout() {

    localStorage.removeItem('user');

    localStorage.removeItem('cart');

    window.location.href =
        '/';
}


// ==========================================
// GLOBAL
// ==========================================

window.loadOrders =
    loadOrders;

window.cancelOrder =
    cancelOrder;

window.goHome =
    goHome;

window.goProducts =
    goProducts;

window.goCart =
    goCart;

window.logout =
    logout;


// ==========================================
// INITIALIZE
// ==========================================

loadOrders();


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
