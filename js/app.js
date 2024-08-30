// app.js

let productos = JSON.parse(localStorage.getItem('productos')) || [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let currentPage = 1;
const itemsPerPage = 9;

// Función para cargar los productos desde un archivo JSON (solo si no están en Local Storage)
function cargarProductos() {
    if (productos.length === 0) {
        fetch('../data/productos.json')
            .then(response => response.json())
            .then(data => {
                productos = data;
                localStorage.setItem('productos', JSON.stringify(productos)); // Guardar productos en Local Storage
                mostrarProductos();
                renderPagination();
            })
            .catch(error => console.error('Error al cargar los productos:', error));
    } else {
        mostrarProductos();
        renderPagination();
    }
}

// Función para mostrar los productos en la página con paginación
function mostrarProductos() {
    const listaProductos = document.getElementById('lista-productos');
    listaProductos.innerHTML = ''; // Limpiar contenido anterior

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedProducts = productos.slice(start, end);

    paginatedProducts.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.classList.add('col-md-4', 'mb-3');
        productoDiv.innerHTML = `
            <div class="card">
                <img src="${producto.imagen}" class="card-img-top img-fluid" alt="${producto.nombre}">
                <div class="card-body">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text">${producto.descripcion}</p>
                    <p class="card-text">$${producto.precio.toFixed(2)}</p>
                    <p class="card-text">Disponibles: <span id="disponible-${producto.id}">${producto.cantidadDisponible}</span></p>
                    <input type="number" id="cantidad-${producto.id}" class="form-control mb-2" min="1" max="${producto.cantidadDisponible}" value="1" ${producto.cantidadDisponible === 0 ? 'disabled' : ''}>
                    <button id="btn-${producto.id}" class="btn btn-primary" onclick="agregarAlCarrito(${producto.id})" ${producto.cantidadDisponible === 0 ? 'disabled' : ''}>Agregar al Carrito</button>
                </div>
            </div>
        `;
        listaProductos.appendChild(productoDiv);
    });
}

// Función para renderizar la paginación
function renderPagination() {
    const totalPages = Math.ceil(productos.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = ''; // Limpiar paginación previa

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        if (i === currentPage) {
            pageItem.classList.add('active');
        }
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            mostrarProductos();
            renderPagination();
        });
        pagination.appendChild(pageItem);
    }
}

// Función para agregar productos al carrito
function agregarAlCarrito(idProducto) {
    const producto = productos.find(prod => prod.id === idProducto);
    const cantidadSeleccionada = parseInt(document.getElementById(`cantidad-${idProducto}`).value);
    const productoEnCarrito = carrito.find(prod => prod.id === idProducto);

    if (producto.cantidadDisponible < cantidadSeleccionada) {
        alert('No hay suficiente cantidad disponible.');
        return;
    }

    if (productoEnCarrito) {
        productoEnCarrito.cantidad += cantidadSeleccionada;
    } else {
        carrito.push({ ...producto, cantidad: cantidadSeleccionada });
    }

    producto.cantidadDisponible -= cantidadSeleccionada;
    document.getElementById(`disponible-${idProducto}`).textContent = producto.cantidadDisponible;

    if (producto.cantidadDisponible === 0) {
        document.getElementById(`btn-${idProducto}`).disabled = true;
        document.getElementById(`cantidad-${idProducto}`).disabled = true;
    }

    actualizarCarrito();
    localStorage.setItem('productos', JSON.stringify(productos)); // Actualizar el inventario en Local Storage
}

// Función para actualizar el carrito y guardarlo en Local Storage
function actualizarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    listaCarrito.innerHTML = '';

    carrito.forEach(producto => {
        const itemCarrito = document.createElement('div');
        itemCarrito.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        itemCarrito.innerHTML = `
            ${producto.nombre} - ${producto.cantidad} x $${producto.precio.toFixed(2)}
            <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${producto.id})">Eliminar</button>
        `;
        listaCarrito.appendChild(itemCarrito);
    });

    const total = carrito.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);
    document.getElementById('total').textContent = total.toFixed(2);

    // Guardar el carrito en Local Storage
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

// Función para eliminar productos del carrito
function eliminarDelCarrito(idProducto) {
    const productoEnCarrito = carrito.find(prod => prod.id === idProducto);
    if (productoEnCarrito) {
        const producto = productos.find(prod => prod.id === idProducto);
        producto.cantidadDisponible += productoEnCarrito.cantidad;

        carrito = carrito.filter(prod => prod.id !== idProducto);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        localStorage.setItem('productos', JSON.stringify(productos)); // Actualizar el inventario en Local Storage

        // Actualizar la cantidad disponible y los botones en todas las páginas
        document.querySelectorAll(`#disponible-${idProducto}`).forEach(span => {
            span.textContent = producto.cantidadDisponible;
        });
        document.querySelectorAll(`#btn-${idProducto}`).forEach(btn => {
            btn.disabled = producto.cantidadDisponible === 0;
        });
        document.querySelectorAll(`#cantidad-${idProducto}`).forEach(input => {
            input.disabled = producto.cantidadDisponible === 0;
            input.max = producto.cantidadDisponible;
        });
    }

    actualizarCarrito(); // Actualizar la vista del carrito
}

// Función para redirigir a la página de facturación
document.getElementById('btn-comprar').addEventListener('click', () => {
    if (carrito.length > 0) {
        window.location.href = 'factura.html';
    } else {
        alert('El carrito está vacío.');
    }
});

// Cargar los productos al cargar la página
cargarProductos();

// Cargar el carrito desde Local Storage al cargar la página
actualizarCarrito();
