import './style.css';

const PRODUCT_API =
    'http://localhost:8082/api/products';

// const PRODUCT_API =
//     'http://192.168.1.5:8082/api/products';

let cart =
    JSON.parse(
        localStorage.getItem('cart')
    ) || [];

let products = [];


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

        localStorage.removeItem(
            'user'
        );

        return null;
    }
}


// ==========================================
// IMAGE URL
// ==========================================

function getProductImage(imagePath) {

    if (!imagePath) {

        return 'https://via.placeholder.com/150x150?text=No+Image';
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
// SAVE CART
// ==========================================

function saveCart() {

    localStorage.setItem(
        'cart',
        JSON.stringify(cart)
    );
}


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
                class="cart-btn"
            >
                🛒 Cart

                <span id="cartCount">
                    ${getCartCount()}
                </span>

            </button>


            <div id="authArea"></div>

        </div>

    </nav>


    <main class="cart-page">

        <div class="cart-header">

            <h1>
                Shopping Cart
            </h1>

            <p id="cartSubtitle"></p>

        </div>


        <div id="cartContainer">

        </div>

    </main>


    <footer>

        <p>
            © 2026 MiniShop. All Rights Reserved.
        </p>

    </footer>

`;


// ==========================================
// AUTH AREA
// ==========================================

function updateAuthArea() {

    const authArea =
        document.querySelector(
            '#authArea'
        );


    const user =
        getCurrentUser();


    if (user) {

        authArea.innerHTML = `

            <span class="welcome">

                Hi,
                ${user.name || 'User'}

            </span>


            <button
                onclick="logout()"
                class="logout-btn"
            >
                Logout
            </button>

        `;

    } else {

        authArea.innerHTML = `

            <button
                onclick="showLogin()"
            >
                Login
            </button>


            <button
                onclick="showRegister()"
            >
                Register
            </button>

        `;
    }
}


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    try {

        const response =
            await fetch(
                PRODUCT_API
            );


        if (response.ok) {

            products =
                await response.json();
        }

    } catch (error) {

        console.error(
            'Product loading error:',
            error
        );
    }


    renderCart();
}


// ==========================================
// RENDER CART
// ==========================================

function renderCart() {

    const container =
        document.querySelector(
            '#cartContainer'
        );


    const subtitle =
        document.querySelector(
            '#cartSubtitle'
        );


    const cartCount =
        getCartCount();


    document.querySelector(
        '#cartCount'
    ).textContent =
        cartCount;


    if (cart.length === 0) {

        subtitle.textContent =
            'Your cart is empty';


        container.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">
                    🛒
                </div>


                <h2>
                    Your Cart is Empty
                </h2>


                <p>
                    Looks like you haven't added
                    anything to your cart yet.
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


    subtitle.textContent =
        `${cartCount} item(s) in your cart`;


    let subtotal = 0;


    const cartItemsHTML =
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


            // ==========================================
            // PRODUCT IMAGE
            // ==========================================

            const image =
                getProductImage(
                    item.image
                );


            return `

                <div class="cart-item">


                    <div class="cart-product-image">

                        <img
                            src="${image}"
                            alt="${
                                item.name ||
                                item.brand ||
                                'Product'
                            }"
                            onerror="this.src='https://via.placeholder.com/150x150?text=No+Image'"
                        >

                    </div>


                    <div class="cart-product-info">

                        <span class="cart-category">

                            ${
                                item.category ||
                                'Product'
                            }

                        </span>


                        <h3>

                            ${
                                item.name ||
                                `${item.brand || ''} ${item.model || ''}`
                            }

                        </h3>


                        <p class="cart-price">

                            ₹${
                                price.toLocaleString(
                                    'en-IN'
                                )
                            }

                        </p>

                    </div>


                    <div class="quantity-control">

                        <button
                            onclick="decreaseQuantity(${item.id})"
                        >
                            −
                        </button>


                        <span>
                            ${quantity}
                        </span>


                        <button
                            onclick="increaseQuantity(${item.id})"
                        >
                            +
                        </button>

                    </div>


                    <div class="item-total">

                        ₹${
                            itemTotal.toLocaleString(
                                'en-IN'
                            )
                        }

                    </div>


                    <button
                        class="remove-btn"
                        onclick="removeFromCart(${item.id})"
                    >
                        Remove
                    </button>

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

        <div class="cart-layout">


            <div class="cart-items">

                ${cartItemsHTML}

            </div>


            <div class="cart-summary">

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
                    class="checkout-btn"
                    onclick="proceedToCheckout()"
                >
                    Proceed to Checkout
                </button>


                <button
                    class="continue-btn"
                    onclick="goProducts()"
                >
                    Continue Shopping
                </button>

            </div>

        </div>

    `;
}


// ==========================================
// INCREASE QUANTITY
// ==========================================

async function increaseQuantity(
    productId
) {

    const item =
        cart.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!item) {

        return;
    }


    /*
     * Check current stock from Product Service
     */

    try {

        const response =
            await fetch(
                `${PRODUCT_API}/${productId}`
            );


        if (response.ok) {

            const product =
                await response.json();


            const stock =
                Number(
                    product.quantity || 0
                );


            if (
                item.quantity >=
                stock
            ) {

                alert(
                    `Only ${stock} item(s) available`
                );

                return;
            }
        }

    } catch (error) {

        console.error(
            'Stock check failed:',
            error
        );
    }


    item.quantity++;


    saveCart();

    renderCart();
}


// ==========================================
// DECREASE QUANTITY
// ==========================================

function decreaseQuantity(
    productId
) {

    const item =
        cart.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!item) {

        return;
    }


    if (
        item.quantity > 1
    ) {

        item.quantity--;

    } else {

        cart =
            cart.filter(
                item =>
                    Number(item.id) !==
                    Number(productId)
            );
    }


    saveCart();

    renderCart();
}


// ==========================================
// REMOVE
// ==========================================

function removeFromCart(
    productId
) {

    const item =
        cart.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!item) {

        return;
    }


    const confirmRemove =
        confirm(
            `Remove ${
                item.name ||
                `${item.brand || ''} ${item.model || ''}`
            } from cart?`
        );


    if (!confirmRemove) {

        return;
    }


    cart =
        cart.filter(
            item =>
                Number(item.id) !==
                Number(productId)
        );


    saveCart();

    renderCart();
}


// ==========================================
// CHECKOUT
// ==========================================

function proceedToCheckout() {

    const user =
        getCurrentUser();


    if (!user) {

        alert(
            'Please login before checkout.'
        );


        window.location.href =
            '/login.html';


        return;
    }


    if (
        cart.length === 0
    ) {

        alert(
            'Your cart is empty.'
        );


        return;
    }


    /*
     * Next step:
     *
     * Checkout page
     * User ID
     * Product ID
     * Quantity
     * Total price
     * Place Order
     */

    window.location.href =
        '/checkout.html';
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


function showLogin() {

    window.location.href =
        '/login.html';
}


function showRegister() {

    window.location.href =
        '/register.html';
}


// ==========================================
// LOGOUT
// ==========================================

function logout() {

    localStorage.removeItem(
        'user'
    );


    cart = [];


    localStorage.removeItem(
        'cart'
    );


    window.location.href =
        '/';
}


// ==========================================
// GLOBAL FUNCTIONS
// ==========================================

window.goHome =
    goHome;

window.goProducts =
    goProducts;

window.showLogin =
    showLogin;

window.showRegister =
    showRegister;

window.logout =
    logout;

window.increaseQuantity =
    increaseQuantity;

window.decreaseQuantity =
    decreaseQuantity;

window.removeFromCart =
    removeFromCart;

window.proceedToCheckout =
    proceedToCheckout;


// ==========================================
// INITIALIZE
// ==========================================

updateAuthArea();

loadProducts();




// smooth behaviour



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

