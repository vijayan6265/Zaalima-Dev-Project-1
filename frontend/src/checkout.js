import './style.css';

const ORDER_API =
    'http://localhost:8083/api/orders';

const PRODUCT_API =
    'http://localhost:8082/api/products';

const PAYMENT_API =
    'http://localhost:8085/api/payments';

let cart =
    JSON.parse(
        localStorage.getItem('cart')
    ) || [];


// ==========================================
// GET CURRENT USER
// ==========================================

function getCurrentUser() {

    const user =
        localStorage.getItem('user');

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
// LOAD RAZORPAY SCRIPT
// ==========================================

function loadRazorpayScript() {

    return new Promise((resolve, reject) => {

        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script =
            document.createElement('script');

        script.src =
            'https://checkout.razorpay.com/v1/checkout.js';

        script.onload = () => {
            resolve(true);
        };

        script.onerror = () => {
            reject(
                new Error(
                    'Unable to load Razorpay payment gateway.'
                )
            );
        };

        document.body.appendChild(script);
    });
}


// ==========================================
// IMAGE URL
// ==========================================

function getProductImage(imagePath) {

    if (!imagePath) {

        return 'https://via.placeholder.com/120x120?text=No+Image';
    }

    if (
        imagePath.startsWith('http://') ||
        imagePath.startsWith('https://')
    ) {

        return imagePath;
    }

    const fileName =
        imagePath
            .replace(/^images[\\/]/, '')
            .split('/')
            .pop();

    return `${PRODUCT_API}/image/${encodeURIComponent(fileName)}`;
}


// ==========================================
// CHECK LOGIN
// ==========================================

const currentUser =
    getCurrentUser();

if (!currentUser) {

    alert(
        'Please login before checkout.'
    );

    window.location.href =
        '/login.html';
}


// ==========================================
// INITIAL UI
// ==========================================

document.querySelector(
    '#app'
).innerHTML = `

    <nav class="navbar">

        <div class="logo">
            MiniShop
        </div>

        <div class="nav-links">

            <button
                onclick="goHome()"
            >
                Home
            </button>

            <button
                onclick="goProducts()"
            >
                Products
            </button>

            <button
                onclick="goCart()"
            >
                🛒 Cart

                <span id="cartCount">
                    ${getCartCount()}
                </span>

            </button>

            <span class="welcome">
                Hi,
                ${currentUser?.name || 'User'}
            </span>

            <button
                onclick="logout()"
                class="logout-btn"
            >
                Logout
            </button>

        </div>

    </nav>


    <main class="checkout-page">

        <div class="checkout-header">

            <h1>
                Checkout
            </h1>

            <p>
                Review your order before placing it.
            </p>

        </div>


        <div id="checkoutContainer">
        </div>

    </main>


    <footer>

        <p>
            © 2026 MiniShop. All Rights Reserved.
        </p>

    </footer>

`;


// ==========================================
// CART COUNT
// ==========================================

function getCartCount() {

    return cart.reduce(
        (total, item) =>
            total +
            Number(item.quantity),
        0
    );
}


// ==========================================
// RENDER CHECKOUT
// ==========================================

function renderCheckout() {

    const container =
        document.querySelector(
            '#checkoutContainer'
        );

    if (
        cart.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">
                    🛒
                </div>

                <h2>
                    Your Cart is Empty
                </h2>

                <p>
                    Add some products before checkout.
                </p>

                <button
                    class="continue-shopping-btn"
                    onclick="goProducts()"
                >
                    Continue Shopping
                </button>

            </div>

        `;

        return;
    }


    let subtotal = 0;


    const itemsHTML =
        cart.map(item => {

            const price =
                Number(
                    item.price || 0
                );

            const quantity =
                Number(
                    item.quantity || 0
                );

            const itemTotal =
                price * quantity;

            subtotal +=
                itemTotal;


            const image =
                getProductImage(
                    item.image
                );


            return `

                <div class="checkout-item">

                    <div class="checkout-image">

                        <img
                            src="${image}"
                            alt="${
                                item.name ||
                                item.brand ||
                                'Product'
                            }"

                            onerror="this.src='https://via.placeholder.com/120x120?text=No+Image'"
                        >

                    </div>


                    <div class="checkout-item-info">

                        <h3>

                            ${
                                item.name ||
                                `${item.brand || ''} ${item.model || ''}`
                            }

                        </h3>

                        <p>

                            ₹${
                                price.toLocaleString(
                                    'en-IN'
                                )
                            }

                            ×

                            ${quantity}

                        </p>

                    </div>


                    <strong>

                        ₹${
                            itemTotal.toLocaleString(
                                'en-IN'
                            )
                        }

                    </strong>

                </div>

            `;

        }).join('');


    const delivery =
        subtotal >= 1000
            ? 0
            : 50;


    const total =
        subtotal +
        delivery;


    container.innerHTML = `

        <div class="checkout-layout">


            <!-- LEFT -->

            <div class="checkout-left">


                <div class="checkout-card">

                    <h2>
                        Customer Details
                    </h2>


                    <div class="customer-details">


                        <div>

                            <span>
                                Name
                            </span>

                            <strong>

                                ${
                                    currentUser.name ||
                                    '-'
                                }

                            </strong>

                        </div>


                        <div>

                            <span>
                                Email
                            </span>

                            <strong>

                                ${
                                    currentUser.email ||
                                    '-'
                                }

                            </strong>

                        </div>


                        <div>

                            <span>
                                Phone
                            </span>

                            <strong>

                                ${
                                    currentUser.phone ||
                                    '-'
                                }

                            </strong>

                        </div>


                        <div>

                            <span>
                                User ID
                            </span>

                            <strong>

                                ${currentUser.id}

                            </strong>

                        </div>

                    </div>

                </div>


                <div class="checkout-card">

                    <h2>
                        Your Products
                    </h2>


                    <div class="checkout-items">

                        ${itemsHTML}

                    </div>

                </div>


            </div>


            <!-- RIGHT -->

            <div class="checkout-summary">

                <h2>
                    Order Summary
                </h2>


                <div class="summary-row">

                    <span>
                        Subtotal
                    </span>

                    <span>

                        ₹${
                            subtotal.toLocaleString(
                                'en-IN'
                            )
                        }

                    </span>

                </div>


                <div class="summary-row">

                    <span>
                        Delivery
                    </span>

                    <span>

                        ${
                            delivery === 0
                                ? 'FREE'
                                : `₹${delivery}`
                        }

                    </span>

                </div>


                <hr>


                <div class="summary-total">

                    <span>
                        Total
                    </span>

                    <strong>

                        ₹${
                            total.toLocaleString(
                                'en-IN'
                            )
                        }

                    </strong>

                </div>


                <button
                    class="order-btn"
                    id="placeOrderBtn"
                    onclick="placeOrder()"
                    aria-label="Pay Now"
                >

                    <span class="btn-text default-text">
                        Pay Now
                    </span>


                    <span class="btn-text success-text">

                        <svg
                            class="check-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="3"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >

                            <polyline
                                points="20 6 9 17 4 12"
                            ></polyline>

                        </svg>


                        <span>
                            Order Placed
                        </span>

                    </span>


                    <div class="road-dashed"></div>


                    <div class="box-wrapper">

                        <svg
                            class="box-svg"
                            viewBox="0 0 26 24"
                            fill="none"
                        >

                            <rect
                                width="26"
                                height="24"
                                rx="4"
                                fill="#E5A853"
                            />

                            <rect
                                x="9.5"
                                width="7"
                                height="24"
                                fill="#C48432"
                            />

                            <line
                                x1="0"
                                y1="1"
                                x2="26"
                                y2="1"
                                stroke="#FCE7C8"
                                stroke-opacity="0.6"
                            />

                        </svg>

                    </div>


                    <div
                        class="truck-wrapper"
                        id="truckWrapper"
                    >

                        <svg
                            class="truck-svg"
                            viewBox="0 0 140 48"
                            fill="none"
                        >

                            <defs>

                                <linearGradient
                                    id="beamGlow"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="0%"
                                >

                                    <stop
                                        offset="0%"
                                        stop-color="#FDE047"
                                        stop-opacity="0.85"
                                    />

                                    <stop
                                        offset="40%"
                                        stop-color="#FACC15"
                                        stop-opacity="0.45"
                                    />

                                    <stop
                                        offset="85%"
                                        stop-color="#FACC15"
                                        stop-opacity="0.1"
                                    />

                                    <stop
                                        offset="100%"
                                        stop-color="#FACC15"
                                        stop-opacity="0"
                                    />

                                </linearGradient>

                            </defs>


                            <g class="light-beams">

                                <polygon
                                    points="96,7 165,-8 165,24"
                                    fill="url(#beamGlow)"
                                />

                                <polygon
                                    points="96,41 165,24 165,56"
                                    fill="url(#beamGlow)"
                                />

                                <polygon
                                    points="96,24 175,10 175,38"
                                    fill="url(#beamGlow)"
                                    opacity="0.5"
                                />

                            </g>


                            <line
                                x1="72"
                                y1="4"
                                x2="65"
                                y2="-1"
                                stroke="#ffffff"
                                stroke-width="2.5"
                                stroke-linecap="round"
                            />


                            <line
                                x1="72"
                                y1="44"
                                x2="65"
                                y2="49"
                                stroke="#ffffff"
                                stroke-width="2.5"
                                stroke-linecap="round"
                            />


                            <g class="truck-doors">

                                <line
                                    class="door-top"
                                    x1="16"
                                    y1="4"
                                    x2="16"
                                    y2="24"
                                    stroke="#ffffff"
                                    stroke-width="3"
                                    stroke-linecap="round"
                                />

                                <line
                                    class="door-bottom"
                                    x1="16"
                                    y1="44"
                                    x2="16"
                                    y2="24"
                                    stroke="#ffffff"
                                    stroke-width="3"
                                    stroke-linecap="round"
                                />

                            </g>


                            <rect
                                x="16"
                                y="4"
                                width="56"
                                height="40"
                                rx="4"
                                fill="#FFFFFF"
                            />


                            <line
                                x1="62"
                                y1="4"
                                x2="62"
                                y2="44"
                                stroke="#E2E8F0"
                                stroke-width="1.5"
                            />


                            <path
                                d="M72 4 H88 C94 4 98 9 98 24 C98 39 94 44 88 44 H72 V4 Z"
                                fill="#2563EB"
                            />


                            <path
                                d="M76 7 H86 C89.5 7 92 11 92 24 C92 37 89.5 41 86 41 H76 V7 Z"
                                fill="#0F172A"
                            />


                            <line
                                x1="79"
                                y1="10"
                                x2="89"
                                y2="20"
                                stroke="#FFFFFF"
                                stroke-opacity="0.35"
                                stroke-width="2.5"
                                stroke-linecap="round"
                            />


                            <rect
                                class="headlight-top"
                                x="94"
                                y="6"
                                width="4"
                                height="7"
                                rx="1.5"
                                fill="#FACCB1"
                            />


                            <rect
                                class="headlight-bottom"
                                x="94"
                                y="35"
                                width="4"
                                height="7"
                                rx="1.5"
                                fill="#FACCB1"
                            />

                        </svg>

                    </div>

                </button>


                <button
                    class="back-cart-btn"
                    onclick="goCart()"
                >
                    Back to Cart
                </button>


                <p
                    id="orderMessage"
                    class="message"
                ></p>

            </div>

        </div>

    `;
}


// ==========================================
// PLACE ORDER / PAYMENT
// ==========================================

async function placeOrder() {

    const user = getCurrentUser();

    if (!user) {

        alert('Please login before placing order.');

        window.location.href = '/login.html';

        return;
    }

    if (cart.length === 0) {

        alert('Your cart is empty.');

        return;
    }

    const orderBtn =
        document.querySelector('#placeOrderBtn');

    const truckWrapper =
        document.querySelector('#truckWrapper');

    const message =
        document.querySelector('#orderMessage');

    message.textContent = '';
    message.className = 'message';

    const delay = (ms) =>
        new Promise(res => setTimeout(res, ms));


    try {

        // ==========================================
        // 1. CHECK PRODUCT STATUS + STOCK
        // ==========================================

        let subtotal = 0;

        for (const item of cart) {

            const response =
                await fetch(
                    `${PRODUCT_API}/${item.id}`
                );

            if (!response.ok) {

                throw new Error(
                    `Unable to check product ${item.id}`
                );
            }

            const product =
                await response.json();


            // PRODUCT STATUS

            if (
                product.status !== 'ACTIVE'
            ) {

                throw new Error(
                    `${product.name || item.name || 'This product'} is currently unavailable.`
                );
            }


            // STOCK

            const stock =
                Number(product.quantity || 0);

            if (
                Number(item.quantity) > stock
            ) {

                throw new Error(
                    `${item.name || 'This product'} has only ${stock} item(s) available.`
                );
            }


            subtotal +=
                Number(item.price || 0) *
                Number(item.quantity || 0);
        }


        // ==========================================
        // 2. CALCULATE TOTAL
        // ==========================================

        const delivery =
            subtotal >= 1000
                ? 0
                : 50;

        const total =
            subtotal + delivery;


        // ==========================================
        // 3. CREATE ACTUAL ORDER FIRST
        // ==========================================

        message.textContent =
            'Creating your order...';


        const createdOrders = [];


        for (const item of cart) {

            const orderData = {

                userId:
                    Number(user.id),

                productId:
                    Number(item.id),

                quantity:
                    Number(item.quantity || 0),

                totalPrice:
                    Number(item.price || 0) *
                    Number(item.quantity || 0)
            };


            const orderResponse =
                await fetch(
                    ORDER_API,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                orderData
                            )
                    }
                );


            if (!orderResponse.ok) {

                const errorText =
                    await orderResponse.text();

                throw new Error(
                    errorText ||
                    'Unable to create order.'
                );
            }


            const createdOrder =
                await orderResponse.json();


            console.log(
                'Actual Created Order:',
                createdOrder
            );


            // IMPORTANT
            // Database generated ID

            if (!createdOrder.id) {

                throw new Error(
                    'Order was created but Order ID was not returned.'
                );
            }


            createdOrders.push(
                createdOrder
            );
        }


        // ==========================================
        // FIRST ORDER ID
        // ==========================================

        const firstOrderId =
            createdOrders[0].id;


        console.log(
            'REAL ORDER ID:',
            firstOrderId
        );


        // ==========================================
        // 4. LOAD RAZORPAY
        // ==========================================

        await loadRazorpayScript();


        // ==========================================
        // 5. CREATE RAZORPAY ORDER
        // ==========================================

        message.textContent =
            'Creating secure payment...';


        const paymentOrderResponse =
            await fetch(
                `${PAYMENT_API}/create-order`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body:
                        JSON.stringify({

                            // ==================================
                            // REAL DATABASE ORDER ID
                            // ==================================

                            orderId:
                                Number(firstOrderId),

                            userId:
                                Number(user.id),

                            amount:
                                total,

                            paymentMethod:
                                'RAZORPAY'
                        })
                }
            );


        if (!paymentOrderResponse.ok) {

            const errorText =
                await paymentOrderResponse.text();

            throw new Error(
                errorText ||
                'Unable to create Razorpay order.'
            );
        }


        const razorpayOrder =
            await paymentOrderResponse.json();


        console.log(
            'Razorpay Order:',
            razorpayOrder
        );


        // ==========================================
        // 6. OPEN RAZORPAY
        // ==========================================

        const options = {

            key:
                razorpayOrder.keyId,

            amount:
                razorpayOrder.amount,

            currency:
                razorpayOrder.currency,

            name:
                'MiniShop',

            description:
                'MiniShop E-Commerce Payment',

            order_id:
                razorpayOrder.razorpayOrderId,


            prefill: {

                name:
                    user.name || '',

                email:
                    user.email || '',

                contact:
                    user.phone || ''
            },


            notes: {

                orderId:
                    String(firstOrderId),

                userId:
                    String(user.id),

                cartItems:
                    String(cart.length)
            },


            theme: {

                color:
                    '#2563EB'
            },


            // ==========================================
            // PAYMENT SUCCESS
            // ==========================================

            handler:
                async function(razorpayResponse) {

                    try {

                        console.log(
                            'Razorpay Success:',
                            razorpayResponse
                        );


                        message.textContent =
                            'Verifying payment...';


                        // ==================================
                        // 7. VERIFY PAYMENT
                        // ==================================

                        const verifyResponse =
                            await fetch(
                                `${PAYMENT_API}/verify`,
                                {
                                    method: 'POST',

                                    headers: {
                                        'Content-Type':
                                            'application/json'
                                    },

                                    body:
                                        JSON.stringify({

                                            razorpayOrderId:
                                                razorpayResponse.razorpay_order_id,

                                            razorpayPaymentId:
                                                razorpayResponse.razorpay_payment_id,

                                            razorpaySignature:
                                                razorpayResponse.razorpay_signature
                                        })
                                }
                            );


                        if (!verifyResponse.ok) {

                            const errorText =
                                await verifyResponse.text();

                            throw new Error(
                                errorText ||
                                'Payment verification failed.'
                            );
                        }


                        const verifiedPayment =
                            await verifyResponse.json();


                        console.log(
                            'Verified Payment:',
                            verifiedPayment
                        );


                        // ==================================
                        // 8. CONFIRM ALL CREATED ORDERS
                        // ==================================

                        message.textContent =
                            'Payment successful. Confirming your order...';


                        for (
                            const order of createdOrders
                        ) {

                            const statusResponse =
                                await fetch(
                                    `${ORDER_API}/${order.id}/status?status=CONFIRMED`,
                                    {
                                        method: 'PUT'
                                    }
                                );


                            if (!statusResponse.ok) {

                                const errorText =
                                    await statusResponse.text();

                                throw new Error(
                                    errorText ||
                                    `Unable to confirm Order #${order.id}`
                                );
                            }


                            const confirmedOrder =
                                await statusResponse.json();


                            console.log(
                                'Confirmed Order:',
                                confirmedOrder
                            );
                        }


                        // ==================================
                        // 9. START ANIMATION
                        // ==================================

                        orderBtn.classList.add(
                            'animating',
                            'show-box'
                        );


                        await delay(250);


                        truckWrapper.style.transition =
                            'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';


                        truckWrapper.style.transform =
                            'translateX(100px)';


                        await delay(500);


                        truckWrapper.classList.add(
                            'doors-open'
                        );


                        await delay(350);


                        truckWrapper.style.transition =
                            'transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)';


                        truckWrapper.style.transform =
                            'translateX(36px)';


                        await delay(330);


                        orderBtn.classList.add(
                            'box-loaded'
                        );


                        await delay(420);


                        truckWrapper.classList.remove(
                            'doors-open'
                        );


                        await delay(500);


                        // ==================================
                        // 10. DRIVE TRUCK OUT
                        // ==================================

                        truckWrapper.classList.add(
                            'lights-on'
                        );


                        orderBtn.classList.add(
                            'speeding'
                        );


                        truckWrapper.style.transition =
                            'transform 1.8s cubic-bezier(0.2, 0, 0.4, 1)';


                        truckWrapper.style.transform =
                            'translateX(280px)';


                        await delay(1800);


                        // ==================================
                        // 11. COMPLETE
                        // ==================================

                        localStorage.removeItem(
                            'cart'
                        );


                        cart = [];


                        orderBtn.classList.remove(
                            'speeding',
                            'show-box'
                        );


                        truckWrapper.classList.remove(
                            'lights-on'
                        );


                        orderBtn.classList.add(
                            'completed'
                        );


                        message.textContent =
                            `Payment successful! Order #${firstOrderId} placed successfully.`;


                        message.className =
                            'message success';


                        setTimeout(() => {

                            window.location.href =
                                '/orders.html';

                        }, 1500);


                    } catch (error) {

                        console.error(
                            'Payment / Order Error:',
                            error
                        );


                        orderBtn.classList.remove(
                            'animating',
                            'show-box',
                            'box-loaded'
                        );


                        truckWrapper.classList.remove(
                            'doors-open',
                            'lights-on'
                        );


                        truckWrapper.style.transition =
                            'none';


                        truckWrapper.style.transform =
                            'translateX(270px)';


                        message.textContent =
                            error.message ||
                            'Payment verification failed.';


                        message.className =
                            'message error';
                    }
                },


            // ==========================================
            // MODAL DISMISSED
            // ==========================================

            modal: {

                ondismiss:
                    function() {

                        console.log(
                            'Razorpay checkout closed.'
                        );


                        message.textContent =
                            'Payment cancelled.';


                        message.className =
                            'message error';
                    }
            }
        };


        // ==========================================
        // RAZORPAY INSTANCE
        // ==========================================

        const razorpay =
            new window.Razorpay(
                options
            );


        // ==========================================
        // PAYMENT FAILED
        // ==========================================

        razorpay.on(
            'payment.failed',
            function(response) {

                console.error(
                    'Razorpay Payment Failed:',
                    response
                );


                message.textContent =
                    response.error?.description ||
                    'Payment failed. Please try again.';


                message.className =
                    'message error';
            }
        );


        // ==========================================
        // OPEN RAZORPAY
        // ==========================================

        razorpay.open();


    } catch (error) {

        console.error(
            'Checkout Error:',
            error
        );


        const orderBtn =
            document.querySelector(
                '#placeOrderBtn'
            );

        const truckWrapper =
            document.querySelector(
                '#truckWrapper'
            );

        const message =
            document.querySelector(
                '#orderMessage'
            );


        orderBtn?.classList.remove(
            'animating',
            'show-box',
            'box-loaded'
        );


        truckWrapper?.classList.remove(
            'doors-open',
            'lights-on'
        );


        if (truckWrapper) {

            truckWrapper.style.transition =
                'none';

            truckWrapper.style.transform =
                'translateX(270px)';
        }


        message.textContent =
            error.message ||
            'Payment initialization failed.';


        message.className =
            'message error';
    }
}


// ==========================================
// NAVIGATION
// ==========================================

function goHome() {

    window.location.href =
        '/';
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

    localStorage.removeItem(
        'user'
    );

    localStorage.removeItem(
        'cart'
    );

    window.location.href =
        '/';
}


// ==========================================
// GLOBAL
// ==========================================

window.placeOrder =
    placeOrder;

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

renderCheckout();


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