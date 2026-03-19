/* =============================================
   SIXSENSE — Main JavaScript
   ============================================= */

// ── CUSTOM CURSOR ──
const cursor = document.getElementById('cursor');
if (cursor) {
  document.addEventListener('mousemove', e => {
    cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
  });
}

// ── LOADER ──
(function initLoader() {
  const loader    = document.getElementById('loader');
  if (!loader) return;

  const pctEl     = loader.querySelector('.loader-percent');
  const barEl     = loader.querySelector('.loader-bar');
  const labelEl   = loader.querySelector('.loader-label');
  const barWrap   = loader.querySelector('.loader-bar-wrap');
  const logoEl    = loader.querySelector('.loader-logo');

  let pct = 0;
  const step = () => {
    pct += Math.random() * 15 + 8;
    if (pct >= 100) pct = 100;

    pctEl.textContent   = Math.floor(pct) + '%';
    barEl.style.width   = pct + '%';

    if (pct < 100) {
      setTimeout(step, 15 + Math.random() * 20);
    } else {
      // hide numbers, show logo
      setTimeout(() => {
        pctEl.classList.add('hide');
        barWrap.classList.add('hide');
        labelEl.classList.add('hide');
        logoEl.classList.add('show');

        // fade out loader
        setTimeout(() => {
          loader.classList.add('fade-out');
          setTimeout(() => {
            loader.style.display = 'none';
            document.body.style.overflow = '';
          }, 700);
        }, 800);
      }, 150);
    }
  };

  document.body.style.overflow = 'hidden';
  step();
})();

// ── NAV SHRINK ──
const nav = document.querySelector('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.style.padding = window.scrollY > 60 ? '14px 60px' : '24px 60px';
  });
}

// ── TAB SWITCHING ──
function switchTab(id, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('tab-' + id);
  if (target) target.classList.add('active');
  if (btn) {
    btn.classList.add('active');
  } else {
    const autoBtn = document.querySelector(`.tab-btn[onclick*="'${id}'"]`);
    if(autoBtn) autoBtn.classList.add('active');
  }
}

function navigateToTab(id, e) {
  if (e) e.stopPropagation();
  switchTab(id);
  const shopSection = document.getElementById('shop');
  if (shopSection) {
    const offsetPosition = shopSection.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
}

function showAllProducts(e) {
  if (e) e.preventDefault();
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('active'));
}

// ── CART ──
const CART_KEY = 'sixsense_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart  = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

function addToCart(name, price, icon, category, size) {
  const cart = getCart();
  const key  = name + '-' + (size || 'OS');
  const idx  = cart.findIndex(i => i.key === key);
  if (idx > -1) {
    cart[idx].qty++;
  } else {
    cart.push({ key, name, price, icon, category, size: size || 'OS', qty: 1 });
  }
  saveCart(cart);
  showToast(name + ' added to bag');
}

function removeFromCart(key) {
  const cart = getCart().filter(i => i.key !== key);
  saveCart(cart);
  renderCart();
}

function updateQty(key, delta) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.key === key);
  if (idx > -1) {
    cart[idx].qty = Math.max(1, cart[idx].qty + delta);
    saveCart(cart);
    renderCart();
  }
}

function renderCart() {
  const cart      = getCart();
  const listEl    = document.getElementById('cart-list');
  const emptyEl   = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');
  if (!listEl) return;

  if (cart.length === 0) {
    listEl.innerHTML    = '';
    if (emptyEl)   emptyEl.style.display   = 'block';
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }

  if (emptyEl)   emptyEl.style.display   = 'none';
  if (summaryEl) summaryEl.style.display = 'block';

  const priceStr = p => '₹ ' + Number(p).toLocaleString('en-IN');
  listEl.innerHTML = cart.map(item => `
    <div class="cart-item" data-key="${item.key}">
      <div class="cart-item-img">${item.icon}</div>
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-sub">${item.category} · Size ${item.size}</div>
        <div class="qty-control">
          <button class="qty-btn" onclick="updateQty('${item.key}', -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.key}', 1)">+</button>
          <button class="remove-btn" onclick="removeFromCart('${item.key}')">Remove</button>
        </div>
      </div>
      <div class="cart-item-price">${priceStr(item.price * item.qty)}</div>
    </div>
  `).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 10000 ? 0 : 499;
  const total    = subtotal + shipping;

  const subtotalEl = document.getElementById('summary-subtotal');
  const shippingEl = document.getElementById('summary-shipping');
  const totalEl    = document.getElementById('summary-total');
  if (subtotalEl) subtotalEl.textContent = priceStr(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : priceStr(shipping);
  if (totalEl)    totalEl.textContent    = priceStr(total);
}

// ── TOAST ──
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed; bottom:40px; left:50%; transform:translateX(-50%) translateY(20px);
      background:var(--sage-dark); color:var(--cream); padding:14px 32px;
      font-size:9px; letter-spacing:3px; text-transform:uppercase;
      font-family:Montserrat,sans-serif; z-index:9997; opacity:0;
      transition:all 0.4s ease; pointer-events:none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(-50%) translateY(20px)'; }, 2500);
}

// ── SIZE SELECTION (Product Detail) ──
function selectSize(btn) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

// ── CONTACT FORM ──
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn     = contactForm.querySelector('.form-submit');
    const success = document.getElementById('form-success');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(contactForm)).toString()
      });
      if (res.ok) {
        contactForm.reset();
        if (success) success.classList.add('show');
        btn.textContent = 'Message Sent';
      }
    } catch {
      btn.textContent = 'Try Again';
      btn.disabled = false;
    }
  });
}

// ── INIT ON LOAD ──
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  renderCart();

  // Save product details for dynamic product page rendering
  document.querySelectorAll('.product-detail-link').forEach(link => {
    link.addEventListener('click', e => {
      const card = e.currentTarget.closest('.product-card');
      const name = card.querySelector('.product-name').textContent;
      const priceText = card.querySelector('.product-price').textContent;
      const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
      const desc = card.querySelector('.product-desc').textContent;
      
      const photoEl = card.querySelector('.product-photo');
      const iconEl  = card.querySelector('.product-icon');
      
      const imgSrc = photoEl ? photoEl.getAttribute('src') : '';
      const icon   = iconEl ? iconEl.textContent : '';
      
      const catUrl = link.getAttribute('href'); 
      localStorage.setItem('currentProductView', JSON.stringify({ name, price, sub: desc, imgSrc, icon, catUrl }));
    });
  });
});

// ── CHECKOUT FLOW ──
function proceedToCheckout(btn) {
  const cartList = document.getElementById('cart-list');
  const checkoutContainer = document.getElementById('checkout-container');
  
  if (cartList && checkoutContainer) {
    cartList.style.display = 'none';
    checkoutContainer.style.display = 'block';
    
    // Smooth scroll to the checkout
    checkoutContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Change button purpose
    btn.textContent = 'Place Order';
    btn.onclick = function() { placeOrder(btn); };
  }
}

function selectPayment(label) {
  document.querySelectorAll('.payment-option').forEach(l => l.classList.remove('active'));
  label.classList.add('active');
  const cardDetails = document.getElementById('card-details');
  const upiDetails = document.getElementById('upi-details');
  const val = label.querySelector('input').value;
  
  if (val === 'card') {
    cardDetails.style.display = 'flex';
    cardDetails.querySelectorAll('input').forEach(i => i.setAttribute('required', 'true'));
    if(upiDetails) {
      upiDetails.style.display = 'none';
      upiDetails.querySelectorAll('input').forEach(i => i.removeAttribute('required'));
    }
  } else if (val === 'upi') {
    cardDetails.style.display = 'none';
    cardDetails.querySelectorAll('input').forEach(i => i.removeAttribute('required'));
    if(upiDetails) {
      upiDetails.style.display = 'flex';
      upiDetails.querySelectorAll('input').forEach(i => i.setAttribute('required', 'true'));
    }
  } else {
    cardDetails.style.display = 'none';
    cardDetails.querySelectorAll('input').forEach(i => i.removeAttribute('required'));
    if(upiDetails) {
      upiDetails.style.display = 'none';
      upiDetails.querySelectorAll('input').forEach(i => i.removeAttribute('required'));
    }
  }
}

function placeOrder(btn) {
  const form = document.getElementById('checkout-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  btn.textContent = 'Processing...';
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';
  
  setTimeout(() => {
    // Clear cart
    cart = [];
    saveCart();
    updateCartCount();
    
    // Show success view safely handling layout
    const layout = document.querySelector('.cart-layout');
    if (layout) {
      layout.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 80px 20px; animation: fadeIn 0.8s ease;">
          <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 42px; margin-bottom: 24px; color: var(--charcoal);">Thank You</h2>
          <p style="font-size: 15px; opacity: 0.7; margin-bottom: 40px; line-height: 1.6;">Your order has been placed and is being prepared with care.<br>A confirmation email has been sent to your provided address.</p>
          <a href="/#shop" class="btn-primary">Return to Shop</a>
        </div>
      `;
    }
  }, 1800);
}

// ── TOAST / EMAIL LOGIC ──
function showEmailPopup(e) {
  if (e) e.preventDefault();
  
  const existing = document.getElementById('email-popup');
  if(existing) existing.remove();
  
  const popup = document.createElement('div');
  popup.id = 'email-popup';
  popup.className = 'email-popup-toast';
  popup.innerHTML = `
    <div style="font-family: 'Cormorant Garamond', serif; font-size: 28px; color: var(--charcoal); margin-bottom: 12px; font-weight: 300;">Contact Us</div>
    <div style="font-family: var(--font-body); font-size: 18px; font-weight: 500; letter-spacing: 1.5px; color: var(--sage-dark);">thepiyushsuradkar@gmail.com</div>
  `;
  document.body.appendChild(popup);
  
  // Trigger transition
  void popup.offsetWidth;
  popup.classList.add('show');
  
  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => { if(popup.parentNode) popup.remove(); }, 600);
  }, 10000);
}
