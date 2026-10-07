/* =========================================================
   Raíz — Tienda en línea de plantas y accesorios
   script.js
   Este archivo se comparte en las 6 páginas. Cada función
   revisa si los elementos que necesita existen antes de
   hacer algo, así no falla en páginas donde no aplica.
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  setActiveNavLink();
  initRegistroForm();
  initNosotrosToggle();
  initAddToCartButtons();
  initCarrito();
  initBusqueda();
});

/* ---------- Contador de carrito (ficticio, sin persistencia) ---------- */
let cartCount = 0;

function updateCartBadge() {
  const badge = document.getElementById("cart-count");
  if (badge) {
    badge.textContent = String(cartCount);
  }
}

function getToast() {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  return toast;
}

function showToast(message) {
  const toast = getToast();
  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

/* ---------- Menú de navegación en móvil ---------- */
function initNavToggle() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

/* ---------- Resalta el enlace de la página actual ---------- */
function setActiveNavLink() {
  const links = document.querySelectorAll(".main-nav a");
  const current = window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

/* ---------- Registro: habilitar botón y validar antes de enviar ---------- */
function initRegistroForm() {
  const form = document.getElementById("form-registro");
  if (!form) return;

  const checkbox = document.getElementById("terminos");
  const submitBtn = document.getElementById("btn-registro");
  const feedback = document.getElementById("form-feedback");
  const fieldIds = ["nombre", "email", "password", "fecha-nacimiento", "telefono"];

  checkbox.addEventListener("change", () => {
    submitBtn.disabled = !checkbox.checked;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    let hasEmptyField = false;
    fieldIds.forEach((id) => {
      const field = document.getElementById(id);
      const value = field.value.trim();
      field.classList.remove("field-error");
      if (value === "") {
        hasEmptyField = true;
        field.classList.add("field-error");
      }
    });

    if (hasEmptyField) {
      feedback.textContent = "Por favor completa todos los campos antes de continuar.";
      feedback.className = "form-feedback is-error";
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      feedback.textContent = "Revisa el formato de los campos marcados.";
      feedback.className = "form-feedback is-error";
      return;
    }

    feedback.textContent = "¡Registro completado! Pronto recibirás un correo de confirmación.";
    feedback.className = "form-feedback is-success";
    form.reset();
    submitBtn.disabled = true;
  });
}

/* ---------- Nosotros: mostrar/ocultar información adicional ---------- */
function initNosotrosToggle() {
  const button = document.getElementById("toggle-info");
  const extra = document.getElementById("team-extra");
  if (!button || !extra) return;

  button.addEventListener("click", () => {
    const isHidden = extra.hasAttribute("hidden");
    if (isHidden) {
      extra.removeAttribute("hidden");
      button.textContent = "Ver menos";
    } else {
      extra.setAttribute("hidden", "");
      button.textContent = "Ver más";
    }
  });
}

/* ---------- Agregar al carrito (Catálogo y Búsqueda) ---------- */
function initAddToCartButtons() {
  const buttons = document.querySelectorAll(".add-to-cart");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      cartCount += 1;
      updateCartBadge();
      const productName = button.getAttribute("data-product") || "El producto";
      showToast(`${productName} se agregó al carrito`);
    });
  });
}

/* ---------- Carrito: recalcular subtotal, envío y total ---------- */
function initCarrito() {
  const table = document.getElementById("cart-table");
  if (!table) return;

  const subtotalEl = document.getElementById("cart-subtotal");
  const shippingEl = document.getElementById("cart-shipping");
  const totalEl = document.getElementById("cart-total");
  const SHIPPING_COST = 99;

  function formatMoney(value) {
    return "$" + value.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function recalculateRow(row) {
    const input = row.querySelector(".qty-input");
    const price = parseFloat(row.getAttribute("data-price")) || 0;
    let qty = parseInt(input.value, 10);

    if (isNaN(qty) || qty < 0) {
      qty = 0;
      input.value = "0";
    }

    const lineTotal = price * qty;
    const lineTotalEl = row.querySelector(".line-total");
    if (lineTotalEl) {
      lineTotalEl.textContent = formatMoney(lineTotal);
    }
    return lineTotal;
  }

  function recalculateAll() {
    let subtotal = 0;
    table.querySelectorAll("tbody tr").forEach((row) => {
      subtotal += recalculateRow(row);
    });

    const shipping = subtotal > 0 ? SHIPPING_COST : 0;
    const total = subtotal + shipping;

    if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
    if (shippingEl) shippingEl.textContent = formatMoney(shipping);
    if (totalEl) totalEl.textContent = formatMoney(total);
  }

  table.addEventListener("input", (event) => {
    if (event.target.classList.contains("qty-input")) {
      recalculateAll();
    }
  });

  table.addEventListener("click", (event) => {
    const removeBtn = event.target.closest(".remove-btn");
    if (!removeBtn) return;
    const row = removeBtn.closest("tr");
    if (row) {
      row.remove();
      recalculateAll();
    }
  });

  recalculateAll();
}

/* ---------- Búsqueda: mostrar el término buscado ---------- */
function initBusqueda() {
  const form = document.getElementById("form-busqueda");
  if (!form) return;

  const input = document.getElementById("busqueda-input");
  const resultsBox = document.getElementById("resultados-busqueda");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const term = input.value.trim();

    resultsBox.innerHTML = "";
    const message = document.createElement("p");

    if (term === "") {
      message.className = "search-placeholder";
      message.textContent = "Escribe un término para buscar productos.";
    } else {
      message.textContent = `Resultados para la búsqueda de "${term}"`;
    }

    resultsBox.appendChild(message);
  });
}
