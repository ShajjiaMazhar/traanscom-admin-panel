const API_URL = "https://traanscom-backend-api.onrender.com/api";

/* =====================================================
STATIC UI DATA
===================================================== */

const categories = [
"Fashion",
"Electronics",
"Beauty",
"Home & Living",
"Accessories",
"Health & Care"
];

const currencies = [
{
code: "PKR",
name: "Pakistani Rupee",
symbol: "₨",
locale: "en-PK"
},
{
code: "USD",
name: "US Dollar",
symbol: "$",
locale: "en-US"
},
{
code: "GBP",
name: "British Pound",
symbol: "£",
locale: "en-GB"
},
{
code: "EUR",
name: "Euro",
symbol: "€",
locale: "de-DE"
},
{
code: "AED",
name: "UAE Dirham",
symbol: "د.إ",
locale: "en-AE"
},
{
code: "SAR",
name: "Saudi Riyal",
symbol: "﷼",
locale: "en-SA"
},
{
code: "CAD",
name: "Canadian Dollar",
symbol: "C$",
locale: "en-CA"
},
{
code: "AUD",
name: "Australian Dollar",
symbol: "A$",
locale: "en-AU"
},
{
code: "NZD",
name: "New Zealand Dollar",
symbol: "NZ$",
locale: "en-NZ"
},
{
code: "INR",
name: "Indian Rupee",
symbol: "₹",
locale: "en-IN"
},
{
code: "BDT",
name: "Bangladeshi Taka",
symbol: "৳",
locale: "en-BD"
},
{
code: "TRY",
name: "Turkish Lira",
symbol: "₺",
locale: "tr-TR"
}
];

/* =====================================================
REAL APPLICATION STATE
===================================================== */

let products = [];

let backendCategories = [];

let orders = [];

let pendingImage = "";

let pendingImageFile = null;

let customers =
JSON.parse(
localStorage.getItem("tcAdminCustomers") || "null"
) || [
{
name: "Ayesha Khan",
email: "[ayesha@example.com](mailto:ayesha@example.com)",
orders: 4,
spent: 32600,
status: "Active",
currency: "PKR"
},
{
name: "Ali Raza",
email: "[ali@example.com](mailto:ali@example.com)",
orders: 2,
spent: 14498,
status: "Active",
currency: "PKR"
},
{
name: "Sara Ahmed",
email: "[sara@example.com](mailto:sara@example.com)",
orders: 6,
spent: 48750,
status: "Active",
currency: "PKR"
},
{
name: "Usman Tariq",
email: "[usman@example.com](mailto:usman@example.com)",
orders: 1,
spent: 12499,
status: "Active",
currency: "PKR"
}
];

/* =====================================================
HELPERS
===================================================== */

const $ = selector =>
document.querySelector(selector);

function getCurrency(code) {


return (
    currencies.find(
        currency =>
            currency.code === code
    ) || currencies[0]
);


}

function money(
number,
code = "PKR"
) {


const currency =
    getCurrency(code);


return new Intl.NumberFormat(
    currency.locale,
    {
        style: "currency",
        currency: currency.code,

        maximumFractionDigits:
            ["PKR", "INR", "BDT"].includes(
                currency.code
            )
                ? 0
                : 2
    }
).format(
    Number(number) || 0
);


}

function getProductSellingPrice(product) {


const sale =
    Number(
        product.sale ??
        product.sale_price ??
        0
    );


const price =
    Number(
        product.price ?? 0
    );


return sale > 0
    ? sale
    : price;


}

/* =====================================================
IMAGE URL HELPER
===================================================== */

function getImageUrl(imageUrl) {


if (!imageUrl) {
    return "";
}


if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:")
) {

    return imageUrl;
}


return (
    "https://traanscom-backend.onrender.com" +
    imageUrl
);


}

/* =====================================================
LOGIN / APP SCREEN HELPERS
===================================================== */

function hideLoginScreen() {


const selectors = [
    "#loginScreen",
    "#loginPage",
    "#loginView",
    ".login-screen",
    ".login-page",
    ".auth-screen",
    ".auth-page"
];


selectors.forEach(
    selector => {

        document
            .querySelectorAll(selector)
            .forEach(element => {

                element.classList.add("hidden");

                element.style.display = "none";
            });
    }
);


}

function showAdminApplication() {


const selectors = [
    "#app",
    "#adminApp",
    "#adminPanel",
    ".admin-app",
    ".admin-panel",
    ".app-shell",
    ".dashboard-layout"
];


selectors.forEach(
    selector => {

        document
            .querySelectorAll(selector)
            .forEach(element => {

                element.classList.remove("hidden");

                element.style.display = "";
            });
    }
);


}

/* =====================================================
DATE / BADGE HELPERS
===================================================== */

function formatDate(date) {


if (!date) {
    return "-";
}


const d =
    new Date(date);


if (isNaN(d.getTime())) {
    return date;
}


return d.toLocaleDateString(
    "en-GB",
    {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }
);


}

function badge(status) {


const safeStatus =
    String(
        status || "pending"
    ).toLowerCase();


return `
    <span class="badge ${safeStatus}">
        ${status || "Pending"}
    </span>
`;


}

/* =====================================================
INITIALIZATION
===================================================== */

async function init() {
 /* =========================
       LOGIN BUTTON
       ========================= */

    if ($("#loginBtn")) {
        $("#loginBtn").onclick = loginAdmin;
    }

    /* =========================
       CURRENCY DROPDOWNS
       ========================= */

    if ($("#pCurrency")) {

        $("#pCurrency").innerHTML =
            currencies
                .map(currency => `
                    <option value="${currency.code}">
                        ${currency.code} — ${currency.name}
                    </option>
                `)
                .join("");

        $("#pCurrency").value = "PKR";
    }

    if ($("#storeCurrency")) {

        $("#storeCurrency").innerHTML =
            currencies
                .map(currency => `
                    <option value="${currency.code}">
                        ${currency.code} — ${currency.name}
                    </option>
                `)
                .join("");

        $("#storeCurrency").value = "PKR";
    }

    if ($("#pImage")) {


    $("#pImage").onchange =
        handleImage;
}


if ($("#removeImage")) {

    $("#removeImage").onclick =
        () => {

            pendingImage = "";

            pendingImageFile = null;

            if ($("#pImage")) {
                $("#pImage").value = "";
            }

            renderImagePreview();
        };
}


if ($("#productSearch")) {

    $("#productSearch").oninput =
        renderProducts;
}


if ($("#productCategory")) {

    $("#productCategory").onchange =
        renderProducts;
}


if ($("#addProductBtn")) {

    $("#addProductBtn").onclick =
        () =>
            openProductModal();
}


if ($("#closeProductModal")) {

    $("#closeProductModal").onclick =
        closeProductModal;
}


if ($("#cancelProduct")) {

    $("#cancelProduct").onclick =
        closeProductModal;
}


if ($("#modalBackdrop")) {

    $("#modalBackdrop").onclick =
        closeProductModal;
}


const token =
    localStorage.getItem(
        "traanscomAdminToken"
    );


if (token) {

    hideLoginScreen();

    showAdminApplication();

    showView("dashboard");


    await loadCategoriesFromBackend();

    await loadProductsFromBackend();

    await loadOrdersFromBackend();

    renderAll();
}


}



async function loginAdmin() {


const emailInput =
    $("#loginEmail");


const passwordInput =
    $("#loginPassword");


const loginButton =
    $("#loginBtn");


if (!emailInput || !passwordInput) {

    console.error(
        "Login fields not found."
    );

    return;
}


const email =
    emailInput.value.trim();


const password =
    passwordInput.value;


if (!email || !password) {

    toast(
        "Email aur password enter karein"
    );

    return;
}


try {

    if (loginButton) {

        loginButton.disabled =
            true;

        loginButton.textContent =
            "Logging in...";
    }


    const response =
        await fetch(
            `${API_URL}/users/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        email,
                        password
                    })
            }
        );


    const data =
        await response.json();


    console.log(
        "Admin login response:",
        data
    );


    if (!response.ok) {

        toast(
            data.message ||
            "Login failed"
        );

        return;
    }


    /* =========================
       ADMIN ROLE CHECK
       ========================= */

    if (
        data.user &&
        String(
            data.user.role
        ).toLowerCase() !== "admin"
    ) {

        toast(
            "Sirf admin account se login karein"
        );

        return;
    }


    /* =========================
       TOKEN CHECK
       ========================= */

    const token =
        data.token;


    if (!token) {

        console.error(
            "Login response mein token nahi mila:",
            data
        );


        toast(
            "Login token nahi mila"
        );

        return;
    }


    /* =========================
       SAVE TOKEN
       ========================= */

    localStorage.setItem(
        "traanscomAdminToken",
        token
    );


    if (data.user) {

        localStorage.setItem(
            "traanscomAdminUser",
            JSON.stringify(
                data.user
            )
        );
    }


    /* =========================
       VERIFY TOKEN
       ========================= */

    const savedToken =
        localStorage.getItem(
            "traanscomAdminToken"
        );


    if (!savedToken) {

        console.error(
            "Token localStorage mein save nahi hua."
        );


        toast(
            "Admin session save nahi ho saki"
        );

        return;
    }


    console.log(
        "Admin token saved successfully."
    );


    /* =========================
       SWITCH TO ADMIN PANEL
       ========================= */

    hideLoginScreen();

    showAdminApplication();


    /* =========================
       OPEN DASHBOARD
       ========================= */

    showView("dashboard");


    /* =========================
       LOAD DATA
       ========================= */

    await loadCategoriesFromBackend();

    await loadProductsFromBackend();

    await loadOrdersFromBackend();


    renderAll();


    toast(
        "Admin login successful"
    );


} catch (error) {

    console.error(
        "Login error:",
        error
    );


    toast(
        "Backend se connection nahi ho raha"
    );


} finally {

    if (loginButton) {

        loginButton.disabled =
            false;

        loginButton.textContent =
            "Login";
    }
}


}

/* =====================================================
LOGOUT
===================================================== */

if ($("#logoutBtn")) {


$("#logoutBtn").onclick =
    () => {

        localStorage.removeItem(
            "traanscomAdminToken"
        );


        localStorage.removeItem(
            "traanscomAdminUser"
        );


        location.reload();
    };


}

/* =====================================================
NAVIGATION
===================================================== */

function showView(view) {


document
    .querySelectorAll(".view")
    .forEach(
        element =>
            element.classList.add(
                "hidden"
            )
    );


const target =
    $("#" + view + "View");


if (target) {

    target.classList.remove(
        "hidden"
    );
}


document
    .querySelectorAll(".nav-item")
    .forEach(
        button =>
            button.classList.toggle(
                "active",
                button.dataset.view === view
            )
    );


const titles = {

    dashboard: [
        "Dashboard",
        "Store overview and quick actions"
    ],

    products: [
        "Products",
        "Manage your store inventory"
    ],

    orders: [
        "Orders",
        "Track and update customer orders"
    ],

    customers: [
        "Customers",
        "Customer accounts and order activity"
    ],

    settings: [
        "Settings",
        "Basic store configuration"
    ]
};


if (titles[view]) {

    if ($("#pageTitle")) {

        $("#pageTitle").textContent =
            titles[view][0];
    }


    if ($("#pageSubtitle")) {

        $("#pageSubtitle").textContent =
            titles[view][1];
    }
}


renderAll();


if (view === "products") {

    loadProductsFromBackend();
}


if (view === "orders") {

    loadOrdersFromBackend();
}


}

window.showView =
showView;

document
.querySelectorAll(".nav-item")
.forEach(
button =>
button.onclick =
() =>
showView(
button.dataset.view
)
);

if ($("#mobileMenu")) {


$("#mobileMenu").onclick =
    () =>
        $(".sidebar")
            ?.classList
            .toggle("open");


}

/* =====================================================
RENDER ALL
===================================================== */

function renderAll() {


renderStats();

renderRecent();

renderLowStock();

renderProducts();

renderOrders();

renderCustomers();


}

/* =====================================================
DASHBOARD STATS
===================================================== */

function renderStats() {


if ($("#statProducts")) {

    $("#statProducts")
        .textContent =
        products.length;
}


if ($("#statOrders")) {

    $("#statOrders")
        .textContent =
        orders.length;
}


if ($("#statCustomers")) {

    $("#statCustomers")
        .textContent =
        customers.length;
}


const revenue =
    orders
        .filter(
            order =>
                String(
                    order.order_status ||
                    order.status ||
                    ""
                ).toLowerCase() !==
                "cancelled"
        )
        .reduce(
            (
                total,
                order
            ) =>
                total +
                Number(
                    order.total || 0
                ),
            0
        );


if ($("#statRevenue")) {

    $("#statRevenue")
        .textContent =
        money(
            revenue,
            "PKR"
        );
}


}

/* =====================================================
RECENT ORDERS
===================================================== */

function renderRecent() {


if (!$("#recentOrders")) {
    return;
}


$("#recentOrders").innerHTML =
    orders
        .slice(0, 5)
        .map(
            order => {

                const status =
                    order.order_status ||
                    order.status ||
                    "pending";


                return `
                    <div class="order-mini">

                        <div>

                            <b>
                                ${
                                    order.order_number ||
                                    order.id
                                }
                            </b>

                            <span>
                                ${
                                    order.customer_name ||
                                    "Customer"
                                }
                            </span>

                        </div>


                        <div>

                            ${badge(status)}

                            <b>
                                ${money(
                                    order.total,
                                    order.currency ||
                                    "PKR"
                                )}
                            </b>

                        </div>

                    </div>
                `;
            }
        )
        .join("");


}

/* =====================================================
LOW STOCK
===================================================== */

function renderLowStock() {

if (!$("#lowStock")) {
    return;
}


const low =
    products
        .filter(
            product =>
                Number(
                    product.stock
                ) <= 7
        )
        .sort(
            (
                a,
                b
            ) =>
                Number(a.stock) -
                Number(b.stock)
        );


$("#lowStock").innerHTML =
    low.length

        ? low
            .map(
                product =>
                    `
                        <div class="stock-row">

                            <div>

                                <b>
                                    ${product.name}
                                </b>

                                <span>
                                    ${product.cat}
                                </span>

                            </div>


                            <b class="stock-number">
                                ${product.stock} left
                            </b>

                        </div>
                    `
            )
            .join("")

        : `
            <p class="muted">
                All products have healthy stock.
            </p>
        `;


}

/* =====================================================
REAL BACKEND CATEGORIES
===================================================== */

async function loadCategoriesFromBackend() {


const token =
    localStorage.getItem(
        "traanscomAdminToken"
    );


if (!token) {
    return;
}


try {

    const response =
        await fetch(
            `${API_URL}/categories`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


    const data =
        await response.json();


    if (
        response.status === 401 ||
        response.status === 403
    ) {

        return;
    }


    if (!response.ok) {

        console.error(
            "Categories error:",
            data
        );

        return;
    }


    backendCategories =
        Array.isArray(data)
            ? data
            : (
                data.categories ||
                []
            );


    const categoryNames =
        backendCategories
            .map(
                category =>
                    category.name
            )
            .filter(Boolean);


    if (
        categoryNames.length &&
        $("#pCategory") &&
        $("#productCategory")
    ) {

        $("#pCategory").innerHTML =
            categoryNames
                .map(
                    category =>
                        `
                            <option value="${category}">
                                ${category}
                            </option>
                        `
                )
                .join("");


        $("#productCategory").innerHTML =
            `
                <option value="all">
                    All categories
                </option>
            ` +
            categoryNames
                .map(
                    category =>
                        `
                            <option value="${category}">
                                ${category}
                            </option>
                        `
                )
                .join("");
    }


} catch (error) {

    console.error(
        "Categories connection error:",
        error
    );
}


}

/* =====================================================
CATEGORY ID
===================================================== */

function getCategoryId(
categoryName
) {


const category =
    backendCategories.find(
        item =>
            String(item.name)
                .toLowerCase() ===
            String(categoryName)
                .toLowerCase()
    );


return category
    ? category.id
    : null;


}

/* =====================================================
CONVERT BACKEND PRODUCT
===================================================== */

function mapBackendProduct(
product
) {


const price =
    Number(
        product.price ?? 0
    );


const sale =
    Number(
        product.sale_price ?? 0
    );


const category =
    backendCategories.find(
        item =>
            Number(item.id) ===
            Number(product.category_id)
    );


return {

    id:
        Number(
            product.id
        ),

    name:
        product.name ||
        "",

    cat:
        product.category_name ||
        category?.name ||
        "Fashion",

    price:
        price,

    sale:
        sale,

    sale_price:
        sale,

    stock:
        Number(
            product.stock_quantity ?? 0
        ),

    emoji:
        "📦",

    desc:
        product.description ||
        "",

    currency:
        product.currency ||
        "PKR",

    image:
        getImageUrl(
            product.image_url
        ),

    image_url:
        getImageUrl(
            product.image_url
        )
};

}

/* =====================================================
LOAD REAL PRODUCTS
===================================================== */

async function loadProductsFromBackend() {


const token =
    localStorage.getItem(
        "traanscomAdminToken"
    );


if (!token) {
    return;
}


try {

    const response =
        await fetch(
            `${API_URL}/products`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


    const data =
        await response.json();


    if (
        response.status === 401 ||
        response.status === 403
    ) {

        toast(
            "Admin session expire ho gaya"
        );


        localStorage.removeItem(
            "traanscomAdminToken"
        );


        localStorage.removeItem(
            "traanscomAdminUser"
        );


        location.reload();


        return;
    }


    if (!response.ok) {

        console.error(
            "Products error:",
            data
        );


        toast(
            data.message ||
            "Products load nahi ho rahe"
        );


        return;
    }


    const backendProducts =
        Array.isArray(data)
            ? data
            : (
                data.products ||
                []
            );


    products =
        backendProducts.map(
            mapBackendProduct
        );


    renderAll();


} catch (error) {

    console.error(
        "Products connection error:",
        error
    );


    toast(
        "Products backend se load nahi ho rahe"
    );
}


}

/* =====================================================
PRODUCT VISUAL
===================================================== */

function productVisual(
product
) {


return product.image

    ? `
        <img
            class="thumb-img"
            src="${product.image}"
            alt="Product image">
      `

    : `
        <span class="thumb">
            ${product.emoji || "📦"}
        </span>
      `;


}

/* =====================================================
RENDER PRODUCTS
===================================================== */

function renderProducts() {


if (!$("#productTable")) {
    return;
}


const search =
    (
        $("#productSearch")?.value ||
        ""
    )
        .toLowerCase();


const category =
    $("#productCategory")?.value ||
    "all";


const list =
    products.filter(
        product =>
            (
                category === "all" ||
                product.cat === category
            ) &&
            product.name
                .toLowerCase()
                .includes(search)
    );


$("#productTable").innerHTML =
    list
        .map(
            product => {

                const code =
                    product.currency ||
                    "PKR";


                const displayPrice =
                    getProductSellingPrice(
                        product
                    );


                const hasSale =
                    Number(
                        product.sale || 0
                    ) > 0;


                return `
                    <tr>

                        <td>

                            <div class="product-cell">

                                ${productVisual(product)}

                                <div>

                                    <b>
                                        ${product.name}
                                    </b>

                                    <small class="muted">
                                        ${
                                            product.desc ||
                                            ""
                                        }
                                    </small>

                                </div>

                            </div>

                        </td>


                        <td>
                            ${product.cat}
                        </td>


                        <td>

                            <span class="current-price">

                                ${money(
                                    displayPrice,
                                    code
                                )}

                            </span>


                            ${
                                hasSale

                                    ? `
                                        <br>

                                        <del class="muted">
                                            ${money(
                                                product.price,
                                                code
                                            )}
                                        </del>
                                      `

                                    : ""
                            }

                        </td>


                        <td>
                            ${product.stock}
                        </td>


                        <td>

                            ${
                                product.stock === 0

                                    ? `
                                        <span class="badge cancelled">
                                            Out of stock
                                        </span>
                                      `

                                    : product.stock <= 7

                                        ? `
                                            <span class="badge pending">
                                                Low stock
                                            </span>
                                          `

                                        : `
                                            <span class="badge delivered">
                                                In stock
                                            </span>
                                          `
                            }

                        </td>


                        <td>

                            <button
                                class="action-btn edit"
                                onclick="editProduct(${product.id})">
                                Edit
                            </button>


                            <button
                                class="action-btn delete"
                                onclick="deleteProduct(${product.id})">
                                Delete
                            </button>

                        </td>

                    </tr>
                `;
            }
        )
        .join("");

}

/* =====================================================
PRODUCT MODAL
===================================================== */

function openProductModal(
product = null
) {


if (!$("#productModal")) {
    return;
}


$("#productModal")
    .classList
    .add("show");


if ($("#modalBackdrop")) {

    $("#modalBackdrop")
        .classList
        .add("show");
}


if ($("#modalTitle")) {

    $("#modalTitle").textContent =
        product
            ? "Edit product"
            : "Add product";
}


if ($("#editId")) {

    $("#editId").value =
        product?.id || "";
}


if ($("#pName")) {

    $("#pName").value =
        product?.name || "";
}


if ($("#pCategory")) {

    $("#pCategory").value =
        product?.cat ||
        backendCategories[0]?.name ||
        "Fashion";
}


if ($("#pCurrency")) {

    $("#pCurrency").value =
        product?.currency ||
        "PKR";
}


if ($("#pPrice")) {

    $("#pPrice").value =
        product?.price ?? "";
}


if ($("#pSale")) {

    $("#pSale").value =
        product?.sale ?? "";
}


if ($("#pStock")) {

    $("#pStock").value =
        product?.stock ?? "";
}


if ($("#pDescription")) {

    $("#pDescription").value =
        product?.desc || "";
}


if ($("#pEmoji")) {

    $("#pEmoji").value =
        product?.emoji ||
        "📦";
}


pendingImage =
    product?.image || "";


pendingImageFile =
    null;


if ($("#pImage")) {

    $("#pImage").value = "";
}


renderImagePreview();


}

function closeProductModal() {


if ($("#productModal")) {

    $("#productModal")
        .classList
        .remove("show");
}


if ($("#modalBackdrop")) {

    $("#modalBackdrop")
        .classList
        .remove("show");
}


}

/* =====================================================
IMAGE HANDLING
===================================================== */

function handleImage(
event
) {


const file =
    event.target.files?.[0];


if (!file) {
    return;
}


const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
];


if (
    !allowedTypes.includes(
        file.type
    )
) {

    toast(
        "Sirf JPG, PNG ya WEBP image select karein"
    );


    event.target.value =
        "";


    pendingImageFile =
        null;


    return;
}


if (
    file.size >
    5 * 1024 * 1024
) {

    toast(
        "Please choose an image under 5 MB"
    );


    event.target.value =
        "";


    pendingImageFile =
        null;


    return;
}


pendingImageFile =
    file;


const reader =
    new FileReader();


reader.onload =
    () => {

        pendingImage =
            reader.result;


        renderImagePreview();
    };


reader.readAsDataURL(file);


}

function renderImagePreview() {


if (!$("#imagePreview")) {
    return;
}


$("#imagePreview").innerHTML =
    pendingImage

        ? `
            <img
                src="${pendingImage}"
                alt="Product preview">
          `

        : `
            <span class="empty-image">
                No image selected
            </span>
          `;


}

/* =====================================================
UPLOAD PRODUCT IMAGE
===================================================== */

async function uploadProductImage(
productId,
token
) {

if (!pendingImageFile) {

    return {
        success: true,
        skipped: true
    };
}


const formData =
    new FormData();


formData.append(
    "product_id",
    String(productId)
);


formData.append(
    "image",
    pendingImageFile
);


const response =
    await fetch(
        `${API_URL}/product-images/upload`,
        {
            method: "POST",

            headers: {
                "Authorization":
                    `Bearer ${token}`
            },

            body:
                formData
        }
    );


let data = {};


try {

    data =
        await response.json();

} catch (error) {

    data = {};
}


if (!response.ok) {

    console.error(
        "Image upload error:",
        data
    );


    throw new Error(
        data.message ||
        "Product image upload failed"
    );
}


return {
    success: true,
    data
};


}

/* =====================================================
ADD / UPDATE PRODUCT
===================================================== */

if ($("#productForm")) {


$("#productForm").onsubmit =
    async event => {

        event.preventDefault();


        const token =
            localStorage.getItem(
                "traanscomAdminToken"
            );


        if (!token) {

            toast(
                "Admin login required"
            );


            return;
        }


        const id =
            Number(
                $("#editId").value
            );


        const name =
            $("#pName")
                .value
                .trim();


        const categoryName =
            $("#pCategory").value;


        const categoryId =
            getCategoryId(
                categoryName
            );


        const currency =
            $("#pCurrency").value;


        const price =
            Number(
                $("#pPrice").value
            );


        const sale =
            Number(
                $("#pSale").value
            ) || 0;


        const stock =
            Number(
                $("#pStock").value
            );


        const description =
            $("#pDescription")
                .value
                .trim();


        if (!name) {

            toast(
                "Product name enter karein"
            );


            return;
        }


        if (!categoryId) {

            toast(
                "Product category nahi mili"
            );


            return;
        }


        if (
            !currencies.some(
                item =>
                    item.code === currency
            )
        ) {

            toast(
                "Valid currency select karein"
            );


            return;
        }


        if (
            isNaN(price) ||
            price < 0
        ) {

            toast(
                "Valid product price enter karein"
            );


            return;
        }


        if (
            isNaN(stock) ||
            stock < 0
        ) {

            toast(
                "Valid stock quantity enter karein"
            );


            return;
        }


        if (
            sale < 0
        ) {

            toast(
                "Sale price valid honi chahiye"
            );


            return;
        }


        if (
            sale > price &&
            sale > 0
        ) {

            toast(
                "Sale price original price se zyada nahi ho sakti"
            );


            return;
        }


        const slug =
            name
                .toLowerCase()
                .trim()
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    "");


        const productData = {

            category_id:
                categoryId,

            name:
                name,

            slug:
                slug,

            description:
                description,

            currency:
                currency,

            price:
                price,

            sale_price:
                sale > 0
                    ? sale
                    : null,

            stock_quantity:
                stock,

            sku:
                id
                    ? undefined
                    : `TR-${Date.now()}`,

            is_active:
                true,

            is_featured:
                false
        };


        if (
            productData.sku ===
            undefined
        ) {

            delete productData.sku;
        }


        try {

            let response;


            if (id) {

                response =
                    await fetch(
                        `${API_URL}/products/${id}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body:
                                JSON.stringify(
                                    productData
                                )
                        }
                    );

            } else {

                response =
                    await fetch(
                        `${API_URL}/products`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body:
                                JSON.stringify(
                                    productData
                                )
                        }
                    );
            }


            const data =
                await response.json();


            if (!response.ok) {

                console.error(
                    "Product save error:",
                    data
                );


                toast(
                    data.message ||
                    "Product save nahi hua"
                );


                return;
            }


            const savedProduct =
                data.product ||
                data;


            const productId =
                Number(
                    savedProduct.id ||
                    id
                );


            if (
                pendingImageFile &&
                productId
            ) {

                toast(
                    "Product save ho gaya, image upload ho rahi hai..."
                );


                try {

                    await uploadProductImage(
                        productId,
                        token
                    );

                } catch (imageError) {

                    console.error(
                        "Product image upload failed:",
                        imageError
                    );


                    closeProductModal();


                    await loadProductsFromBackend();


                    toast(
                        "Product save ho gaya lekin image upload nahi hui"
                    );


                    return;
                }
            }


            closeProductModal();


            pendingImage =
                "";

            pendingImageFile =
                null;


            await loadProductsFromBackend();


            toast(
                id
                    ? "Product updated successfully"
                    : "Product added successfully"
            );


        } catch (error) {

            console.error(
                "Product save connection error:",
                error
            );


            toast(
                error.message ||
                "Backend server check karein"
            );
        }
    };


}

/* =====================================================
EDIT PRODUCT
===================================================== */

window.editProduct =
id => {


    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (product) {

        openProductModal(
            product
        );
    }
};


/* =====================================================
DELETE PRODUCT
===================================================== */

window.deleteProduct =
async id => {


    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!product) {
        return;
    }


    if (
        !confirm(
            `Delete "${product.name}"?`
        )
    ) {

        return;
    }


    const token =
        localStorage.getItem(
            "traanscomAdminToken"
        );


    if (!token) {

        toast(
            "Admin login required"
        );


        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/products/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Product delete error:",
                data
            );


            toast(
                data.message ||
                "Product delete nahi hua"
            );


            return;
        }


        await loadProductsFromBackend();


        toast(
            "Product deleted successfully"
        );


    } catch (error) {

        console.error(
            "Product delete connection error:",
            error
        );


        toast(
            "Backend server check karein"
        );
    }
};


/* =====================================================
REAL BACKEND ORDERS
===================================================== */

async function loadOrdersFromBackend() {


const token =
    localStorage.getItem(
        "traanscomAdminToken"
    );


if (!token) {
    return;
}


try {

    const response =
        await fetch(
            `${API_URL}/orders`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );


    const data =
        await response.json();


    if (
        response.status === 401 ||
        response.status === 403
    ) {

        toast(
            "Admin session expire ho gaya"
        );


        localStorage.removeItem(
            "traanscomAdminToken"
        );


        localStorage.removeItem(
            "traanscomAdminUser"
        );


        location.reload();


        return;
    }


    if (!response.ok) {

        console.error(
            "Orders error:",
            data
        );


        toast(
            data.message ||
            "Orders load nahi ho rahe"
        );


        return;
    }


    orders =
        Array.isArray(data)
            ? data
            : (
                data.orders ||
                []
            );


    orders.sort(
        (
            first,
            second
        ) =>
            new Date(
                second.created_at
            ) -
            new Date(
                first.created_at
            )
    );


    renderAll();


} catch (error) {

    console.error(
        "Orders connection error:",
        error
    );


    toast(
        "Backend server check karein"
    );
}


}

/* =====================================================
RENDER ORDERS
===================================================== */

function renderOrders() {


if (!$("#orderTable")) {
    return;
}


if (!orders.length) {

    $("#orderTable").innerHTML = `
        <tr>
            <td
                colspan="6"
                style="text-align:center;padding:30px;">
                Abhi koi order nahi hai.
            </td>
        </tr>
    `;


    return;
}


const statuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled"
];


$("#orderTable").innerHTML =
    orders
        .map(
            order => {

                const status =
                    String(
                        order.order_status ||
                        order.status ||
                        "pending"
                    ).toLowerCase();


                const orderId =
                    order.id;


                const orderNumber =
                    order.order_number ||
                    `#${orderId}`;


                return `
                    <tr>

                        <td>
                            <b>
                                ${orderNumber}
                            </b>
                        </td>


                        <td>
                            ${
                                order.customer_name ||
                                "Customer"
                            }
                        </td>


                        <td>
                            ${formatDate(
                                order.created_at
                            )}
                        </td>


                        <td>
                            <b>
                                ${money(
                                    order.total,
                                    order.currency ||
                                    "PKR"
                                )}
                            </b>
                        </td>


                        <td>
                            ${badge(
                                status
                            )}
                        </td>


                        <td>

                            <select
                                onchange="updateOrder(${orderId}, this.value)">

                                ${
                                    statuses
                                        .map(
                                            item =>
                                                `
                                                    <option
                                                        value="${item}"
                                                        ${
                                                            item ===
                                                            status
                                                                ? "selected"
                                                                : ""
                                                        }>
                                                        ${
                                                            item
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            item.slice(1)
                                                        }
                                                    </option>
                                                `
                                        )
                                        .join("")
                                }

                            </select>

                        </td>

                    </tr>
                `;
            }
        )
        .join("");


}

/* =====================================================
UPDATE ORDER STATUS
===================================================== */

window.updateOrder =
async function(
orderId,
status
) {


    const token =
        localStorage.getItem(
            "traanscomAdminToken"
        );


    if (!token) {

        toast(
            "Admin login required"
        );


        return;
    }


    const cleanStatus =
        String(
            status
        )
            .trim()
            .toLowerCase();


    try {

        const response =
            await fetch(
                `${API_URL}/orders/${orderId}`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            order_status:
                                cleanStatus
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Update order error:",
                data
            );


            toast(
                data.message ||
                "Order update nahi hua"
            );


            await loadOrdersFromBackend();


            return;
        }


        toast(
            "Order status updated successfully"
        );


        await loadOrdersFromBackend();


    } catch (error) {

        console.error(
            "Update order connection error:",
            error
        );


        toast(
            "Backend server check karein"
        );
    }
};


/* =====================================================
CUSTOMERS
===================================================== */

function renderCustomers() {


if (!$("#customerTable")) {
    return;
}


$("#customerTable").innerHTML =
    customers
        .map(
            customer =>
                `
                    <tr>

                        <td>
                            <b>
                                ${customer.name}
                            </b>
                        </td>


                        <td>
                            ${customer.email}
                        </td>


                        <td>
                            ${customer.orders}
                        </td>


                        <td>

                            <b>
                                ${money(
                                    customer.spent,
                                    customer.currency ||
                                    "PKR"
                                )}
                            </b>

                        </td>


                        <td>

                            <span class="badge delivered">
                                ${customer.status}
                            </span>

                        </td>

                    </tr>
                `
        )
        .join("");


}

/* =====================================================
TOAST
===================================================== */

function toast(
message
) {


if (!$("#toast")) {
    return;
}


$("#toast")
    .textContent =
    message;


$("#toast")
    .classList
    .add("show");


setTimeout(
    () =>
        $("#toast")
            .classList
            .remove("show"),
    1600
);


}

/* =====================================================
START APPLICATION
===================================================== */

init();
