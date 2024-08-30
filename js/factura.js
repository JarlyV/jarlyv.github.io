// factura.js

// Obtener el carrito desde Local Storage
const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Función para generar la factura
function generarFactura() {
    const facturaDiv = document.getElementById('factura');
    
    if (carrito.length === 0) {
        facturaDiv.innerHTML = '<p>No hay productos en el carrito.</p>';
        return;
    }

    let total = 0;
    const tabla = document.createElement('table');
    tabla.classList.add('table', 'table-bordered');
    tabla.innerHTML = `
        <thead>
            <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${carrito.map(producto => {
                const totalProducto = producto.precio * producto.cantidad;
                total += totalProducto;
                return `
                    <tr>
                        <td>${producto.nombre}</td>
                        <td>${producto.cantidad}</td>
                        <td>$${producto.precio.toFixed(2)}</td>
                        <td>$${totalProducto.toFixed(2)}</td>
                    </tr>
                `;
            }).join('')}
            <tr>
                <td colspan="3" class="text-end"><strong>Total General:</strong></td>
                <td><strong>$${total.toFixed(2)}</strong></td>
            </tr>
        </tbody>
    `;
    facturaDiv.appendChild(tabla);
}

// Función para generar el PDF de la factura con estilo
function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Cargar la imagen del logo
    const logo = new Image();
    logo.src = '../img/logo.png';

    logo.onload = function () {
        const aspectRatio = logo.width / logo.height;
        const logoWidth = 50; // Ancho del logo en el PDF
        const logoHeight = logoWidth / aspectRatio; // Altura del logo manteniendo la proporción

        doc.addImage(logo, 'PNG', 10, 10, logoWidth, logoHeight);

        doc.text("Factura", 70, 30);

        const rows = carrito.map(producto => [
            producto.nombre,
            producto.cantidad,
            `$${producto.precio.toFixed(2)}`,
            `$${(producto.precio * producto.cantidad).toFixed(2)}`
        ]);

        const total = carrito.reduce((acc, producto) => acc + producto.precio * producto.cantidad, 0);
        
        doc.autoTable({
            head: [['Producto', 'Cantidad', 'Precio Unitario', 'Total']],
            body: rows,
            startY: 40
        });

        doc.text(`Total General: $${total.toFixed(2)}`, 14, doc.autoTable.previous.finalY + 10);

        doc.save("factura.pdf");
        finalizarCompra();
    };
}

// Función para finalizar la compra
function finalizarCompra() {
    localStorage.removeItem('carrito'); // Limpiar el carrito en Local Storage
    window.location.href = 'index.html'; // Redirigir a la página principal
}

// Generar la factura al cargar la página
generarFactura();

// Asignar la función generarPDF al botón
document.getElementById('btn-finalizar-compra').addEventListener('click', generarPDF);
