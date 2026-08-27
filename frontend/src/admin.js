import './style.css';

// ==========================================
// API
// ==========================================
const PRODUCT_API =
    'http://localhost:8082/api/products';

const ORDER_API =
    'http://localhost:8083/api/orders';

// ==========================================
// ADMIN UI
// ==========================================

document.querySelector('#admin-app').innerHTML = `

    <header class="navbar">

        <div class="logo">
            🛒 E-Commerce Admin
        </div>

        <nav>
            <a href="/">Store</a>
            <a href="/admin.html">Orders</a>
        </nav>

    </header>


    <main class="orders-section">

        <div class="section-header">

            <div>

                <span class="section-label">
                    ADMIN PANEL
                </span>

                <h2>
                    Order Management
                </h2>

            </div>


            <button
                class="shop-btn"
                onclick="loadAllOrders()">

                Refresh ↻

            </button>

        </div>


        <div
            id="admin-orders"
            class="orders-container">

            <div class="loading">
                Loading orders...
            </div>

        </div>
        <section class="orders-section" id="admin-products">

    <div class="section-header">

        <div>
            <span class="section-label">
                INVENTORY MANAGEMENT
            </span>

            <h2>
                Product Stock
            </h2>
        </div>

        <button
            class="shop-btn"
            onclick="loadProducts()">

            Refresh Products ↻

        </button>

    </div>


    <div
        id="admin-products-container"
        class="orders-container">

        <div class="loading">
            Loading products...
        </div>

    </div>

</section>

    </main>

`;

// ==========================================
// LOAD ALL ORDERS
// ==========================================

window.loadAllOrders = async function () {

    const container =
        document.getElementById('admin-orders');

    container.innerHTML = `

        <div class="loading">
            Loading orders...
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


        if (orders.length === 0) {

            container.innerHTML = `

                <div class="message">

                    <h3>
                        No orders found
                    </h3>

                    <p>
                        There are no orders yet.
                    </p>

                </div>

            `;

            return;
        }


        // Latest orders first
        orders.reverse();


        container.innerHTML =
            orders
                .map(order => {

                    return createOrderCard(order);

                })
                .join('');


    } catch (error) {

        console.error(
            'Admin Orders Error:',
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
                    onclick="loadAllOrders()">

                    Retry

                </button>

            </div>

        `;

    }

};

// ==========================================
// CREATE ORDER CARD
// ==========================================

function createOrderCard(order) {

    const status =
        String(order.status).toUpperCase();


    let actionButtons = '';


    // ==========================================
    // PENDING
    // ==========================================

    if (status === 'PENDING') {

        actionButtons = `

            <button
                class="status-btn confirm-btn"
                onclick="updateOrderStatus(
                    ${order.id},
                    'CONFIRMED'
                )">

                ✓ Confirm Order

            </button>


            <button
                class="status-btn cancel-btn"
                onclick="updateOrderStatus(
                    ${order.id},
                    'CANCELLED'
                )">

                ✕ Cancel

            </button>

        `;

    }


    // ==========================================
    // CONFIRMED
    // ==========================================

    else if (status === 'CONFIRMED') {

        actionButtons = `

            <button
                class="status-btn ship-btn"
                onclick="updateOrderStatus(
                    ${order.id},
                    'SHIPPED'
                )">

                🚚 Ship Order

            </button>


            <button
                class="status-btn cancel-btn"
                onclick="updateOrderStatus(
                    ${order.id},
                    'CANCELLED'
                )">

                ✕ Cancel

            </button>

        `;

    }


    // ==========================================
    // SHIPPED
    // ==========================================

    else if (status === 'SHIPPED') {

        actionButtons = `

            <button
                class="status-btn deliver-btn"
                onclick="updateOrderStatus(
                    ${order.id},
                    'DELIVERED'
                )">

                ✓ Mark Delivered

            </button>

        `;

    }


    // ==========================================
    // DELIVERED
    // ==========================================

    else if (status === 'DELIVERED') {

        actionButtons = `

            <div class="completed-message">

                ✓ Order Completed

            </div>

        `;

    }


    // ==========================================
    // CANCELLED
    // ==========================================

    else if (status === 'CANCELLED') {

        actionButtons = `

            <div class="cancelled-message">

                ✕ Order Cancelled

            </div>

        `;

    }


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
                    class="order-status status-${status.toLowerCase()}">

                    ${status}

                </span>

            </div>


            <div class="order-details">

                <div class="order-detail">

                    <span>
                        User ID
                    </span>

                    <strong>
                        ${order.userId}
                    </strong>

                </div>


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


            <div class="admin-order-actions">

                ${actionButtons}

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

}

// ==========================================
// UPDATE ORDER STATUS
// ==========================================

window.updateOrderStatus = async function (
    orderId,
    newStatus
) {

    const confirmation =
        confirm(
            `Are you sure you want to change Order #${orderId} to ${newStatus}?`
        );


    if (!confirmation) {

        return;

    }


    try {

        const response =
            await fetch(
                `${ORDER_API}/${orderId}/status?status=${newStatus}`,
                {
                    method: 'PUT'
                }
            );


        const responseText =
            await response.text();


        console.log(
            'Status Update Response:',
            response.status,
            responseText
        );


        if (!response.ok) {

            let errorMessage =
                responseText ||
                `Status update failed (${response.status})`;


            try {

                const errorJson =
                    JSON.parse(responseText);

                errorMessage =
                    errorJson.message ||
                    errorJson.error ||
                    responseText;

            } catch (e) {

                // Plain text response
            }


            throw new Error(
                errorMessage
            );

        }


        alert(
            `Order #${orderId} updated to ${newStatus} successfully! ✅`
        );


        // Reload orders
        await loadAllOrders();


    } catch (error) {

        console.error(
            'Status Update Error:',
            error
        );


        alert(
            `❌ Failed to update Order #${orderId}.\n\n${error.message}`
        );

    }

};

// ==========================================
// LOAD PRODUCTS
// ==========================================

window.loadProducts = async function () {

    const container =
        document.getElementById(
            'admin-products-container'
        );

    container.innerHTML = `
        <div class="loading">
            Loading products...
        </div>
    `;

    try {

        const response =
            await fetch(PRODUCT_API);

        if (!response.ok) {

            throw new Error(
                `Product Service returned ${response.status}`
            );

        }

        const products =
            await response.json();


        if (products.length === 0) {

            container.innerHTML = `
                <div class="message">
                    No products found.
                </div>
            `;

            return;
        }


        container.innerHTML =
            products.map(product => `

                <div class="order-card">

                    <div class="order-card-header">

                        <div>

                            <span class="order-label">
                                PRODUCT
                            </span>

                            <h3>
                                ${product.name}
                            </h3>

                        </div>

                        <span class="stock-badge ${
                            product.quantity <= 0
                                ? 'stock-empty'
                                : product.quantity <= 5
                                    ? 'stock-low'
                                    : 'stock-available'
                        }">

                            ${
                                product.quantity <= 0
                                    ? 'OUT OF STOCK'
                                    : `${product.quantity} IN STOCK`
                            }

                        </span>

                    </div>


                    <div class="order-details">

                        <div class="order-detail">

                            <span>
                                Product ID
                            </span>

                            <strong>
                                ${product.id}
                            </strong>

                        </div>


                        <div class="order-detail">

                            <span>
                                Category
                            </span>

                            <strong>
                                ${product.category || '-'}
                            </strong>

                        </div>


                        <div class="order-detail">

                            <span>
                                Price
                            </span>

                            <strong>
                                ₹${Number(
                                    product.price
                                ).toLocaleString('en-IN')}
                            </strong>

                        </div>


                        <div class="order-detail">

                            <span>
                                Current Quantity
                            </span>

                            <strong>
                                ${product.quantity}
                            </strong>

                        </div>

                    </div>


                    <div class="stock-controls">

                        <button
                            class="stock-btn decrease-stock"
                            onclick="changeStock(
                                ${product.id},
                                -1
                            )">

                            −

                        </button>


                        <input
                            type="number"
                            id="stock-${product.id}"
                            value="${product.quantity}"
                            min="0"
                        />


                        <button
                            class="stock-btn increase-stock"
                            onclick="changeStock(
                                ${product.id},
                                1
                            )">

                            +

                        </button>


                        <button
                            class="update-stock-btn"
                            onclick="setProductQuantity(
                                ${product.id}
                            )">

                            Update Stock

                        </button>

                    </div>

                </div>

            `).join('');


    } catch (error) {

        console.error(
            'Product Loading Error:',
            error
        );

        container.innerHTML = `

            <div class="error">

                <h3>
                    Unable to load products
                </h3>

                <p>
                    ${error.message}
                </p>

                <button
                    onclick="loadProducts()">

                    Retry

                </button>

            </div>

        `;

    }

};
// ==========================================
// CHANGE STOCK INPUT
// ==========================================

window.changeStock = function (
    productId,
    amount
) {

    const input =
        document.getElementById(
            `stock-${productId}`
        );

    if (!input) {
        return;
    }

    let quantity =
        Number(input.value);

    quantity += amount;

    if (quantity < 0) {
        quantity = 0;
    }

    input.value = quantity;
};
// ==========================================
// UPDATE PRODUCT QUANTITY
// ==========================================

window.setProductQuantity = async function (
    productId
) {

    const input =
        document.getElementById(
            `stock-${productId}`
        );

    const quantity =
        Number(input.value);


    if (!Number.isInteger(quantity) || quantity < 0) {

        alert(
            'Please enter a valid quantity.'
        );

        return;
    }


    try {

        // First get existing product
        const getResponse =
            await fetch(
                `${PRODUCT_API}/${productId}`
            );


        if (!getResponse.ok) {

            throw new Error(
                'Product not found'
            );

        }


        const product =
            await getResponse.json();


        // Update only quantity,
        // but send complete object because
        // your backend PUT expects Product

        const updateResponse =
            await fetch(
                `${PRODUCT_API}/${productId}`,
                {
                    method: 'PUT',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({

                        name:
                            product.name,

                        description:
                            product.description,

                        price:
                            product.price,

                        quantity:
                            quantity,

                        category:
                            product.category

                    })
                }
            );


        if (!updateResponse.ok) {

            const errorText =
                await updateResponse.text();

            throw new Error(
                errorText ||
                'Failed to update stock'
            );

        }


        const updatedProduct =
            await updateResponse.json();


        alert(
            `Stock updated successfully! ✅\n\n` +
            `Product: ${updatedProduct.name}\n` +
            `Quantity: ${updatedProduct.quantity}`
        );


        // Reload products
        loadProducts();


    } catch (error) {

        console.error(
            'Stock Update Error:',
            error
        );


        alert(
            `❌ Failed to update stock.\n\n${error.message}`
        );

    }

};

// ==========================================
// START
// ==========================================

loadAllOrders();

loadProducts();