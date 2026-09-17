const PRODUCT_API =
    'http://localhost:8082/api/products';

const ORDER_API =
    'http://localhost:8083/api/orders';

// const ORDER_API =
// 'http://192.168.1.2:8083/api/orders';

// const PRODUCT_API =
// 'http://192.168.1.2:8082/api/products';


let products = [];

let orders = [];


// ==========================================
// SHOW SECTION
// ==========================================

function showSection(section) {

    const productsSection =
        document.querySelector(
            '#productsSection'
        );

    const ordersSection =
        document.querySelector(
            '#ordersSection'
        );

    const pageTitle =
        document.querySelector(
            '#pageTitle'
        );

    const productsBtn =
        document.querySelector(
            '#productsMenuBtn'
        );

    const ordersBtn =
        document.querySelector(
            '#ordersMenuBtn'
        );


    if (section === 'products') {

        productsSection.classList.remove(
            'hidden'
        );

        ordersSection.classList.add(
            'hidden'
        );

        productsBtn.classList.add(
            'active'
        );

        ordersBtn.classList.remove(
            'active'
        );

        pageTitle.textContent =
            'Products';

        loadProducts();

    }


    if (section === 'orders') {

        productsSection.classList.add(
            'hidden'
        );

        ordersSection.classList.remove(
            'hidden'
        );

        productsBtn.classList.remove(
            'active'
        );

        ordersBtn.classList.add(
            'active'
        );

        pageTitle.textContent =
            'Orders';

        loadOrders();

    }
}


// ==========================================
// LOAD PRODUCTS
// ==========================================

async function loadProducts() {

    const container =
        document.querySelector(
            '#productAdminContainer'
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
                'Unable to load products'
            );
        }


        products =
            await response.json();


        displayProducts();


    } catch (error) {

        console.error(
            'Product Error:',
            error
        );


        container.innerHTML = `

            <div class="admin-error">

                <h3>
                    Unable to load products
                </h3>

                <p>
                    Make sure Product Service
                    is running on port 8082.
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


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts() {

    const container =
        document.querySelector(
            '#productAdminContainer'
        );


    if (!products.length) {

        container.innerHTML = `

            <div class="admin-empty">

                <h3>
                    No Products Found
                </h3>

                <p>
                    Add your first product.
                </p>

            </div>

        `;

        return;
    }


    container.innerHTML = `

        <table class="admin-table">

            <thead>

                <tr>

                    <th>ID</th>

                    <th>Name</th>

                    <th>Description</th>

                    <th>Category</th>

                    <th>Brand</th>

                    <th>Image</th>

                    <th>Price</th>

                    <th>Stock</th>

                    <th>Status</th>

                    <th>Actions</th>

                </tr>

            </thead>


            <tbody>

                ${
                    products.map(product => {

                        let imageHtml = '-';


                        if (product.imageUrl) {

                            const fileName =
                                product.imageUrl
                                    .replace(
                                        'images/',
                                        ''
                                    );


                            imageHtml = `

                                <img
                                    src="${PRODUCT_API}/image/${encodeURIComponent(fileName)}"
                                    alt="${product.name || 'Product'}"
                                    style="
                                        width:50px;
                                        height:50px;
                                        object-fit:cover;
                                        border-radius:8px;
                                    "
                                >

                            `;
                        }


                        return `

                            <tr>

                                <td>
                                    #${product.id}
                                </td>


                                <td>

                                    <strong>
                                        ${
                                            product.name ||
                                            '-'
                                        }
                                    </strong>

                                </td>


                                <td>

                                    <span
                                        class="description-cell"
                                        title="${
                                            product.description ||
                                            ''
                                        }"
                                    >
                                        ${
                                            product.description ||
                                            '-'
                                        }
                                    </span>

                                </td>


                                <td>
                                    ${
                                        product.category ||
                                        '-'
                                    }
                                </td>


                                <td>
                                    ${
                                        product.brand ||
                                        '-'
                                    }
                                </td>


                                <td>

                                    ${imageHtml}

                                </td>


                                <td>
                                    ₹${
                                        Number(
                                            product.price || 0
                                        ).toLocaleString(
                                            'en-IN'
                                        )
                                    }
                                </td>


                                <td>

                                    <span
                                        class="
                                            stock-badge
                                            ${
                                                Number(
                                                    product.quantity
                                                ) > 0
                                                    ? 'in-stock'
                                                    : 'out-stock'
                                            }
                                        "
                                    >
                                        ${
                                            product.quantity ||
                                            0
                                        }
                                    </span>

                                </td>


                                <td>

                                    <span class="status">
                                        ${
                                            product.status ||
                                            'ACTIVE'
                                        }
                                    </span>

                                </td>


                                <td>

                                    <div
                                        class="action-buttons"
                                    >

                                        <button
                                            class="edit-btn"
                                            onclick="
                                                editProduct(
                                                    ${product.id}
                                                )
                                            "
                                        >
                                            Edit
                                        </button>


                                        <button
                                            class="delete-btn"
                                            onclick="
                                                deleteProduct(
                                                    ${product.id}
                                                )
                                            "
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </td>

                            </tr>

                        `;
                    }).join('')
                }

            </tbody>

        </table>

    `;
}


// ==========================================
// OPEN ADD PRODUCT
// ==========================================

function openAddProduct() {

    document.querySelector(
        '#modalTitle'
    ).textContent =
        'Add Product';


    document.querySelector(
        '#productForm'
    ).reset();


    document.querySelector(
        '#productId'
    ).value = '';


    document.querySelector(
        '#productStatus'
    ).value = 'ACTIVE';


    document.querySelector(
        '#productMessage'
    ).textContent = '';


    document.querySelector(
        '#productMessage'
    ).className =
        'message';


    document.querySelector(
        '#productModal'
    ).classList.remove(
        'hidden'
    );
}


// ==========================================
// EDIT PRODUCT
// ==========================================

function editProduct(id) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!product) {

        alert(
            'Product not found'
        );

        return;
    }


    document.querySelector(
        '#modalTitle'
    ).textContent =
        'Edit Product';


    document.querySelector(
        '#productId'
    ).value =
        product.id;


    document.querySelector(
        '#productName'
    ).value =
        product.name || '';


    document.querySelector(
        '#productDescription'
    ).value =
        product.description || '';


    document.querySelector(
        '#productCategory'
    ).value =
        product.category || '';


    document.querySelector(
        '#productBrand'
    ).value =
        product.brand || '';


    /*
     * File input cannot be filled
     * programmatically.
     *
     * So existing image is kept
     * automatically during update
     * if no new file is selected.
     */

    document.querySelector(
        '#productImageUrl'
    ).value = '';


    document.querySelector(
        '#productStatus'
    ).value =
        product.status || 'ACTIVE';


    document.querySelector(
        '#productPrice'
    ).value =
        product.price || 0;


    document.querySelector(
        '#productQuantity'
    ).value =
        product.quantity || 0;


    document.querySelector(
        '#productMessage'
    ).textContent = '';


    document.querySelector(
        '#productMessage'
    ).className =
        'message';


    document.querySelector(
        '#productModal'
    ).classList.remove(
        'hidden'
    );
}


// ==========================================
// SAVE PRODUCT
// ==========================================

document.querySelector(
    '#productForm'
).addEventListener(
    'submit',
    async function(event) {

        event.preventDefault();


        const id =
            document.querySelector(
                '#productId'
            ).value;


        const imageInput =
            document.querySelector(
                '#productImageUrl'
            );


        const imageFile =
            imageInput.files[0];


        const message =
            document.querySelector(
                '#productMessage'
            );


        const button =
            document.querySelector(
                '#saveProductBtn'
            );


        button.disabled = true;


        button.textContent =
            id
                ? 'Updating...'
                : 'Saving...';


        try {

            // ==========================================
            // FIND EXISTING PRODUCT
            // ==========================================

            let existingProduct = null;


            if (id) {

                existingProduct =
                    products.find(
                        product =>
                            Number(product.id) ===
                            Number(id)
                    );
            }


            // ==========================================
            // EXISTING IMAGE
            // ==========================================

            let imagePath =
                existingProduct
                    ? existingProduct.imageUrl || ''
                    : '';


            // ==========================================
            // UPLOAD NEW IMAGE
            // ==========================================

            if (imageFile) {

                const formData =
                    new FormData();


                formData.append(
                    'image',
                    imageFile
                );


                const uploadResponse =
                    await fetch(
                        `${PRODUCT_API}/upload-image`,
                        {
                            method: 'POST',

                            body: formData
                        }
                    );


                const uploadText =
                    await uploadResponse.text();


                if (!uploadResponse.ok) {

                    throw new Error(
                        uploadText ||
                        'Image upload failed'
                    );
                }


                /*
                 * Backend returns:
                 *
                 * images/iphone.jpg
                 */

                imagePath =
                    uploadText.trim();
            }


            // ==========================================
            // PRODUCT DATA
            // ==========================================

            const productData = {

                name:
                    document.querySelector(
                        '#productName'
                    ).value.trim(),


                description:
                    document.querySelector(
                        '#productDescription'
                    ).value.trim(),


                category:
                    document.querySelector(
                        '#productCategory'
                    ).value.trim(),


                brand:
                    document.querySelector(
                        '#productBrand'
                    ).value.trim(),


                imageUrl:
                    imagePath,


                status:
                    document.querySelector(
                        '#productStatus'
                    ).value,


                price:
                    Number(
                        document.querySelector(
                            '#productPrice'
                        ).value
                    ),


                quantity:
                    Number(
                        document.querySelector(
                            '#productQuantity'
                        ).value
                    )

            };


            // ==========================================
            // SAVE / UPDATE PRODUCT
            // ==========================================

            const url =
                id
                    ? `${PRODUCT_API}/${id}`
                    : PRODUCT_API;


            const method =
                id
                    ? 'PUT'
                    : 'POST';


            const response =
                await fetch(
                    url,
                    {
                        method: method,

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(
                                productData
                            )
                    }
                );


            const text =
                await response.text();


            if (!response.ok) {

                throw new Error(
                    text ||
                    'Unable to save product'
                );
            }


            message.textContent =
                id
                    ? 'Product updated successfully!'
                    : 'Product created successfully!';


            message.className =
                'message success';


            setTimeout(
                function() {

                    closeProductModal();

                    loadProducts();

                },
                700
            );


        } catch (error) {

            console.error(
                'Save Product Error:',
                error
            );


            message.textContent =
                error.message ||
                'Unable to save product';


            message.className =
                'message error';


        } finally {

            button.disabled = false;

            button.textContent =
                'Save Product';

        }

    }
);


// ==========================================
// DELETE PRODUCT
// ==========================================

async function deleteProduct(id) {

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    const productName =
        product
            ? product.name
            : `Product #${id}`;


    const confirmed =
        confirm(
            `Are you sure you want to delete "${productName}"?`
        );


    if (!confirmed) {

        return;
    }


    try {

        const response =
            await fetch(
                `${PRODUCT_API}/${id}`,
                {
                    method: 'DELETE'
                }
            );


        const text =
            await response.text();


        if (!response.ok) {

            throw new Error(
                text ||
                'Unable to delete product'
            );
        }


        alert(
            'Product deleted successfully.'
        );


        loadProducts();


    } catch (error) {

        console.error(
            'Delete Product Error:',
            error
        );


        alert(
            error.message ||
            'Failed to delete product'
        );
    }
}


// ==========================================
// CLOSE PRODUCT MODAL
// ==========================================

function closeProductModal() {

    document.querySelector(
        '#productModal'
    ).classList.add(
        'hidden'
    );
}


// ==========================================
// LOAD ORDERS
// ==========================================

async function loadOrders() {

    const container =
        document.querySelector(
            '#orderAdminContainer'
        );


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
                'Unable to load orders'
            );
        }


        orders =
            await response.json();


        displayOrders();


    } catch (error) {

        console.error(
            'Order Error:',
            error
        );


        container.innerHTML = `

            <div class="admin-error">

                <h3>
                    Unable to load orders
                </h3>

                <p>
                    Make sure Order Service
                    is running on port 8083.
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

function displayOrders() {

    const container =
        document.querySelector(
            '#orderAdminContainer'
        );


    if (!orders.length) {

        container.innerHTML = `

            <div class="admin-empty">

                <h3>
                    No Orders Found
                </h3>

                <p>
                    No customer orders yet.
                </p>

            </div>

        `;

        return;
    }


    orders.sort(
        (a, b) =>
            Number(b.id) -
            Number(a.id)
    );


    container.innerHTML = `

        <table class="admin-table">

            <thead>

                <tr>

                    <th>
                        Order ID
                    </th>

                    <th>
                        User ID
                    </th>

                    <th>
                        Product ID
                    </th>

                    <th>
                        Quantity
                    </th>

                    <th>
                        Total
                    </th>

                    <th>
                        Status
                    </th>

                    <th>
                        Update
                    </th>

                </tr>

            </thead>


            <tbody>

                ${
                    orders.map(order => `

                        <tr>

                            <td>
                                #${order.id}
                            </td>

                            <td>
                                ${order.userId}
                            </td>

                            <td>
                                ${order.productId}
                            </td>

                            <td>
                                ${order.quantity}
                            </td>

                            <td>
                                ₹${
                                    Number(
                                        order.totalPrice || 0
                                    ).toLocaleString(
                                        'en-IN'
                                    )
                                }
                            </td>

                            <td>

                                <span class="status">
                                    ${
                                        order.status ||
                                        'PENDING'
                                    }
                                </span>

                            </td>

                            <td>

                                <select
                                    class="status-select"
                                    onchange="
                                        updateOrderStatus(
                                            ${order.id},
                                            this.value
                                        )
                                    "
                                >

                                    <option
                                        value="PENDING"
                                        ${
                                            order.status ===
                                            'PENDING'
                                                ? 'selected'
                                                : ''
                                        }
                                    >
                                        PENDING
                                    </option>


                                    <option
                                        value="CONFIRMED"
                                        ${
                                            order.status ===
                                            'CONFIRMED'
                                                ? 'selected'
                                                : ''
                                        }
                                    >
                                        CONFIRMED
                                    </option>


                                    <option
                                        value="SHIPPED"
                                        ${
                                            order.status ===
                                            'SHIPPED'
                                                ? 'selected'
                                                : ''
                                        }
                                    >
                                        SHIPPED
                                    </option>


                                    <option
                                        value="DELIVERED"
                                        ${
                                            order.status ===
                                            'DELIVERED'
                                                ? 'selected'
                                                : ''
                                        }
                                    >
                                        DELIVERED
                                    </option>


                                    <option
                                        value="CANCELLED"
                                        ${
                                            order.status ===
                                            'CANCELLED'
                                                ? 'selected'
                                                : ''
                                        }
                                    >
                                        CANCELLED
                                    </option>

                                </select>

                            </td>

                        </tr>

                    `).join('')
                }

            </tbody>

        </table>

    `;
}


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

async function updateOrderStatus(
    orderId,
    status
) {

    try {

        const response =
            await fetch(
                `${ORDER_API}/${orderId}/status?status=${encodeURIComponent(status)}`,
                {
                    method: 'PUT'
                }
            );


        const text =
            await response.text();


        if (!response.ok) {

            throw new Error(
                text ||
                'Unable to update order status'
            );
        }


        alert(
            `Order #${orderId} updated to ${status}`
        );


        loadOrders();


    } catch (error) {

        console.error(
            'Status Update Error:',
            error
        );


        alert(
            error.message ||
            'Failed to update order status'
        );


        loadOrders();
    }
}


// ==========================================
// REFRESH
// ==========================================

function refreshCurrentSection() {

    const productsSection =
        document.querySelector(
            '#productsSection'
        );


    if (
        !productsSection.classList.contains(
            'hidden'
        )
    ) {

        loadProducts();

    } else {

        loadOrders();

    }
}


// ==========================================
// GO TO STORE
// ==========================================

function goHome() {

    window.location.href =
        '/';
}


// ==========================================
// LOGOUT
// ==========================================

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
// INITIAL LOAD
// ==========================================

loadProducts();