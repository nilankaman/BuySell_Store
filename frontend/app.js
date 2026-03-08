const API = 'http://localhost:8081/api';

const S = {
  user: null,
  token: null,
  cart: null,
  wishlist: [],
  products: [],
  allProducts: [],
  currentFilter: 'all',
  checkoutStep: 1,
  checkoutData: {}
};

/* ─── TOAST ─── */
function toast(msg, type = 'info') {
  const icons = { success: '✓', error: '✕', info: '!' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ─── API ─── */
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (S.token) headers.Authorization = `Bearer ${S.token}`;
  const res = await fetch(API + path, { ...opts, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

/* ─── NAVIGATION ─── */
function go(page, data) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.getElementById('page-' + page)?.classList.add('active');
  window.scrollTo(0, 0);
  const map = { home: 0, shop: 1, wishlist: 2, orders: 3 };
  if (map[page] !== undefined) document.querySelectorAll('.nav-link')[map[page]]?.classList.add('active');
  if (page === 'home')     loadHome();
  if (page === 'shop')     loadShop();
  if (page === 'cart')     renderCart();
  if (page === 'wishlist') renderWishlist();
  if (page === 'orders')   loadOrders();
  if (page === 'profile')  renderProfile();
  if (page === 'admin')    loadAdmin();
  if (page === 'detail')   loadDetail(data);
  if (page === 'checkout') renderCheckout();
}

/* ─── MOBILE DRAWER ─── */
let drawerOpen = false;
function toggleDrawer() {
  drawerOpen = !drawerOpen;
  document.getElementById('mobile-drawer').classList.toggle('open', drawerOpen);
  document.getElementById('hamburger').classList.toggle('open', drawerOpen);
}
function mobileNav(page) { toggleDrawer(); go(page); }
function doMobileSearch() {
  const q = document.getElementById('mobile-search').value.trim();
  if (q) document.getElementById('search-input').value = q;
  doSearch();
}

/* ─── INIT ─── */
function initApp() {
  const token = localStorage.getItem('bs_token');
  const user  = localStorage.getItem('bs_user');
  if (token && user) { S.token = token; S.user = JSON.parse(user); }
  renderNav(); updateBadges(); loadHome();
}

/* ─── NAV ─── */
function renderNav() {
  const el      = document.getElementById('nav-auth');
  const mLogin  = document.getElementById('mobile-auth-link');
  const mProfile= document.getElementById('mobile-profile-link');
  const mLogout = document.getElementById('mobile-logout-link');
  if (S.user) {
    const initials = S.user.firstName[0] + S.user.lastName[0];
    el.innerHTML = `
      <div class="user-menu">
        <div class="user-avatar" onclick="toggleMenu()">${initials}</div>
        <div class="user-dropdown" id="user-dd">
          <div class="user-dropdown-head"><strong>${S.user.firstName} ${S.user.lastName}</strong><span>${S.user.email}</span></div>
          ${S.user.role === 'ADMIN' ? `<div class="dd-item" onclick="go('admin');closeMenu()">⚙️ Admin Panel</div><div class="dd-divider"></div>` : ''}
          <div class="dd-item" onclick="go('profile');closeMenu()">👤 My Profile</div>
          <div class="dd-item" onclick="go('orders');closeMenu()">📦 My Orders</div>
          <div class="dd-item" onclick="go('wishlist');closeMenu()">♡ Wishlist</div>
          <div class="dd-divider"></div>
          <div class="dd-item danger" onclick="logout()">🚪 Logout</div>
        </div>
      </div>`;
    mLogin.style.display = 'none'; mProfile.style.display = 'flex'; mLogout.style.display = 'flex';
  } else {
    el.innerHTML = `<button class="btn-login" onclick="go('auth')">Login</button>`;
    mLogin.style.display = 'flex'; mProfile.style.display = 'none'; mLogout.style.display = 'none';
  }
}
function toggleMenu() { document.getElementById('user-dd')?.classList.toggle('open'); }
function closeMenu()  { document.getElementById('user-dd')?.classList.remove('open'); }
document.addEventListener('click', e => { if (!e.target.closest('.user-menu')) closeMenu(); });

/* ─── AUTH TABS ─── */
function authTab(t) {
  document.querySelectorAll('.auth-tab').forEach((el, i) => el.classList.toggle('active', (i === 0 && t === 'login') || (i === 1 && t === 'register')));
  document.getElementById('form-login').classList.toggle('active', t === 'login');
  document.getElementById('form-register').classList.toggle('active', t === 'register');
}

async function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value;
  if (!email || !pass) return toast('Fill in all fields', 'error');
  try {
    const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password: pass }) });
    saveAuth(res.data); toast(`Welcome back, ${res.data.firstName}!`, 'success'); go('home');
  } catch(e) { toast(e.message, 'error'); }
}

async function doRegister() {
  const firstName = document.getElementById('r-first').value.trim();
  const lastName  = document.getElementById('r-last').value.trim();
  const email     = document.getElementById('r-email').value.trim();
  const password  = document.getElementById('r-pass').value;
  const phone     = document.getElementById('r-phone').value.trim();
  if (!firstName || !lastName || !email || !password) return toast('Fill in required fields', 'error');
  try {
    const res = await api('/auth/register', { method: 'POST', body: JSON.stringify({ firstName, lastName, email, password, phone }) });
    saveAuth(res.data); toast(`Welcome to BuySell, ${res.data.firstName}! 🎉`, 'success'); go('home');
  } catch(e) { toast(e.message, 'error'); }
}

function saveAuth(data) {
  S.token = data.token; S.user = data;
  localStorage.setItem('bs_token', data.token);
  localStorage.setItem('bs_user', JSON.stringify(data));
  renderNav();
}

function logout() {
  S.token = null; S.user = null; S.cart = null; S.wishlist = [];
  localStorage.removeItem('bs_token'); localStorage.removeItem('bs_user');
  renderNav(); updateBadges(); go('home');
  toast('Logged out. See you soon!', 'info');
  closeMenu(); if (drawerOpen) toggleDrawer();
}

/* ─── BADGES ─── */
function updateBadges() {
  const cb = document.getElementById('cart-badge');
  const wb = document.getElementById('wish-badge');
  const cc = S.cart?.totalItems || 0;
  const wc = S.wishlist?.length || 0;
  cb.style.display = cc > 0 ? 'flex' : 'none'; cb.textContent = cc;
  wb.style.display = wc > 0 ? 'flex' : 'none'; wb.textContent = wc;
}

/* ─── DEMO DATA ─── */
const DEMO = [
  { id:1, name:'Nike Air Max 270', category:'sneakers', price:14800, oldPrice:18000, rating:4.8, reviewCount:342, badge:'sale', imageUrl:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', colors:'Black,White,Red', sizes:'25,26,27,28,29' },
  { id:2, name:'Sony WH-1000XM5', category:'electronics', price:39800, oldPrice:44000, rating:4.9, reviewCount:1205, badge:'bestseller', imageUrl:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', colors:'Black,Silver', sizes:'' },
  { id:3, name:"Levi's 501 Jeans", category:'clothing', price:8900, oldPrice:11000, rating:4.6, reviewCount:892, badge:'sale', imageUrl:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', colors:'Indigo,Black', sizes:'28,30,32,34,36' },
  { id:4, name:'Apple AirPods Pro 2', category:'electronics', price:29800, rating:4.9, reviewCount:2341, badge:'new', imageUrl:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD2-5rGUTfacv3kcNhx44DT9zjliNWWzf8bA&s', colors:'White', sizes:'' },
  { id:5, name:'Uniqlo Down Jacket', category:'clothing', price:6990, oldPrice:8990, rating:4.7, reviewCount:654, badge:'sale', imageUrl:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', colors:'Black,Navy,Olive', sizes:'S,M,L,XL' },
  { id:6, name:'Adidas Ultraboost 23', category:'sneakers', price:19800, rating:4.7, reviewCount:487, badge:'new', imageUrl:'https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=600', colors:'Black,White', sizes:'25,26,27,28' },
  { id:7, name:'Anker MagGo Power Bank', category:'electronics', price:7980, oldPrice:9800, rating:4.5, reviewCount:321, badge:'sale', imageUrl:'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600', colors:'Black,White', sizes:'' },
  { id:8, name:'Champion Reverse Weave Hoodie', category:'clothing', price:5900, rating:4.5, reviewCount:289, badge:'new', imageUrl:'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600', colors:'Gray,Black,Navy', sizes:'XS,S,M,L,XL' },
];

/* ─── PRODUCT CARD ─── */
/* ─── ANIMATIONS ─── */
function animateCards(container) {
  const cards = container.querySelectorAll('.prod-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.style.transition = 'opacity .35s ease, transform .35s ease';
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 55);
  });
}

function prodCard(p) {
  const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : (p.discount || 0);
  const inWish = S.wishlist.some(w => (w.product?.id || w.id) === p.id);
  return `
    <div class="prod-card" onclick="go('detail',${p.id})">
      <div class="prod-img">
        <img src="${p.imageUrl || ''}" alt="${p.name}" loading="lazy" onerror="this.style.opacity=0" />
        ${p.badge ? `<div class="prod-badge badge-${p.badge}">${p.badge}</div>` : ''}
        <button class="wish-btn ${inWish ? 'saved' : ''}" onclick="event.stopPropagation();toggleWish(${p.id})" title="Wishlist">${inWish ? '♥' : '♡'}</button>
      </div>
      <div class="prod-info">
        <div class="prod-cat">${p.category}</div>
        <div class="prod-name">${p.name}</div>
        <div class="prod-rating"><span class="stars">${'★'.repeat(Math.round(p.rating || 0))}</span>${(p.rating || 0).toFixed(1)} (${p.reviewCount || 0})</div>
        <div class="prod-price">
          <span class="price">¥${p.price.toLocaleString()}</span>
          ${p.oldPrice ? `<span class="price-old">¥${p.oldPrice.toLocaleString()}</span>` : ''}
          ${disc ? `<span class="price-off">-${disc}%</span>` : ''}
        </div>
        <button class="add-btn" onclick="event.stopPropagation();quickAdd(${p.id})">Add to Cart</button>
      </div>
    </div>`;
}

/* ─── HOME ─── */
async function loadHome() {
  const el = document.getElementById('home-products');
  try {
    const res = await api('/products');
    S.allProducts = res.data?.length ? res.data : DEMO;
    S.products = S.allProducts;
    // DEBUG: log categories so you can see exact values from DB
    const cats = [...new Set(S.allProducts.map(p => p.category))];
    console.log('[BuySell] Categories from DB:', cats);
  } catch {
    S.allProducts = DEMO;
    S.products = DEMO;
  }
  el.innerHTML = S.allProducts.slice(0, 8).map((p, i) => prodCard(p, i)).join('');
  animateCards(el);
  buildFilterButtons(); // build filters from real data
  if (S.user) loadWishlistData();
}

/* ─── DYNAMIC FILTER BUTTONS — built from actual DB categories ─── */
const CAT_ICONS = { sneakers:'👟', electronics:'🎧', clothing:'👕', shoes:'👟', clothes:'👕', tech:'💻', accessories:'👜', watches:'⌚', bags:'👜' };
function buildFilterButtons() {
  if (!S.allProducts.length) return;
  const cats = [...new Set(S.allProducts.map(p => p.category).filter(Boolean))];
  const hasBadge = type => S.allProducts.some(p => p.badge?.toLowerCase() === type);
  const container = document.getElementById('filter-buttons');
  if (!container) return;

  let html = `<button class="f-btn ${S.currentFilter==='all'?'active':''}" onclick="setFilter('all',this)">All</button>`;
  cats.forEach(cat => {
    const icon = CAT_ICONS[cat.toLowerCase()] || '🏷️';
    const label = cat.charAt(0).toUpperCase() + cat.slice(1);
    html += `<button class="f-btn ${S.currentFilter===cat?'active':''}" onclick="setFilter('${cat}',this)">${icon} ${label}</button>`;
  });
  if (hasBadge('sale'))       html += `<button class="f-btn ${S.currentFilter==='sale'?'active':''}" onclick="setFilter('sale',this)">🔥 On Sale</button>`;
  if (hasBadge('new'))        html += `<button class="f-btn ${S.currentFilter==='new'?'active':''}" onclick="setFilter('new',this)">✨ New</button>`;
  if (hasBadge('bestseller')) html += `<button class="f-btn ${S.currentFilter==='bestseller'?'active':''}" onclick="setFilter('bestseller',this)">⭐ Bestseller</button>`;
  container.innerHTML = html;
}

/* ─── SHOP — CLIENT-SIDE FILTER (DYNAMIC, ALWAYS MATCHES DB) ─── */
async function loadShop() {
  const el = document.getElementById('shop-products');
  el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';

  try {
    if (!S.allProducts || S.allProducts.length === 0) {
      const res = await api('/products');
      S.allProducts = res.data?.length ? res.data : DEMO;
      console.log('[BuySell] Categories from DB:', [...new Set(S.allProducts.map(p => p.category))]);
    }

    buildFilterButtons();

    const f = S.currentFilter;
    let filtered = S.allProducts;

    if (f === 'sale' || f === 'new' || f === 'bestseller') {
      filtered = S.allProducts.filter(p => p.badge?.toLowerCase() === f);
    } else if (f !== 'all') {
      // exact match on the real category value (case-insensitive)
      filtered = S.allProducts.filter(p =>
        p.category?.toLowerCase().trim() === f.toLowerCase().trim()
      );
    }

    S.products = filtered;
    el.innerHTML = filtered.length
      ? filtered.map((p, i) => prodCard(p, i)).join('')
      : `<p style="color:var(--muted);padding:40px;text-align:center">No products found.</p>`;
    animateCards(el);

  } catch {
    const f = S.currentFilter;
    let filtered = DEMO;
    if (f === 'sale' || f === 'new' || f === 'bestseller') filtered = DEMO.filter(p => p.badge === f);
    else if (f !== 'all') filtered = DEMO.filter(p => p.category?.toLowerCase() === f.toLowerCase());
    S.products = filtered;
    el.innerHTML = filtered.map((p, i) => prodCard(p, i)).join('');
    animateCards(el);
  }
}

/* ─── FILTER BUTTONS ─── */
function setFilter(f, btn) {
  S.currentFilter = f;
  document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  loadShop();
}

function filterGo(cat) {
  S.currentFilter = cat;
  go('shop');
}

/* ─── SEARCH ─── */
function doSearch() {
  const q = document.getElementById('search-input').value.trim();
  if (!q) return;
  go('shop');
  setTimeout(async () => {
    const el = document.getElementById('shop-products');
    el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const res = await api(`/products/search?query=${encodeURIComponent(q)}`);
      el.innerHTML = (res.data || []).map(prodCard).join('') || `<p style="color:var(--muted);padding:40px">No results for "${q}"</p>`;
    } catch {
      const results = DEMO.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
      el.innerHTML = results.map(prodCard).join('') || `<p style="color:var(--muted);padding:40px">No results.</p>`;
    }
  }, 80);
}

/* ─── PRODUCT DETAIL ─── */
let dP = null, dQty = 1, dColor = null, dSize = null;

async function loadDetail(id) {
  const el = document.getElementById('detail-content');
  el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    let p;
    try {
      const res = await api(`/products/${id}`); p = res.data;
    } catch {
      p = (S.allProducts.length ? S.allProducts : DEMO).find(x => x.id == id);
      if (!p) { el.innerHTML = '<p style="color:var(--danger)">Product not found.</p>'; return; }
    }
    dP = p; dQty = 1;
    const colors = p.colors?.split(',').filter(Boolean) || [];
    const sizes  = p.sizes?.split(',').filter(Boolean) || [];
    dColor = colors[0] || null; dSize = sizes[0] || null;
    const disc = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : (p.discount || 0);
    const inWish = S.wishlist.some(w => (w.product?.id || w.id) === p.id);
    const colorMap = { Black:'#111',White:'#eee',Red:'#e74c3c',Blue:'#3498db',Navy:'#1a2a6c',Gray:'#888',Indigo:'#4b0082',Silver:'#aaa',Olive:'#6b8e23',Burgundy:'#800020','Light Blue':'#87CEEB',Denim:'#1560bd',Green:'#2ecc71' };

    el.innerHTML = `
      <button class="back-btn" onclick="history.back()">← Back</button>
      <div class="detail-grid">
        <div class="detail-img"><img src="${p.imageUrl || ''}" alt="${p.name}" onerror="this.style.opacity=0" /></div>
        <div>
          ${p.badge ? `<div class="prod-badge badge-${p.badge}" style="display:inline-block;margin-bottom:10px">${p.badge}</div>` : ''}
          <div class="detail-cat">${p.category}</div>
          <div class="detail-name">${p.name}</div>
          <div class="detail-rating">
            <span class="stars" style="font-size:16px">${'★'.repeat(Math.round(p.rating || 0))}</span>
            <span style="font-size:13px;color:var(--muted)">${(p.rating || 0).toFixed(1)} · ${p.reviewCount || 0} reviews</span>
          </div>
          <div class="detail-price-block">
            <div class="detail-price">¥${p.price.toLocaleString()}</div>
            ${p.oldPrice ? `<div class="detail-old">¥${p.oldPrice.toLocaleString()}</div>` : ''}
            ${disc ? `<div style="padding:3px 9px;background:rgba(255,107,53,.12);border-radius:4px;font-size:11px;font-weight:700;color:var(--accent2)">${disc}% OFF</div>` : ''}
          </div>
          ${p.description ? `<p class="detail-desc">${p.description}</p>` : ''}
          ${colors.length ? `
            <div class="opt-label">Color: <strong id="color-sel">${dColor}</strong></div>
            <div class="color-opts">${colors.map(c => `<div class="color-opt${c === dColor ? ' sel' : ''}" style="background:${colorMap[c] || '#555'}" onclick="pickColor('${c}')" title="${c}"></div>`).join('')}</div>` : ''}
          ${sizes.length ? `
            <div class="opt-label">Size: <strong id="size-sel">${dSize}</strong></div>
            <div class="size-opts">${sizes.map(s => `<div class="size-opt${s === dSize ? ' sel' : ''}" onclick="pickSize('${s}')">${s}</div>`).join('')}</div>` : ''}
          <div class="qty-row">
            <span class="opt-label" style="margin:0">Qty</span>
            <div class="qty-ctrl">
              <button class="qty-btn" onclick="changeQty(-1)">−</button>
              <div class="qty-num" id="d-qty">1</div>
              <button class="qty-btn" onclick="changeQty(1)">+</button>
            </div>
          </div>
          <div class="detail-actions">
            <button class="btn-cart" onclick="addDetailToCart()">Add to Cart 🛒</button>
            <button class="btn-wish ${inWish ? 'saved' : ''}" id="detail-wish-btn" onclick="toggleWishDetail(${p.id})">${inWish ? '♥' : '♡'}</button>
          </div>
          <div class="detail-meta">🚚 Free shipping on orders over ¥5,000 &nbsp;|&nbsp; 📦 ${p.stock || 0} in stock</div>
        </div>
      </div>`;
  } catch(e) { el.innerHTML = `<p style="color:var(--danger)">${e.message}</p>`; }
}

function pickColor(c) { dColor = c; document.getElementById('color-sel').textContent = c; document.querySelectorAll('.color-opt').forEach(el => el.classList.toggle('sel', el.title === c)); }
function pickSize(s)  { dSize  = s; document.getElementById('size-sel').textContent  = s; document.querySelectorAll('.size-opt').forEach(el => el.classList.toggle('sel', el.textContent === s)); }
function changeQty(d) { dQty = Math.max(1, dQty + d); document.getElementById('d-qty').textContent = dQty; }

async function addDetailToCart() {
  if (!S.user) { go('auth'); return toast('Login to add items to cart', 'info'); }
  try {
    const res = await api('/cart/add', { method: 'POST', body: JSON.stringify({ productId: dP.id, quantity: dQty, selectedColor: dColor, selectedSize: dSize }) });
    S.cart = res.data; updateBadges(); toast(`${dP.name} added to cart!`, 'success');
  } catch(e) { toast(e.message, 'error'); }
}

async function quickAdd(id) {
  if (!S.user) { go('auth'); return toast('Login to add items to cart', 'info'); }
  try {
    const res = await api('/cart/add', { method: 'POST', body: JSON.stringify({ productId: id, quantity: 1 }) });
    S.cart = res.data; updateBadges();
    const name = S.allProducts.find(p => p.id == id)?.name || 'Item';
    toast(`${name} added!`, 'success');
  } catch(e) { toast(e.message, 'error'); }
}

/* ─── WISHLIST ─── */
async function loadWishlistData() {
  if (!S.user) return;
  try { const res = await api('/wishlist'); S.wishlist = res.data || []; updateBadges(); } catch {}
}

async function renderWishlist() {
  if (!S.user) { go('auth'); return toast('Login to view wishlist', 'info'); }
  const el = document.getElementById('wishlist-products');
  el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  await loadWishlistData();
  if (!S.wishlist.length) {
    el.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">♡</div><h3>Nothing saved yet</h3><p>Tap the heart on any product to save it.</p><button class="btn-primary" onclick="go('shop')">Browse Shop</button></div>`;
    return;
  }
  el.innerHTML = S.wishlist.map(w => prodCard(w.product || w)).join('');
}

async function toggleWish(productId) {
  if (!S.user) { go('auth'); return toast('Login to save items', 'info'); }
  const inWish = S.wishlist.some(w => (w.product?.id || w.id) === productId);
  try {
    if (inWish) {
      await api(`/wishlist/${productId}`, { method: 'DELETE' });
      S.wishlist = S.wishlist.filter(w => (w.product?.id || w.id) !== productId);
      toast('Removed from wishlist', 'info');
    } else {
      const res = await api(`/wishlist/${productId}`, { method: 'POST' });
      S.wishlist.push(res.data);
      toast('Saved to wishlist ♥', 'success');
    }
    updateBadges();
    if (document.getElementById('page-home').classList.contains('active'))
      document.getElementById('home-products').innerHTML = S.allProducts.slice(0, 8).map(prodCard).join('');
    if (document.getElementById('page-shop').classList.contains('active'))
      document.getElementById('shop-products').innerHTML = S.products.map(prodCard).join('');
  } catch(e) { toast(e.message, 'error'); }
}

async function toggleWishDetail(productId) {
  await toggleWish(productId);
  const btn = document.getElementById('detail-wish-btn');
  if (btn) {
    const inWish = S.wishlist.some(w => (w.product?.id || w.id) === productId);
    btn.textContent = inWish ? '♥' : '♡';
    btn.classList.toggle('saved', inWish);
  }
}

/* ─── CART ─── */
async function renderCart() {
  const el = document.getElementById('cart-content');
  if (!S.user) {
    el.innerHTML = `<div class="cart-wrap"><div class="empty"><div class="empty-icon">🛒</div><h3>Please login</h3><p>You need an account to use the cart.</p><button class="btn-primary" onclick="go('auth')">Login</button></div></div>`;
    return;
  }
  el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try { const res = await api('/cart'); S.cart = res.data; } catch {}
  const cart = S.cart;
  if (!cart?.items?.length) {
    el.innerHTML = `<div class="cart-wrap"><div class="empty"><div class="empty-icon">🛒</div><h3>Cart is empty</h3><p>Find something you love!</p><button class="btn-primary" onclick="go('shop')">Browse Products</button></div></div>`;
    return;
  }
  el.innerHTML = `
    <div class="cart-wrap">
      <div>
        <h2 style="font-family:'Bebas Neue';font-size:30px;margin-bottom:20px;letter-spacing:1px">CART (${cart.totalItems})</h2>
        <div class="cart-list">
          ${cart.items.map(item => `
            <div class="cart-item">
              <img src="${item.product?.imageUrl || ''}" alt="${item.product?.name}" onerror="this.style.opacity=0" />
              <div class="cart-item-info">
                <div class="cart-item-name">${item.product?.name}</div>
                <div class="cart-item-meta">${[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ') || item.product?.category}</div>
                <div class="cart-item-price">¥${(item.product?.price || 0).toLocaleString()}</div>
              </div>
              <div style="display:flex;align-items:center;gap:12px">
                <div class="cart-qty-ctrl">
                  <button onclick="updateQty(${item.id},${item.quantity - 1})">−</button>
                  <span>${item.quantity}</span>
                  <button onclick="updateQty(${item.id},${item.quantity + 1})">+</button>
                </div>
                <div style="font-family:'Space Mono';font-weight:700;min-width:72px;text-align:right">¥${((item.subtotal || item.product?.price * item.quantity) || 0).toLocaleString()}</div>
                <span class="cart-remove" onclick="removeItem(${item.id})">🗑</span>
              </div>
            </div>`).join('')}
        </div>
      </div>
      <div>
        <div class="summary-box">
          <h3>Order Summary</h3>
          <div class="sum-row"><span>Subtotal</span><span>¥${(cart.totalAmount || 0).toLocaleString()}</span></div>
          <div class="sum-row"><span>Shipping</span><span class="${cart.shippingCost === 0 ? 'free-ship' : ''}">${cart.shippingCost === 0 ? 'FREE' : '¥' + (cart.shippingCost || 800).toLocaleString()}</span></div>
          ${cart.shippingCost > 0 ? `<div style="font-size:11px;color:var(--muted);margin-top:-4px;margin-bottom:8px">Add ¥${(5000 - cart.totalAmount).toLocaleString()} for free shipping</div>` : ''}
          <div class="sum-row total"><span>Total</span><span>¥${(cart.grandTotal || 0).toLocaleString()}</span></div>
          <button class="checkout-btn" onclick="go('checkout')">Checkout →</button>
          <button onclick="go('shop')" style="width:100%;padding:10px;background:none;border:1px solid var(--border);border-radius:8px;color:var(--muted);margin-top:8px;font-size:13px;cursor:pointer">Continue Shopping</button>
        </div>
      </div>
    </div>`;
  updateBadges();
}

async function updateQty(itemId, qty) {
  try { const res = await api(`/cart/item/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity: qty }) }); S.cart = res.data; renderCart(); updateBadges(); }
  catch(e) { toast(e.message, 'error'); }
}
async function removeItem(itemId) {
  try { const res = await api(`/cart/item/${itemId}`, { method: 'DELETE' }); S.cart = res.data; renderCart(); updateBadges(); toast('Removed', 'info'); }
  catch(e) { toast(e.message, 'error'); }
}

/* ─── CHECKOUT ─── */
function renderCheckout() {
  if (!S.user) { go('auth'); return; }
  S.checkoutStep = 1; renderCheckoutStep(); updateStepUI();
}
function updateStepUI() {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById(`cstep${i}`);
    el.className = 'step' + (i < S.checkoutStep ? ' done' : i === S.checkoutStep ? ' active' : '');
  });
}
function renderCheckoutStep() {
  const el   = document.getElementById('checkout-content');
  const cart = S.cart;
  const u    = S.user;
  if (S.checkoutStep === 1) {
    el.innerHTML = `
      <div class="form-card">
        <h3>📦 Shipping Address</h3>
        <div class="row2">
          <div class="form-group"><label class="form-label">First Name</label><input class="form-input" id="sh-first" value="${u.firstName || ''}" /></div>
          <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" id="sh-last" value="${u.lastName || ''}" /></div>
        </div>
        <div class="form-group"><label class="form-label">Address *</label><input class="form-input" id="sh-addr" placeholder="1-2-3 Shibuya, Shibuya-ku" /></div>
        <div class="row2">
          <div class="form-group"><label class="form-label">City *</label><input class="form-input" id="sh-city" placeholder="Tokyo" /></div>
          <div class="form-group"><label class="form-label">Postal Code *</label><input class="form-input" id="sh-zip" placeholder="150-0001" /></div>
        </div>
      </div>
      <div class="form-card" style="padding:14px 18px">
        <div class="sum-row"><span>Subtotal</span><span>¥${(cart?.totalAmount || 0).toLocaleString()}</span></div>
        <div class="sum-row"><span>Shipping</span><span>${cart?.shippingCost === 0 ? 'FREE' : '¥' + (cart?.shippingCost || 800).toLocaleString()}</span></div>
        <div class="sum-row total"><span>Total</span><span>¥${(cart?.grandTotal || 0).toLocaleString()}</span></div>
      </div>
      <button class="place-btn" onclick="nextStep()">Continue to Payment →</button>`;
  }
  if (S.checkoutStep === 2) {
    const methods = [
      { id:'CREDIT_CARD',   icon:'💳', name:'Credit / Debit Card', desc:'Visa, Mastercard, AMEX' },
      { id:'PAYPAY',        icon:'📱', name:'PayPay',               desc:"Japan's #1 mobile payment" },
      { id:'BANK_TRANSFER', icon:'🏦', name:'Bank Transfer',        desc:'Direct bank payment' },
      { id:'CASH_ON_DELIVERY', icon:'💴', name:'Cash on Delivery',  desc:'Pay when delivered' },
    ];
    const sel = S.checkoutData.paymentMethod || 'CREDIT_CARD';
    el.innerHTML = `
      <div class="form-card">
        <h3>💳 Payment Method</h3>
        <div class="pay-options">
          ${methods.map(m => `
            <div class="pay-opt${m.id === sel ? ' sel' : ''}" onclick="pickPayment('${m.id}')">
              <div class="pay-opt-icon">${m.icon}</div>
              <div class="pay-opt-info"><strong>${m.name}</strong><span>${m.desc}</span></div>
              <div class="pay-radio"><div class="pay-radio-dot"></div></div>
            </div>`).join('')}
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn-outline" style="flex:1;padding:14px" onclick="S.checkoutStep=1;updateStepUI();renderCheckoutStep()">← Back</button>
        <button class="place-btn" style="flex:2" onclick="nextStep()">Review Order →</button>
      </div>`;
  }
  if (S.checkoutStep === 3) {
    el.innerHTML = `
      <div class="form-card">
        <h3>✅ Review Your Order</h3>
        ${(cart?.items || []).map(item => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
            <img src="${item.product?.imageUrl || ''}" style="width:48px;height:48px;border-radius:6px;object-fit:cover" onerror="this.style.opacity=0" />
            <div style="flex:1"><div style="font-weight:600;font-size:13px">${item.product?.name}</div><div style="font-size:11px;color:var(--muted)">Qty: ${item.quantity}</div></div>
            <div style="font-family:'Space Mono';font-weight:700;color:var(--accent)">¥${((item.product?.price || 0) * item.quantity).toLocaleString()}</div>
          </div>`).join('')}
        <div style="margin-top:14px;padding:14px;background:var(--bg3);border-radius:8px;font-size:13px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--muted)">Ship to:</span><span>${S.checkoutData.address}, ${S.checkoutData.city}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="color:var(--muted)">Payment:</span><span>${(S.checkoutData.paymentMethod || '').replace(/_/g, ' ')}</span></div>
          <div style="display:flex;justify-content:space-between;font-weight:700;font-size:15px;padding-top:10px;border-top:1px solid var(--border)"><span>Total:</span><span style="color:var(--accent)">¥${(cart?.grandTotal || 0).toLocaleString()}</span></div>
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn-outline" style="flex:1;padding:14px" onclick="S.checkoutStep=2;updateStepUI();renderCheckoutStep()">← Back</button>
        <button class="place-btn" style="flex:2" onclick="placeOrder()">Place Order 🎉</button>
      </div>`;
  }
}
function nextStep() {
  if (S.checkoutStep === 1) {
    const addr = document.getElementById('sh-addr')?.value.trim();
    const city = document.getElementById('sh-city')?.value.trim();
    const zip  = document.getElementById('sh-zip')?.value.trim();
    if (!addr || !city || !zip) return toast('Fill in all address fields', 'error');
    S.checkoutData = { ...S.checkoutData, address: addr, city, postalCode: zip };
  }
  if (S.checkoutStep === 2 && !S.checkoutData.paymentMethod) S.checkoutData.paymentMethod = 'CREDIT_CARD';
  S.checkoutStep++; updateStepUI(); renderCheckoutStep();
}
function pickPayment(id) { S.checkoutData.paymentMethod = id; renderCheckoutStep(); }

async function placeOrder() {
  try {
    const res = await api('/orders', { method: 'POST', body: JSON.stringify({
      shippingAddress: S.checkoutData.address, shippingCity: S.checkoutData.city,
      shippingPostalCode: S.checkoutData.postalCode, paymentMethod: S.checkoutData.paymentMethod || 'CREDIT_CARD',
    })});
    S.cart = null; updateBadges();
    document.getElementById('success-num').textContent = res.data.orderNumber;
    go('success');
  } catch(e) { toast(e.message, 'error'); }
}

/* ─── ORDERS ─── */
async function loadOrders() {
  if (!S.user) { go('auth'); return; }
  const el = document.getElementById('orders-content');
  el.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
  try {
    const res = await api('/orders');
    const orders = res.data || [];
    if (!orders.length) {
      el.innerHTML = `<div class="empty"><div class="empty-icon">📦</div><h3>No orders yet</h3><p>Start shopping and your orders will appear here.</p><button class="btn-primary" onclick="go('shop')">Shop Now</button></div>`;
      return;
    }
    el.innerHTML = orders.map(o => `
      <div class="order-card">
        <div class="order-head" onclick="toggleOrder('ob-${o.id}')">
          <div><div class="o-num">${o.orderNumber}</div><div class="o-date">${new Date(o.createdAt).toLocaleDateString('ja-JP')}</div></div>
          <div style="font-size:12px;color:var(--muted)">${o.items?.length || 0} items</div>
          <span class="o-status s-${(o.status || '').toLowerCase()}">${o.status}</span>
          <div class="o-total">¥${(o.totalAmount || 0).toLocaleString()}</div>
          <span style="color:var(--muted)">›</span>
        </div>
        <div class="order-body" id="ob-${o.id}">
          ${(o.items || []).map(item => `
            <div class="o-prod-row">
              <img class="o-prod-img" src="${item.productImageUrl || ''}" onerror="this.style.opacity=0" />
              <div style="flex:1"><div style="font-weight:600;font-size:13px">${item.productName}</div><div style="font-size:11px;color:var(--muted)">Qty: ${item.quantity} · ¥${(item.unitPrice || 0).toLocaleString()}</div></div>
              <div style="font-family:'Space Mono';font-weight:700;font-size:13px">¥${((item.unitPrice || 0) * item.quantity).toLocaleString()}</div>
            </div>`).join('')}
          ${['PENDING','CONFIRMED','PROCESSING'].includes(o.status) ? `<button class="cancel-btn" onclick="cancelOrder('${o.orderNumber}')">Cancel Order</button>` : ''}
        </div>
      </div>`).join('');
  } catch(e) { el.innerHTML = `<p style="color:var(--danger)">${e.message}</p>`; }
}
function toggleOrder(id) { document.getElementById(id)?.classList.toggle('open'); }
async function cancelOrder(num) {
  if (!confirm('Cancel this order?')) return;
  try { await api(`/orders/${num}/cancel`, { method: 'POST' }); toast('Order cancelled', 'info'); loadOrders(); }
  catch(e) { toast(e.message, 'error'); }
}

/* ─── PROFILE ─── */
let profileTabActive = 'info';
async function renderProfile() {
  if (!S.user) { go('auth'); return; }
  try { const res = await api('/auth/me'); S.user = { ...S.user, ...res.data }; localStorage.setItem('bs_user', JSON.stringify(S.user)); } catch {}
  const u = S.user;
  document.getElementById('profile-header').innerHTML = `
    <div class="profile-avatar">${u.firstName[0]}${u.lastName[0]}</div>
    <div><div class="profile-name">${u.firstName} ${u.lastName}</div><div class="profile-email">${u.email}</div><span class="profile-role">${u.role}</span></div>`;
  profileTab(profileTabActive);
}
function profileTab(t) {
  profileTabActive = t;
  document.querySelectorAll('.p-tab').forEach((el, i) => el.classList.toggle('active', ['info','address','password'][i] === t));
  const el = document.getElementById('profile-content'), u = S.user;
  if (t === 'info') el.innerHTML = `
    <div class="form-card"><h3>Personal Information</h3>
      <div class="row2">
        <div class="form-group"><label class="form-label">First Name</label><input class="form-input" id="p-first" value="${u.firstName || ''}" /></div>
        <div class="form-group"><label class="form-label">Last Name</label><input class="form-input" id="p-last" value="${u.lastName || ''}" /></div>
      </div>
      <div class="form-group"><label class="form-label">Email</label><input class="form-input" value="${u.email}" disabled style="opacity:.5;cursor:not-allowed" /></div>
      <div class="form-group"><label class="form-label">Phone</label><input class="form-input" id="p-phone" value="${u.phone || ''}" placeholder="+81 90-0000-0000" /></div>
      <button class="save-btn" onclick="saveInfo()">Save Changes</button>
    </div>`;
  if (t === 'address') el.innerHTML = `
    <div class="form-card"><h3>Delivery Address</h3>
      <div class="form-group"><label class="form-label">Street Address</label><input class="form-input" id="p-addr" value="${u.address || ''}" placeholder="1-2-3 Shibuya" /></div>
      <div class="row2">
        <div class="form-group"><label class="form-label">City</label><input class="form-input" id="p-city" value="${u.city || ''}" placeholder="Tokyo" /></div>
        <div class="form-group"><label class="form-label">Postal Code</label><input class="form-input" id="p-zip" value="${u.postalCode || ''}" placeholder="150-0001" /></div>
      </div>
      <button class="save-btn" onclick="saveAddress()">Save Address</button>
    </div>`;
  if (t === 'password') el.innerHTML = `
    <div class="form-card"><h3>Change Password</h3>
      <div class="form-group"><label class="form-label">Current Password</label><input class="form-input" type="password" id="p-old" placeholder="••••••••" /></div>
      <div class="form-group"><label class="form-label">New Password</label><input class="form-input" type="password" id="p-new" placeholder="Min 6 characters" /></div>
      <div class="form-group"><label class="form-label">Confirm New Password</label><input class="form-input" type="password" id="p-conf" placeholder="Same as new password" /></div>
      <button class="save-btn" onclick="savePassword()">Update Password</button>
    </div>`;
}
async function saveInfo() {
  const firstName = document.getElementById('p-first').value.trim(), lastName = document.getElementById('p-last').value.trim(), phone = document.getElementById('p-phone').value.trim();
  if (!firstName || !lastName) return toast('First and last name are required', 'error');
  try { const res = await api('/auth/me', { method: 'PUT', body: JSON.stringify({ firstName, lastName, phone }) }); S.user = { ...S.user, ...res.data }; localStorage.setItem('bs_user', JSON.stringify(S.user)); renderNav(); renderProfile(); toast('Profile updated!', 'success'); }
  catch(e) { toast(e.message, 'error'); }
}
async function saveAddress() {
  const address = document.getElementById('p-addr').value.trim(), city = document.getElementById('p-city').value.trim(), postalCode = document.getElementById('p-zip').value.trim();
  try { const res = await api('/auth/me', { method: 'PUT', body: JSON.stringify({ address, city, postalCode }) }); S.user = { ...S.user, ...res.data }; localStorage.setItem('bs_user', JSON.stringify(S.user)); toast('Address saved!', 'success'); }
  catch(e) { toast(e.message, 'error'); }
}
async function savePassword() {
  const oldPassword = document.getElementById('p-old').value, newPassword = document.getElementById('p-new').value, conf = document.getElementById('p-conf').value;
  if (!oldPassword || !newPassword) return toast('Fill in all fields', 'error');
  if (newPassword !== conf) return toast('New passwords do not match', 'error');
  if (newPassword.length < 6) return toast('Password must be at least 6 characters', 'error');
  try { await api('/auth/change-password', { method: 'POST', body: JSON.stringify({ oldPassword, newPassword }) }); toast('Password updated!', 'success'); ['p-old','p-new','p-conf'].forEach(id => document.getElementById(id).value = ''); }
  catch(e) { toast(e.message, 'error'); }
}

/* ─── ADMIN ─── */
function adminTab(t) {
  document.querySelectorAll('.a-tab').forEach((el, i) => el.classList.toggle('active', (i === 0 && t === 'products') || (i === 1 && t === 'orders')));
  document.getElementById('ap-products').classList.toggle('active', t === 'products');
  document.getElementById('ap-orders').classList.toggle('active', t === 'orders');
  if (t === 'orders') loadAdminOrders();
}
async function loadAdmin() {
  if (!S.user || S.user.role !== 'ADMIN') { go('home'); return; }
  loadAdminProducts();
}
async function loadAdminProducts() {
  const tbody = document.getElementById('admin-prods');
  try {
    const res = await api('/products');
    tbody.innerHTML = (res.data || []).map(p => `
      <tr>
        <td><img src="${p.imageUrl || ''}" onerror="this.style.opacity=0" /></td>
        <td style="font-weight:600;max-width:180px">${p.name}</td>
        <td>${p.category}</td>
        <td style="font-family:'Space Mono'">¥${p.price?.toLocaleString()}</td>
        <td>${p.stock}</td>
        <td>${p.badge || '—'}</td>
        <td><button class="ab ab-edit" onclick="openEditProduct(${p.id})">Edit</button> <button class="ab ab-del" onclick="deleteProduct(${p.id})">Delete</button></td>
      </tr>`).join('');
  } catch(e) { tbody.innerHTML = `<tr><td colspan="7" style="color:var(--danger)">${e.message}</td></tr>`; }
}
async function loadAdminOrders() {
  const tbody = document.getElementById('admin-ords');
  try {
    const res = await api('/orders');
    tbody.innerHTML = (res.data || []).map(o => `
      <tr>
        <td style="font-family:'Space Mono';color:var(--accent)">${o.orderNumber}</td>
        <td>${o.user?.firstName} ${o.user?.lastName}</td>
        <td style="font-family:'Space Mono'">¥${o.totalAmount?.toLocaleString()}</td>
        <td>${new Date(o.createdAt).toLocaleDateString('ja-JP')}</td>
        <td><span class="o-status s-${(o.status || '').toLowerCase()}">${o.status}</span></td>
        <td><select class="status-sel" onchange="updateOrderStatus(${o.id},this.value)">${['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map(s => `<option value="${s}"${s === o.status ? ' selected' : ''}>${s}</option>`).join('')}</select></td>
      </tr>`).join('');
  } catch(e) { tbody.innerHTML = `<tr><td colspan="6" style="color:var(--danger)">${e.message}</td></tr>`; }
}
async function updateOrderStatus(id, status) {
  try { await api(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }); toast(`Status → ${status}`, 'success'); }
  catch(e) { toast(e.message, 'error'); }
}
function openAddProduct() {
  document.getElementById('modal-title').textContent = 'Add Product';
  ['m-name','m-cat','m-badge','m-price','m-oldprice','m-img','m-colors','m-sizes','m-desc','m-id'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('m-stock').value = '100'; document.getElementById('m-rating').value = '0';
  document.getElementById('prod-modal').classList.add('open');
}
async function openEditProduct(id) {
  try {
    const res = await api(`/products/${id}`); const p = res.data;
    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('m-id').value = p.id; document.getElementById('m-name').value = p.name || '';
    document.getElementById('m-cat').value = p.category || ''; document.getElementById('m-badge').value = p.badge || '';
    document.getElementById('m-price').value = p.price || ''; document.getElementById('m-oldprice').value = p.oldPrice || '';
    document.getElementById('m-stock').value = p.stock || 100; document.getElementById('m-rating').value = p.rating || 0;
    document.getElementById('m-img').value = p.imageUrl || ''; document.getElementById('m-colors').value = p.colors || '';
    document.getElementById('m-sizes').value = p.sizes || ''; document.getElementById('m-desc').value = p.description || '';
    document.getElementById('prod-modal').classList.add('open');
  } catch(e) { toast(e.message, 'error'); }
}
function closeModal() { document.getElementById('prod-modal').classList.remove('open'); }
async function saveProduct() {
  const id = document.getElementById('m-id').value;
  const body = {
    name: document.getElementById('m-name').value.trim(), category: document.getElementById('m-cat').value.trim(),
    badge: document.getElementById('m-badge').value.trim() || null, price: parseFloat(document.getElementById('m-price').value),
    oldPrice: parseFloat(document.getElementById('m-oldprice').value) || null, stock: parseInt(document.getElementById('m-stock').value) || 100,
    rating: parseFloat(document.getElementById('m-rating').value) || 0, imageUrl: document.getElementById('m-img').value.trim() || null,
    colors: document.getElementById('m-colors').value.trim() || null, sizes: document.getElementById('m-sizes').value.trim() || null,
    description: document.getElementById('m-desc').value.trim() || null,
  };
  if (!body.name || !body.category || !body.price) return toast('Name, category, and price required', 'error');
  try {
    if (id) await api(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    else await api('/products', { method: 'POST', body: JSON.stringify(body) });
    closeModal(); toast(id ? 'Product updated!' : 'Product created!', 'success');
    S.allProducts = []; // reset cache so next loadShop refetches
    loadAdminProducts();
  } catch(e) { toast(e.message, 'error'); }
}
async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try { await api(`/products/${id}`, { method: 'DELETE' }); toast('Deleted', 'info'); S.allProducts = []; loadAdminProducts(); }
  catch(e) { toast(e.message, 'error'); }
}

/* ─── DEPLOY TRACKER ─── */
const STEPS = [
  { name:'Install Java 17', desc:'Required to run Spring Boot. Download from adoptium.net', cmd:'winget install EclipseAdoptium.Temurin.17.JDK', tip:'Restart VS Code after. Verify: java -version' },
  { name:'Install Maven', desc:'Build tool that compiles and runs the project.', cmd:'winget install Apache.Maven', tip:'Restart terminal. Verify: mvn -v' },
  { name:'Install MySQL 8', desc:'The database for products, users and orders.', cmd:'winget install Oracle.MySQL', tip:'Remember the root password you set!' },
  { name:'Create Database', desc:'Open MySQL and create the buysell_db database.', cmd:'mysql -u root -p\nCREATE DATABASE buysell_db;', tip:'Only needs to be done once. Tables auto-create.' },
  { name:'Set DB Password', desc:'Edit application.properties with your MySQL password.', cmd:'backend/src/main/resources/application.properties', tip:'Line: spring.datasource.password=YOUR_PASSWORD_HERE' },
  { name:'Install Java Extension Pack', desc:'In VS Code Extensions (Ctrl+Shift+X), install "Extension Pack for Java" by Microsoft.', cmd:'ext install vscjava.vscode-java-pack', tip:'Includes Maven, debugger, and Spring Boot tools.' },
  { name:'Maven Build', desc:'In VS Code terminal, inside the backend folder, run Maven.', cmd:'cd backend\nmvn clean install -DskipTests', tip:'First run downloads all dependencies — takes 2-5 min.' },
  { name:'Start the Server', desc:'Run Spring Boot and watch for the startup message.', cmd:'mvn spring-boot:run', tip:'You should see: BuySell API running at :8081' },
  { name:'Open the App', desc:'Open the frontend file in your browser.', cmd:'Open: http://localhost:8081/index.html', tip:'Served directly by Spring Boot now.' },
  { name:'Test Backend', desc:'Check that products are loading from the seeded data.', cmd:'http://localhost:8081/api/products', tip:'Should return JSON with products.' },
  { name:'Login as Admin', desc:'Try the admin account seeded automatically.', cmd:'admin@buysell.com / admin123', tip:'Admin can add/edit products and manage orders.' },
  { name:'All Done! 🎉', desc:'Backend is serving. Frontend is connected.', cmd:'', tip:'For production: use env variables and lock CORS to your domain.' },
];
let trackerOpen = false, trackerStep = parseInt(localStorage.getItem('bt_step') || '0');
function toggleTracker() { trackerOpen = !trackerOpen; document.getElementById('tracker-panel').classList.toggle('open', trackerOpen); }
function renderTracker() {
  const fill  = document.getElementById('t-fill');
  const steps = document.getElementById('t-steps');
  const tip   = document.getElementById('t-tip');
  fill.style.width = Math.round((trackerStep / STEPS.length) * 100) + '%';
  steps.innerHTML = STEPS.map((s, i) => {
    const done = i < trackerStep, active = i === trackerStep, last = i === STEPS.length - 1;
    return `<div class="t-step" onclick="jumpTracker(${i})">
      <div class="t-indicator">
        <div class="t-dot ${done ? 'done' : active ? 'active' : 'pending'}">${done ? '✓' : i + 1}</div>
        ${!last ? `<div class="t-connector ${done ? 'done' : ''}"></div>` : ''}
      </div>
      <div class="t-content">
        <div class="t-name ${done ? 'done' : active ? 'active' : 'pending'}">${s.name}</div>
        ${(done || active) ? `<div class="t-desc">${s.desc}</div>` : ''}
        ${active && s.cmd ? `<div class="t-cmd">${s.cmd.replace(/\n/g, '<br>')}</div>` : ''}
        ${active ? `<div class="t-actions">${i > 0 ? `<button class="t-btn t-btn-back" onclick="event.stopPropagation();moveTracker(-1)">← Back</button>` : ''}<button class="t-btn t-btn-next" onclick="event.stopPropagation();moveTracker(1)">${i === STEPS.length - 1 ? '🎉 Finish' : 'Done →'}</button></div>` : ''}
      </div>
    </div>`;
  }).join('');
  tip.innerHTML = trackerStep < STEPS.length ? `<strong>TIP:</strong> ${STEPS[trackerStep]?.tip}` : `<strong>🎉</strong> All steps complete!`;
}
function moveTracker(d) { trackerStep = Math.max(0, Math.min(STEPS.length, trackerStep + d)); localStorage.setItem('bt_step', trackerStep); renderTracker(); }
function jumpTracker(i) { trackerStep = i; localStorage.setItem('bt_step', i); renderTracker(); }

/* ─── AI CHAT ─── */
function toggleChat() {
  const box = document.getElementById('ai-chat-box');
  const isOpen = box.style.display === 'flex';
  box.style.display = isOpen ? 'none' : 'flex';
  if (!isOpen) {
    const msgs = document.getElementById('ai-messages');
    if (!msgs.children.length) {
      const h = new Date().getHours();
      const g = h < 12 ? "Good morning! What can I help you find today?" : h < 17 ? "Good afternoon! Looking for anything specific?" : "Good evening! Need help finding something?";
      msgs.innerHTML += `<div style="background:#222;padding:8px 12px;border-radius:8px;color:#f5c518;max-width:80%;">${g}</div>`;
    }
  }
}
async function sendAiMessage() {
  const input = document.getElementById('ai-input'), msgs = document.getElementById('ai-messages');
  const text = input.value.trim(); if (!text) return;
  input.value = '';
  msgs.innerHTML += `<div style="background:#333;padding:8px 12px;border-radius:8px;align-self:flex-end;max-width:80%;">${text}</div>`;
  const typing = document.createElement('div');
  typing.style = 'background:#222;padding:8px 12px;border-radius:8px;color:#f5c518;';
  typing.textContent = 'Typing...'; msgs.appendChild(typing); msgs.scrollTop = msgs.scrollHeight;
  try {
    const res = await fetch('http://localhost:8081/api/help/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) });
    const data = await res.json(); typing.remove();
    msgs.innerHTML += `<div style="background:#222;padding:8px 12px;border-radius:8px;align-self:flex-start;max-width:80%;color:#fff;">${data.data}</div>`;
  } catch(e) { typing.textContent = 'Error connecting to AI.'; }
  msgs.scrollTop = msgs.scrollHeight;
}

/* ─── BOOT ─── */
initApp();
renderTracker();