import './style.css';

import emailjs from '@emailjs/browser';

const PRODUCT_API = 'http://localhost:8082/api/products';

//const PRODUCT_API = 'http://192.168.1.5:8082/api/products';

let allProducts = [];
let activeCategory = 'All';
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function getCurrentUser() {
    const user = localStorage.getItem('user');
    if (!user) return null;

    try {
        return JSON.parse(user);
    } catch (error) {
        localStorage.removeItem('user');
        return null;
    }
}

function getCartCount() {
    return cart.reduce(
        (total, item) =>
            total + Number(item.quantity),
        0
    );
}

function saveCart() {
    localStorage.setItem(
        'cart',
        JSON.stringify(cart)
    );

    updateCartCount();
}


// ==========================================
// IMAGE URL
// ==========================================

function getProductImage(imagePath) {

    if (!imagePath) {
        return 'https://via.placeholder.com/400x400?text=No+Image';
    }

    // Already complete URL
    if (
        imagePath.startsWith('http://') ||
        imagePath.startsWith('https://')
    ) {
        return imagePath;
    }

    // Remove images/ from database value
    const fileName = imagePath
        .replace(/^images\//, '')
        .split('/')
        .pop();

    return `${PRODUCT_API}/image/${encodeURIComponent(fileName)}`;
}


// ==========================================
// MAIN UI WITH ENHANCED SECTIONS
// ==========================================

document.querySelector('#app').innerHTML = `
    <!-- Top Announcement Bar -->
    <div class="announcement-bar">
        🔥 Mega Sale! Get up to 50% OFF on all latest tech & gadgets. Use code: <b>MINI2026</b>
    </div>

    <nav class="navbar">
        <div class="logo">
            <span>Mini</span>Shop
        </div>

        <div class="nav-links">
            <button onclick="showHome()">Home</button>
            <button onclick="scrollToProducts()">Products</button>
            <button onclick="showOrders()">My Orders</button>

            <button onclick="showCart()" class="cart-btn">
                🛒 Cart
                <span id="cartCount">${getCartCount()}</span>
            </button>

            <div id="authArea"></div>
        </div>
    </nav>

    <!-- Enhanced Hero Banner -->
    <section class="hero">
        <div class="hero-content">
            <span class="badge">New Arrival 2026</span>
            <h1>Shop Everything <br>You Love & Need</h1>
            <p>Discover top-tier products, exclusive deals, and fast doorstep delivery at unbeatable prices.</p>
            <div class="hero-actions">
                <button onclick="scrollToProducts()" class="hero-btn primary">Shop Now</button>
                <a href="#trending" class="hero-btn secondary">Explore Trending</a>
            </div>
        </div>
    </section>

    <!-- Trust Badges Section -->
    <section class="features-bar">
        <div class="feature-item">
            <span class="icon">🚀</span>
            <div>
                <h4>Free Shipping</h4>
                <p>On all orders over ₹999</p>
            </div>
        </div>

        <div class="feature-item">
            <span class="icon">⚡</span>
            <div>
                <h4>Fast Delivery</h4>
                <p>Delivered within 24-48 Hours</p>
            </div>
        </div>

        <div class="feature-item">
            <span class="icon">🔒</span>
            <div>
                <h4>Secure Payment</h4>
                <p>100% encrypted checkout</p>
            </div>
        </div>

        <div class="feature-item">
            <span class="icon">🎧</span>
            <div>
                <h4>24/7 Support</h4>
                <p>Dedicated customer care</p>
            </div>
        </div>
    </section>

    <!-- Deals Banner Grid -->
    <section class="deals-section" id="trending">

        <div class="deal-card promo-1">

            <div class="deal-text">

                <span>Limited Offer</span>

                <h3>
                    Premium Audio & Headphones
                </h3>

                <p>
                    Up to 40% Off
                </p>

                <button
                    onclick="filterCategory('Electronics')"
                    class="deal-btn"
                >
                    Explore Now
                </button>

            </div>

        </div>


        <div class="deal-card promo-2">

            <div class="deal-text">

                <span>Trending Now</span>

                <h3>
                    Laptops & Accessories
                </h3>

                <p>
                    Best budget picks for dev & office
                </p>

                <button
                    onclick="scrollToProducts()"
                    class="deal-btn"
                >
                    Shop Collection
                </button>

            </div>

        </div>

    </section>

    <!-- Dynamic Products Section -->
    <section
        class="products-section"
        id="productsSection"
    >

        <div class="section-header">

            <div>

                <h2>
                    Our Products
                </h2>

                <p class="sub-text">
                    Handpicked premium goods just for you
                </p>

            </div>


            <input
                type="text"
                id="searchInput"
                placeholder="Search products, brands, categories..."
                oninput="searchProducts()"
            />

        </div>


        <div
            id="categories"
            class="categories"
        ></div>


        <div
            id="productContainer"
            class="product-container"
        >

            <div class="loading">
                Loading products...
            </div>

        </div>

    </section>

    <!-- Testimonials / Customer Reviews -->
    <section class="reviews-section">

        <div class="section-title">

            <h2>
                What Our Customers Say
            </h2>

            <p>
                Real reviews from verified shoppers
            </p>

        </div>


        <div class="reviews-grid">

            <div class="review-card">

                <div class="stars">
                    ★★★★★
                </div>

                <p>
                    "Awesome experience! Delivered my product within 2 days. Quality is top-notch."
                </p>

                <h4>
                    - Karthik R.
                </h4>

            </div>


            <div class="review-card">

                <div class="stars">
                    ★★★★★
                </div>

                <p>
                    "Best prices compared to other platforms. Clean design and smooth checkout!"
                </p>

                <h4>
                    - Priya Sharma
                </h4>

            </div>


            <div class="review-card">

                <div class="stars">
                    ★★★★☆
                </div>

                <p>
                    "Super simple UI, easy cart management. Loved the fast customer service support."
                </p>

                <h4>
                    - Alex M.
                </h4>

            </div>

        </div>

    </section>

    <!-- Newsletter Subscription -->
    <section class="newsletter-section">

        <div class="newsletter-box">

            <h2>
                Join the MiniShop Club
            </h2>

            <p>
                Subscribe to get special discounts, news, and exclusive promo codes.
            </p>


            <form
                onsubmit="subscribeNewsletter(event)"
                class="newsletter-form"
            >

                <input
                    type="email"
                    placeholder="Enter your email address"
                    required
                />

                <button type="submit">
                    Subscribe
                </button>

            </form>

        </div>

    </section>

    <footer>

        <div class="footer-links">

            <div>

                <h3>
                    MiniShop
                </h3>

                <p>
                    Your one-stop destination for quality & affordability.
                </p>

            </div>


            <div>

                <h4>
                    Quick Links
                </h4>

                <a href="javascript:showHome()">
                    Home
                </a>

                <a href="#productsSection">
                    Products
                </a>

                <a href="javascript:showCart()">
                    Cart
                </a>

            </div>


            <div>

                <h4>
                    Help & Info
                </h4>

                <a href="#">
                    Privacy Policy
                </a>

                <a href="#">
                    Terms of Service
                </a>

                <a href="#">
                    Contact Us
                </a>

            </div>

        </div>


        <div class="footer-bottom">

            <p>
                © 2026 MiniShop. Built for performance.
            </p>

        </div>

    </footer>
`;


// ==========================================
// AUTH AREA
// ==========================================

function updateAuthArea() {

    const authArea =
        document.querySelector('#authArea');

    const user =
        getCurrentUser();


    if (user) {

        authArea.innerHTML = `

            <span class="welcome">
                Hi, ${user.name || 'User'}
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

            <button onclick="showLogin()">
                Login
            </button>

            <button onclick="showRegister()">
                Register
            </button>

        `;
    }
}


// ==========================================
// NEWSLETTER
// ==========================================

function subscribeNewsletter(event) {

    event.preventDefault();

    const form =
        event.target;

    const email =
        form.querySelector(
            'input[type="email"]'
        ).value;


    emailjs.send(
        'Minishopservice',
        'template_6jp81ye',
        {
            to_email: email,
            user_email: email
        },
        'kJznJEEQ6MpuuPtC8'
    )
    .then(() => {

        alert(
            'Subscribed successfully! 🎉'
        );

        form.reset();

    })
    .catch((error) => {

        console.error(
            'Email sending failed:',
            error
        );

        alert(
            'Subscription failed. Please try again.'
        );

    });
}


// ==========================================
// LOAD & DISPLAY PRODUCTS
// ==========================================

async function loadProducts() {

    const container =
        document.querySelector(
            '#productContainer'
        );


    try {

        const response =
            await fetch(PRODUCT_API);


        if (!response.ok) {

            throw new Error(
                'Failed to fetch products'
            );
        }


        allProducts =
            await response.json();


        displayCategories();

        displayProducts(
            allProducts
        );


    } catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="error">

                <h3>
                    Unable to load products
                </h3>

                <p>
                    Make sure Product Service is running on port 8082.
                </p>

                <button
                    onclick="loadProducts()"
                >
                    Try Again
                </button>

            </div>

        `;
    }
}


function displayCategories() {

    const categoryContainer =
        document.querySelector(
            '#categories'
        );


    const categories = [
        'All',
        ...new Set(
            allProducts
                .map(product => product.category)
                .filter(Boolean)
        )
    ];


    categoryContainer.innerHTML =
        categories
            .map(category => `

                <button
                    class="${
                        category === activeCategory
                            ? 'active'
                            : ''
                    }"
                    onclick="filterCategory('${category}')"
                >
                    ${category}
                </button>

            `)
            .join('');
}


function filterCategory(category) {

    activeCategory =
        category;

    displayCategories();


    const searchValue =
        document
            .querySelector(
                '#searchInput'
            )
            .value
            .toLowerCase()
            .trim();


    let filteredProducts =
        allProducts;


    if (category !== 'All') {

        filteredProducts =
            filteredProducts.filter(
                product =>
                    product.category?.toLowerCase() ===
                    category.toLowerCase()
            );
    }


    if (searchValue) {

        filteredProducts =
            filteredProducts.filter(
                product =>
                    product.brand?.toLowerCase().includes(searchValue) ||
                    product.model?.toLowerCase().includes(searchValue) ||
                    product.category?.toLowerCase().includes(searchValue) ||
                    product.name?.toLowerCase().includes(searchValue)
            );
    }


    displayProducts(
        filteredProducts
    );
}


function searchProducts() {

    const searchValue =
        document
            .querySelector(
                '#searchInput'
            )
            .value
            .toLowerCase()
            .trim();


    let filteredProducts =
        allProducts;


    if (activeCategory !== 'All') {

        filteredProducts =
            filteredProducts.filter(
                product =>
                    product.category?.toLowerCase() ===
                    activeCategory.toLowerCase()
            );
    }


    if (searchValue) {

        filteredProducts =
            filteredProducts.filter(
                product =>
                    product.brand?.toLowerCase().includes(searchValue) ||
                    product.model?.toLowerCase().includes(searchValue) ||
                    product.category?.toLowerCase().includes(searchValue) ||
                    product.name?.toLowerCase().includes(searchValue)
            );
    }


    displayProducts(
        filteredProducts
    );
}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(
    productsToShow = allProducts
) {

    const container =
        document.querySelector(
            '#productContainer'
        );


    if (!container) {
        return;
    }


    if (!productsToShow.length) {

        container.innerHTML = `

            <div class="no-products">

                <h3>
                    No products found
                </h3>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        productsToShow
            .map(product => `

                <div class="product-card">


                    <!-- PRODUCT IMAGE -->

                    <div class="product-image">

                        <img
                            src="${getProductImage(product.imageUrl)}"
                            alt="${
                                product.name ||
                                'Product'
                            }"
                            onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'"
                        >

                    </div>


                    <div class="product-info">

                        <span class="product-category">
                            ${
                                product.category ||
                                'General'
                            }
                        </span>

                        <div class="product-brand"> Brand : ${product.brand || 'Brand'}</div>


                        <h3 class="product-name">

                            ${
                                product.name ||
                                `${product.brand || ''} ${product.model || 'Product'}`
                            }

                        </h3>


                        <p class="product-description">

                            ${
                                product.description ||
                                'High quality product carefully selected for your daily needs.'
                            }

                        </p>


                        <div class="product-bottom">

                            <div>

                                <div class="product-price">

                                    ₹${
                                        Number(
                                            product.price || 0
                                        ).toLocaleString(
                                            'en-IN'
                                        )
                                    }

                                </div>


                                <div
                                    class="
                                        product-stock
                                        ${
                                            Number(
                                                product.quantity
                                            ) <= 0
                                                ? 'out-of-stock'
                                                : ''
                                        }
                                    "
                                >

                                    ${
                                        Number(
                                            product.quantity
                                        ) > 0
                                            ? `${product.quantity} in stock`
                                            : 'Out of stock'
                                    }

                                </div>

                            </div>


                            <button
                                class="add-cart-btn"
                                onclick="addToCart(${product.id})"
                                ${
                                    Number(product.quantity) <= 0 ||
                                    product.status !== 'ACTIVE'
                                        ? 'disabled'
                                        : ''
                                }
                            >
                                ${
                                    product.status !== 'ACTIVE'
                                        ? 'Unavailable'
                                        : Number(product.quantity) > 0
                                            ? 'Add to Cart'
                                            : 'Out of Stock'
                                }
                            </button>

                        </div>

                    </div>

                </div>

            `)
            .join('');
}


// ==========================================
// ACTIONS & CART MANAGEMENT
// ==========================================

function addToCart(productId) {

    const product =
        allProducts.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (!product) {

        alert(
            'Product not found'
        );

        return;
    }


    const stock =
        Number(
            product.quantity || 0
        );


    if (stock <= 0) {

        alert(
            'Product is out of stock'
        );

        return;
    }

        if (product.status !== 'ACTIVE') {
        alert('This product is currently unavailable.');
        return;
    }


    const existingProduct =
        cart.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );


    if (existingProduct) {

        if (
            existingProduct.quantity >=
            stock
        ) {

            alert(
                'Maximum available quantity reached'
            );

            return;
        }


        existingProduct.quantity++;

    } else {

        cart.push({

            id:
                product.id,

            name:
                product.name,

            brand:
                product.brand,

            model:
                product.model,

            category:
                product.category,

            price:
                product.price,

            // IMAGE PATH FROM DATABASE
            image:
                product.imageUrl,

            quantity:
                1

        });
    }


    saveCart();


    alert(
        `${
            product.name ||
            product.brand ||
            'Item'
        } added to cart!`
    );
}


function updateCartCount() {

    const cartCount =
        document.querySelector(
            '#cartCount'
        );


    if (cartCount) {

        cartCount.textContent =
            getCartCount();

    }
}


function showHome() {

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


function scrollToProducts() {

    document
        .querySelector(
            '#productsSection'
        )
        .scrollIntoView({
            behavior: 'smooth'
        });
}


function showCart() {

    window.location.href =
        '/cart.html';
}


function showOrders() {

    window.location.href =
        '/orders.html';
}


function showLogin() {

    window.location.href =
        '/login.html';
}


function showRegister() {

    window.location.href =
        '/register.html';
}


function logout() {

    localStorage.removeItem(
        'user'
    );

    cart = [];

    localStorage.removeItem(
        'cart'
    );

    updateCartCount();

    updateAuthArea();

    alert(
        'Logged out successfully'
    );
}


// ==========================================
// GLOBAL SCOPE ATTACHMENTS
// ==========================================

window.showHome =
    showHome;

window.scrollToProducts =
    scrollToProducts;

window.filterCategory =
    filterCategory;

window.searchProducts =
    searchProducts;

window.addToCart =
    addToCart;

window.showOrders =
    showOrders;

window.showCart =
    showCart;

window.showLogin =
    showLogin;

window.showRegister =
    showRegister;

window.logout =
    logout;

window.subscribeNewsletter =
    subscribeNewsletter;


// ==========================================
// INITIALIZE
// ==========================================

updateAuthArea();

loadProducts();



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
