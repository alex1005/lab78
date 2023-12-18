const apiUrl = 'http://localhost:3000';
let currentProducts;

async function getProducts() {
    try {
        const response = await fetch(`${apiUrl}/products`);
        if(!response.ok) throw `Response is not ok: ${response.status}`;
        const products = await response.json();
        const sorted = products.sort((a, b) => { 
            if(a.name < b.name) return -1;
            else if(a.name > b.name) return 1;
            else return 0;
        });
        currentProducts = sorted;
        cancelUpdate();
        displayProducts(sorted);
    } catch (error) {
        console.error('Error fetching products:', error);
        const reload = confirm("Could not load data! Reload?");
        if(reload) getProducts();
    }
}

function displayProducts(products) {
    const productListContainer = document.getElementById('product_list');
    productListContainer.innerHTML = '<h1>Product List</h1>';
    const refreshButton = document.createElement('div');
    productListContainer.appendChild(refreshButton);
    refreshButton.innerHTML = `<button class="controls" onclick="getProducts()"><i class="fa fa-refresh"> Refresh</i></button>`;
    if (products.length === 0) {
        productListContainer.innerHTML += '<p>No products available in the store yet.</p>';

    } else {
        const deleteAllButton = document.createElement('div');
        deleteAllButton.innerHTML = `<button class="controls" onclick="deleteAllProducts()"><i class="fa fa-trash"> Delete All Products</i></button>`;
        productListContainer.appendChild(deleteAllButton);
        const ol = document.createElement('ol');
        products.forEach((product, i) => {
            const li = document.createElement('li');
            const listItem = document.createElement('div');
            listItem.className = "list_item";
            const itemInfo = document.createElement('div');
            itemInfo.className = 'list_item_info';
            itemInfo.innerHTML = `<span class="name">${product.name}</span><br><span class="description">Description: ${product.description ? product.description : "**Not provided**"}</span><br><span class="price">Price: \$${product.price}</span>`;
            const itemControls = document.createElement('div');
            itemControls.className = 'list_item_controls';
            itemControls.innerHTML = `<button class="controls" onclick="deleteProduct(${i})"><i class="fa fa-trash"> Delete</i></button><br><button onclick="openUpdateForm(${i})" class="controls"><i class="fa fa-edit"> Update</i></button>`;
            listItem.appendChild(itemInfo);
            listItem.appendChild(itemControls);

            li.appendChild(listItem);
            ol.appendChild(li);
        });
        productListContainer.appendChild(ol);
    }
}

async function createProduct(event) {
    event.preventDefault();
    const productName = document.getElementById('newProductName').value;
    const productDescription = document.getElementById('newProductDescription').value;
    const productPrice = document.getElementById('newProductPrice').value;

    try {
        const response = await fetch(`${apiUrl}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: productName,
                description: productDescription,
                price: parseFloat(productPrice),
            })
        });
        
        if(!response.ok) throw `Response is not ok: ${response.status}`;
        const newProduct = await response.json();
        getProducts();
        alert("New product created successfully!");
    } catch (error) {
        console.error('Error creating product:', error);
        alert("Error! New product not created!");
    }
}

function openUpdateForm(localId) {
    if(!currentProducts.hasOwnProperty(localId)) {
        alert("No such product!");
        console.error('No such local index:', error);
        return;
    }
    const updateFormContainer = document.getElementById('updateForm');
    updateFormContainer.innerHTML = `<h1>Update product</h1>\
        <form onsubmit="updateProduct(event)">\
        <input type="text" value="${currentProducts[localId]._id}" id="updateProductId" hidden required>\
        <table>\
            <tr>\
                <td><label for="updatedPproductName">Name:</label></td>\
                <td><input type="text" id="updatedProductName" required value="${currentProducts[localId].name}"></td>\
            </tr>\
            <tr>\
                <td><label for="updatedProductDescription">Description:</label></td>\
                <td><input type="text" id="updatedProductDescription" value="${currentProducts[localId].description}"></td>\
            </tr>\
            <tr>\
                <td><label for="updatedProductPrice">Price ($):</label></td>\
                <td><input type="number" id="updatedProductPrice" step="0.01" required value="${currentProducts[localId].price}"></td>\
            </tr>\
        </table>\
        <button onclick="cancelUpdate()"><i class="fa fa-close"> Cancel</i></button>\
        <button type="submit"><i class="fa fa-edit"> Update</i></button>\
    </form>`;
}

function cancelUpdate() {
    const updateFormContainer = document.getElementById('updateForm');
    updateFormContainer.innerHTML = "";
}

async function updateProduct(event) {
    event.preventDefault();
    const productId = document.getElementById('updateProductId').value;
    const productName = document.getElementById('updatedProductName').value;
    const productDescription = document.getElementById('updatedProductDescription').value;
    const productPrice = document.getElementById('updatedProductPrice').value;

    try {
        const response = await fetch(`${apiUrl}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: productName,
                description: productDescription,
                price: parseFloat(productPrice),
            })
        });

        if(!response.ok) throw `Response is not ok: ${response.status}`;
        getProducts();
        alert("Product updated successfully!");
    } catch (error) {
        console.error('Error updating product:', error);
        alert("Error! Product not updated!");
    }
}

async function deleteProduct(localId) {
    if(!currentProducts.hasOwnProperty(localId)) {
        alert("No such product!");
        console.error('No such local index:', error);
        return;
    }
    const doDelete = confirm(`Are you sure you want to delete product '${currentProducts[localId].name}'?`);
    if(!doDelete) return;
    try {
        const response = await fetch(`${apiUrl}/products/${currentProducts[localId]._id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if(!response.ok) throw `Response is not ok: ${response.status}`;
        getProducts();
        alert("Product deleted!");
    } catch (error) {
        console.error('Error deleting product:', error);
        alert("Error! Product not deleted!");
    }
}

async function deleteAllProducts() {
    const doDelete = confirm(`Are you sure you want to delete all products?`);
    if(!doDelete) return;
    try {
        const response = await fetch(`${apiUrl}/products`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if(!response.ok) throw `Response is not ok: ${response.status}`;
        getProducts();
        alert("All products deleted!");
    } catch (error) {
        console.error('Error deleting products:', error);
        alert("Error! Products not deleted!");
    }
}