import './style.css';

const PRODUCT_API = 'http://localhost:8082/api/products';
const ORDER_API = 'http://localhost:8083/api/orders';

// ==========================================
// CART
// ==========================================

let cart = JSON.parse(localStorage.getItem('cart')) || [];


// ==========================================
// MAIN UI
// ==========================================

document.querySelector('#app').innerHTML = `
    <header class="navbar">

        <div class="logo">
            🛒 E-Commerce
        </div>

        <nav>
            <a href="#">Home</a>
            <a href="#products">Products</a>
            <a href="#orders" onclick="loadOrders()">Orders</a>
        </nav>

        <button class="cart-btn" onclick="openCart()">
            🛒 Cart <span id="cart-count">0</span>
        </button>

    </header>


    <main>

        <section class="hero">

            <div class="hero-content">

                <span class="hero-label">
                    WELCOME TO OUR STORE
                </span>

                <h1>
                    Shop Everything<br>
                    You Love.
                </h1>

                <p>
                    Discover amazing products at the best prices.
                </p>

                <button
                    class="shop-btn"
                    onclick="scrollToProducts()">
                    Shop Now →
                </button>

            </div>

        </section>


        <section
            class="products-section"
            id="products">

            <div class="section-header">

                <div>

                    <span class="section-label">
                        OUR COLLECTION
                    </span>

                    <h2>
                        Latest Products
                    </h2>

                </div>

                <span id="product-count">
                    Loading...
                </span>

            </div>


            <div
                id="products-container"
                class="products-grid">

                <div class="loading">
                    Loading products...
                </div>

            </div>

        </section>

        <section class="orders-section" id="orders">

    <div class="section-header">

        <div>
            <span class="section-label">
                ORDER HISTORY
            </span>

            <h2>
                My Orders
            </h2>
        </div>

        <button
            class="shop-btn"
            onclick="loadOrders()">

            Refresh Orders ↻

        </button>

    </div>


    <div
          id="orders-container"
          class="orders-container">

          <div class="message">
              Enter your User ID to view your orders.
          </div>

      </div>

  </section>

    </main>


    <footer>

        <p>
            © 2026 E-Commerce. All rights reserved.
        </p>

    </footer>


    <!-- =====================================
         CART OVERLAY
    ====================================== -->

    <div
        id="cart-overlay"
        class="cart-overlay"
        onclick="closeCart(event)">

        <div
            class="cart-panel"
            onclick="event.stopPropagation()">

            <div class="cart-header">

                <h2>
                    Your Cart
                </h2>

                <button
                    class="close-cart"
                    onclick="closeCart()">
                    ×
                </button>

            </div>


            <div
                id="cart-items"
                class="cart-items">
            </div>


            <div class="cart-footer">

                <div class="cart-total">

                    <span>
                        Total
                    </span>

                    <strong id="cart-total">
                        ₹0
                    </strong>

                </div>


                <button
                    class="checkout-btn"
                    onclick="checkout()">

                    Proceed to Checkout →

                </button>

            </div>

        </div>

    </div>
`;


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    const container =
        document.getElementById('products-container');

    const count =
        document.getElementById('product-count');

    try {

        const response =
            await fetch(PRODUCT_API);

        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        const products =
            await response.json();


        count.textContent =
            `${products.length} Products`;


        if (products.length === 0) {

            container.innerHTML = `
                <div class="message">
                    No products available.
                </div>
            `;

            return;
        }


        container.innerHTML =
            products.map(product => {

                const outOfStock =
                    product.quantity <= 0;

                return `

                    <div class="product-card">

                        <div class="product-image">
                            🛍️
                        </div>


                        <div class="product-info">

                            <span class="category">
                                ${product.category || 'Product'}
                            </span>


                            <h3>
                                ${product.name}
                            </h3>


                            <p class="description">
                                ${
                                    product.description ||
                                    'Quality product available now.'
                                }
                            </p>


                            <div class="product-footer">

                                <div>

                                    <span class="price">
                                        ₹${Number(product.price)
                                            .toLocaleString('en-IN')}
                                    </span>


                                    <span class="stock
                                        ${outOfStock ? 'out-stock' : ''}">

                                        ${
                                            outOfStock
                                                ? 'Out of Stock'
                                                : `Stock: ${product.quantity}`
                                        }

                                    </span>

                                </div>


                                <button
                                    class="buy-btn"
                                    ${
                                        outOfStock
                                            ? 'disabled'
                                            : ''
                                    }
                                    onclick="addToCart(
                                        ${product.id},
                                        '${escapeProductName(product.name)}',
                                        ${product.price},
                                        ${product.quantity}
                                    )">

                                    ${
                                        outOfStock
                                            ? 'Unavailable'
                                            : 'Add to Cart'
                                    }

                                </button>

                            </div>

                        </div>

                    </div>

                `;

            }).join('');


    } catch (error) {

        console.error(error);

        count.textContent = '';

        container.innerHTML = `

            <div class="error">

                <h3>
                    Unable to load products
                </h3>

                <p>
                    Make sure Product Service is running on port 8082.
                </p>

                <button onclick="loadProducts()">
                    Retry
                </button>

            </div>

        `;
    }
}


// ==========================================
// ESCAPE PRODUCT NAME
// ==========================================

function escapeProductName(name) {

    return String(name)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'");
}


// ==========================================
// ADD TO CART
// ==========================================

window.addToCart = function(
    productId,
    productName,
    price,
    stock
) {

    const existingItem =
        cart.find(item => item.productId === productId);


    if (existingItem) {

        if (existingItem.quantity >= stock) {

            alert(
                `Only ${stock} item(s) available in stock.`
            );

            return;
        }

        existingItem.quantity++;

    } else {

        cart.push({

            productId: productId,

            name: productName,

            price: price,

            quantity: 1,

            stock: stock

        });

    }


    saveCart();

    updateCartCount();

    alert(
        `${productName} added to cart 🛒`
    );
};


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
// UPDATE CART COUNT
// ==========================================

function updateCartCount() {

    const count =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    document.getElementById(
        'cart-count'
    ).textContent = count;
}


// ==========================================
// OPEN CART
// ==========================================

window.openCart = function() {

    renderCart();

    document
        .getElementById('cart-overlay')
        .classList.add('active');

};


// ==========================================
// CLOSE CART
// ==========================================

window.closeCart = function(event) {

    if (
        event &&
        event.target !== event.currentTarget
    ) {
        return;
    }


    document
        .getElementById('cart-overlay')
        .classList.remove('active');
};


// ==========================================
// RENDER CART
// ==========================================

function renderCart() {

    const container =
        document.getElementById('cart-items');

    const totalElement =
        document.getElementById('cart-total');


    if (cart.length === 0) {

        container.innerHTML = `

            <div class="empty-cart">

                <div class="empty-cart-icon">
                    🛒
                </div>

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add some products to get started.
                </p>

            </div>

        `;

        totalElement.textContent = '₹0';

        return;
    }


    container.innerHTML =
        cart.map(item => `

            <div class="cart-item">

                <div class="cart-item-image">
                    🛍️
                </div>


                <div class="cart-item-info">

                    <h3>
                        ${item.name}
                    </h3>

                    <p>
                        ₹${Number(item.price)
                            .toLocaleString('en-IN')}
                    </p>


                    <div class="quantity-controls">

                        <button
                            onclick="decreaseQuantity(
                                ${item.productId}
                            )">

                            −

                        </button>


                        <span>
                            ${item.quantity}
                        </span>


                        <button
                            onclick="increaseQuantity(
                                ${item.productId}
                            )">

                            +

                        </button>

                    </div>

                </div>


                <div class="cart-item-right">

                    <strong>
                        ₹${Number(
                            item.price * item.quantity
                        ).toLocaleString('en-IN')}
                    </strong>


                    <button
                        class="remove-btn"
                        onclick="removeFromCart(
                            ${item.productId}
                        )">

                        Remove

                    </button>

                </div>

            </div>

        `).join('');


    const total =
        cart.reduce(
            (sum, item) =>
                sum + item.price * item.quantity,
            0
        );


    totalElement.textContent =
        `₹${Number(total).toLocaleString('en-IN')}`;
}


// ==========================================
// INCREASE QUANTITY
// ==========================================

window.increaseQuantity = function(productId) {

    const item =
        cart.find(
            item => item.productId === productId
        );


    if (!item) {
        return;
    }


    if (item.quantity >= item.stock) {

        alert(
            `Only ${item.stock} item(s) available.`
        );

        return;
    }


    item.quantity++;

    saveCart();

    updateCartCount();

    renderCart();
};


// ==========================================
// DECREASE QUANTITY
// ==========================================

window.decreaseQuantity = function(productId) {

    const item =
        cart.find(
            item => item.productId === productId
        );


    if (!item) {
        return;
    }


    item.quantity--;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                item =>
                    item.productId !== productId
            );

    }


    saveCart();

    updateCartCount();

    renderCart();
};


// ==========================================
// REMOVE FROM CART
// ==========================================

window.removeFromCart = function(productId) {

    cart =
        cart.filter(
            item =>
                item.productId !== productId
        );


    saveCart();

    updateCartCount();

    renderCart();
};


// ==========================================
// CHECKOUT
// ==========================================

// ==========================================
// CHECKOUT
// ==========================================

window.checkout = async function() {

    if (cart.length === 0) {

        alert('Your cart is empty.');

        return;
    }


    // Ask User ID
    const userId =
        prompt('Enter your User ID:');


    if (!userId) {

        alert('User ID is required.');

        return;
    }


    // Currently one product per order
    const item = cart[0];


    try {

        const response =
            await fetch(
                'http://localhost:8083/api/orders',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({

                        userId: Number(userId),

                        productId: item.productId,

                        quantity: item.quantity

                    })
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            throw new Error(
                errorText || 'Order creation failed'
            );
        }


        const order =
            await response.json();


        console.log(
            'Order Created:',
            order
        );


        // Remove purchased item from cart
        cart =
            cart.filter(
                cartItem =>
                    cartItem.productId !== item.productId
            );


        saveCart();

        updateCartCount();

        renderCart();


        alert(
            `Order placed successfully! 🎉\n\n`
            + `Order ID: ${order.id}\n`
            + `Status: ${order.status}`
        );


        closeCart();


    } catch (error) {

        console.error(
            'Checkout Error:',
            error
        );


        alert(
            '❌ Order failed.\n\n'+
            error.message +
            '\n\nMake sure Order Service is running on port 8083.'
        );
    }

};


// ==========================================
// SCROLL
// ==========================================

window.scrollToProducts = function() {

    document
        .getElementById('products')
        .scrollIntoView({
            behavior: 'smooth'
        });

};

// ==========================================
// LOAD ORDERS
// ==========================================

window.loadOrders = async function () {

    const container =
        document.getElementById('orders-container');


    // Ask User ID
    const userIdInput =
        prompt('Enter your User ID:');


    if (
        userIdInput === null ||
        userIdInput.trim() === ''
    ) {

        return;
    }


    const userId =
        Number(userIdInput);


    if (
        !Number.isInteger(userId) ||
        userId <= 0
    ) {

        alert(
            'Please enter a valid User ID.'
        );

        return;
    }


    container.innerHTML = `

        <div class="loading">
            Loading your orders...
        </div>

    `;


    try {

        const response =
            await fetch(ORDER_API);


        if (!response.ok) {

            throw new Error(
                `Order Service returned ${response.status}`
            );

        }


        const orders =
            await response.json();


        // Filter current user's orders
        const userOrders =
            orders.filter(
                order =>
                    Number(order.userId) === userId
            );


        // No orders
        if (userOrders.length === 0) {

            container.innerHTML = `

                <div class="message">

                    <h3>
                        No orders found
                    </h3>

                    <p>
                        User ID ${userId} has no orders yet.
                    </p>

                </div>

            `;

            return;
        }


        // Display orders
        container.innerHTML =
            userOrders
                .reverse()
                .map(order => {

                    return `

                        <div class="order-card">

                            <div class="order-card-header">

                                <div>

                                    <span class="order-label">
                                        ORDER
                                    </span>

                                    <h3>
                                        #${order.id}
                                    </h3>

                                </div>


                                <span
                                    class="order-status status-${String(order.status).toLowerCase()}">

                                    ${order.status}

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
                                        Total
                                    </span>

                                    <strong>
                                        ₹${Number(
                                            order.totalPrice
                                        ).toLocaleString('en-IN')}
                                    </strong>

                                </div>

                            </div>


                            <div class="order-footer">

                                <span>
                                    User ID: ${order.userId}
                                </span>

                                <span>
                                    Order #${order.id}
                                </span>

                            </div>

                        </div>

                    `;

                })
                .join('');


    } catch (error) {

        console.error(
            'Orders Error:',
            error
        );


        container.innerHTML = `

            <div class="error">

                <h3>
                    Unable to load orders
                </h3>

                <p>
                    ${error.message}
                </p>

                <button
                    onclick="loadOrders()">

                    Retry

                </button>

            </div>

        `;

    }

};


// ==========================================
// START
// ==========================================

updateCartCount();

loadProducts();