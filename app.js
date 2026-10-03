/* ---------- helpers ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const money = n => '$' + (Number(n) % 1 ? Number(n).toFixed(2) : Number(n).toLocaleString('en-US'));
const findP = id => PRODUCTS.find(p => p.id == id);
const artistOf = p => ARTISTS.find(a => a.id === p.artistId) || { name: 'Unknown', slug: '' };
const catName = slug => (CATEGORIES.find(c => c.slug === slug) || { name: slug }).name;
const initials = n => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

/* ---------- state ---------- */
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const store = {
  cart:     load('arvia_cart', []),
  wishlist: load('arvia_wishlist', []),
  user:     load('arvia_user', null),
  orders:   load('arvia_orders', []),
};
const save = () => {
  localStorage.setItem('arvia_cart', JSON.stringify(store.cart));
  localStorage.setItem('arvia_wishlist', JSON.stringify(store.wishlist));
  localStorage.setItem('arvia_user', JSON.stringify(store.user));
  localStorage.setItem('arvia_orders', JSON.stringify(store.orders));
};
const ui = { q:'', cat:'all', artist:'all', band:'any', sort:'featured' };
let pdpQty = 1;

/* ---------- router ---------- */
function parseHash() {
  const raw = location.hash.slice(1) || '/';
  const [path, qs] = raw.split('?');
  return { path: path || '/', params: new URLSearchParams(qs || '') };
}
window.addEventListener('hashchange', () => render(true));

/* ---------- small UI helpers ---------- */
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
}
function updateBadges() {
  const c = store.cart.reduce((n, i) => n + i.qty, 0);
  const cc = $('#cart-count'), wc = $('#wish-count');
  cc.textContent = c; cc.classList.toggle('hide', c === 0);
  wc.textContent = store.wishlist.length; wc.classList.toggle('hide', store.wishlist.length === 0);
}

/* ---------- MODALS: closed by default, opened only by clicks ---------- */
const modal = $('#modal'), modalCard = $('#modal-card');
function openModal(html) {
  modalCard.innerHTML = html;
  modal.classList.add('open');
  document.body.classList.add('no-scroll');
}
function closeModal() {
  modal.classList.remove('open');
  modalCard.innerHTML = '';
  document.body.classList.remove('no-scroll');
}
const loginModalHtml = () => `
  <button class="icon-btn modal-x" data-action="modal-close" aria-label="Close">✕</button>
  <h3>Welcome back</h3>
  <p class="sub">Sign in to see your orders, wishlist and saved artists.</p>
  <form id="modal-login-form">
    <label class="field"><span>Email</span><input class="input" type="email" name="email" required placeholder="you@example.com"></label>
    <label class="field"><span>Password</span><input class="input" type="password" name="password" required placeholder="••••••••"></label>
    <button class="btn btn-primary btn-block" type="submit">Sign in</button>
  </form>
  <p class="alt-line">New to ARVIA? <a href="#/signup" data-action="modal-close">Create an account</a></p>`;

function openAddProductModal() {
  openModal(`
    <button class="icon-btn modal-x" data-action="modal-close" aria-label="Close">✕</button>
    <h3>Add a listing</h3>
    <p class="sub">It appears in your studio and the shop immediately.</p>
    <form id="add-product-form">
      <label class="field"><span>Title</span><input class="input" name="title" required placeholder="e.g. Coastal Study II"></label>
      <label class="field"><span>Category</span>
        <select class="input" name="category">${CATEGORIES.map(c => `<option value="${c.slug}">${c.name}</option>`).join('')}</select>
      </label>
      <div class="form-row">
        <label class="field"><span>Price (USD)</span><input class="input" name="price" type="number" min="1" required placeholder="450"></label>
        <label class="field"><span>Medium</span><input class="input" name="medium" placeholder="Oil on canvas"></label>
      </div>
      <button class="btn btn-primary btn-block" type="submit">Publish listing</button>
    </form>`);
}

/* ---------- cart / wishlist ---------- */
function addToCart(id, qty = 1) {
  const line = store.cart.find(i => i.id === id);
  if (line) line.qty += qty; else store.cart.push({ id, qty });
  save(); updateBadges(); toast('Added to cart');
}
function setQty(id, delta) {
  const line = store.cart.find(i => i.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) store.cart = store.cart.filter(i => i.id !== id);
  save(); updateBadges(); render(false);
}
function toggleWish(id) {
  const i = store.wishlist.indexOf(id);
  if (i > -1) { store.wishlist.splice(i, 1); toast('Removed from wishlist'); }
  else { store.wishlist.push(id); toast('Saved to wishlist'); }
  save(); updateBadges(); render(false);
}
const cartTotals = () => {
  const subtotal = store.cart.reduce((n, i) => { const p = findP(i.id); return p ? n + p.price * i.qty : n; }, 0);
  const shipping = subtotal === 0 || subtotal >= 500 ? 0 : 12;
  return { subtotal, shipping, total: subtotal + shipping };
};

/* ---------- components ---------- */
function productCard(p) {
  const a = artistOf(p);
  const wished = store.wishlist.includes(p.id);
  return `
  <article class="card">
    <a class="card-media" href="#/product/${p.slug}">
      <img src="${IMG(p.images[0], 600, 750)}" alt="${esc(p.title)}" loading="lazy">
      ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}
    </a>
    <button class="wish ${wished ? 'on' : ''}" data-action="wish" data-id="${p.id}" aria-label="Save to wishlist">♥</button>
    <div class="card-body">
      <a class="card-title" href="#/product/${p.slug}">${esc(p.title)}</a>
      <div class="card-meta">
        <a href="#/shop?artist=${a.slug}">${esc(a.name)}</a>
        <span class="price">${money(p.price)}</span>
      </div>
    </div>
    <button class="card-add" data-action="add" data-id="${p.id}">Add to cart</button>
  </article>`;
}

function artistCard(a) {
  return `<a class="artist-card" href="#/shop?artist=${a.slug}">
    <div class="avatar">${initials(a.name)}</div>
    <h4>${esc(a.name)}</h4><p>${esc(a.location)}</p></a>`;
}

/* ---------- pages ---------- */
function pageHome() {
  const featured = PRODUCTS.filter(p => p.featured).slice(0, 4);
  const fresh = [...PRODUCTS].sort((x, y) => y.seq - x.seq).slice(0, 4);
  return `
  <section class="container hero">
    <div>
      <div class="eyebrow">Curated marketplace · Est. 2025</div>
      <h1 class="h1">Original works, from the hands that made them.</h1>
      <p class="lead">Paintings, photography, ceramics and craft from independent artists — bought directly from their studio, never through a middleman.</p>
      <div class="hero-cta">
        <a class="btn btn-primary" href="#/shop">Explore the collection</a>
        <a class="btn btn-ghost" href="#/seller">Sell your work</a>
      </div>
      <div class="hero-stats">
        <div><b>240+</b><span class="muted">independent artists</span></div>
        <div><b>100%</b><span class="muted">original works</span></div>
        <div><b>48h</b><span class="muted">dispatch on in-stock</span></div>
      </div>
    </div>
    <div class="hero-media">
      <img src="${IMG('arvia-hero-1', 900, 1125)}" alt="Featured artwork">
      <div class="tag"><b>Ochre Horizon I</b><br><span class="muted">Mara Ellison · Oil on linen · ${money(1850)}</span></div>
    </div>
  </section>

  <section class="container section">
    <div class="section-head"><h2 class="h2">Browse by category</h2><a class="link-more" href="#/categories">All categories</a></div>
    <div class="cat-grid">
      ${CATEGORIES.slice(0, 8).map(c => `
        <a class="cat-tile" href="#/shop?cat=${c.slug}">
          <img src="${IMG('arvia-cat-' + c.slug, 500, 500)}" alt="${c.name}" loading="lazy">
          <span>${c.name}</span></a>`).join('')}
    </div>
  </section>

  <section class="container section">
    <div class="section-head"><div><div class="eyebrow">Editor's selection</div><h2 class="h2">Featured works</h2></div><a class="link-more" href="#/shop">Shop all</a></div>
    <div class="grid grid-4">${featured.map(productCard).join('')}</div>
  </section>

  <section class="container section">
    <div class="section-head"><div><div class="eyebrow">Just listed</div><h2 class="h2">New arrivals</h2></div><a class="link-more" href="#/shop?sort=new">View all</a></div>
    <div class="grid grid-4">${fresh.map(productCard).join('')}</div>
  </section>

  <section class="container section">
    <div class="section-head"><div><div class="eyebrow">The people behind the work</div><h2 class="h2">Meet the makers</h2></div></div>
    <div class="artist-grid">${ARTISTS.slice(0, 4).map(artistCard).join('')}</div>
  </section>`;
}

function pageCategories() {
  return `
  <div class="container">
    <div class="crumbs"><a href="#/">Home</a> / Categories</div>
    <h1 class="h2" style="margin-bottom:26px">Categories</h1>
    <div class="cat-grid" style="padding-bottom:70px">
      ${CATEGORIES.map(c => `
        <a class="cat-tile" href="#/shop?cat=${c.slug}">
          <img src="${IMG('arvia-cat-' + c.slug, 500, 500)}" alt="${c.name}" loading="lazy">
          <span>${c.name}</span></a>`).join('')}
    </div>
  </div>`;
}

function filteredProducts() {
  let list = [...PRODUCTS];
  const q = ui.q.trim().toLowerCase();
  if (q) list = list.filter(p =>
    p.title.toLowerCase().includes(q) ||
    artistOf(p).name.toLowerCase().includes(q) ||
    catName(p.category).toLowerCase().includes(q));
  if (ui.cat !== 'all') list = list.filter(p => p.category === ui.cat);
  if (ui.artist !== 'all') { const a = ARTISTS.find(x => x.slug === ui.artist); if (a) list = list.filter(p => p.artistId === a.id); }
  if (ui.band === 'u250')  list = list.filter(p => p.price < 250);
  if (ui.band === '250_750') list = list.filter(p => p.price >= 250 && p.price <= 750);
  if (ui.band === 'o750')  list = list.filter(p => p.price > 750);
  const sorters = {
    featured: (a, b) => (b.featured - a.featured) || (a.seq - b.seq),
    new:      (a, b) => b.seq - a.seq,
    'price-asc':  (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    title:    (a, b) => a.title.localeCompare(b.title),
  };
  return list.sort(sorters[ui.sort] || sorters.featured);
}
function shopResultsHtml() {
  const list = filteredProducts();
  if (!list.length) return `
    <div class="empty" style="grid-column:1/-1">
      <h2 class="h2">Nothing matches those filters</h2>
      <p>Try a different search term or clear the filters.</p>
      <button class="btn btn-ghost" data-action="clear-filters">Clear filters</button>
    </div>`;
  return list.map(productCard).join('');
}
function pageShop() {
  const title = ui.artist !== 'all'
    ? (ARTISTS.find(a => a.slug === ui.artist) || {}).name || 'Shop'
    : ui.cat !== 'all' ? catName(ui.cat) : 'The collection';
  return `
  <div class="container" style="padding-bottom:70px">
    <div class="crumbs"><a href="#/">Home</a> / Shop</div>
    <div class="section-head" style="margin-bottom:20px">
      <div><div class="eyebrow">Shop</div><h1 class="h2">${esc(title)}</h1></div>
      <select class="input" id="sort" style="width:auto">
        <option value="featured" ${ui.sort === 'featured' ? 'selected' : ''}>Featured</option>
        <option value="new" ${ui.sort === 'new' ? 'selected' : ''}>Newest</option>
        <option value="price-asc" ${ui.sort === 'price-asc' ? 'selected' : ''}>Price: low to high</option>
        <option value="price-desc" ${ui.sort === 'price-desc' ? 'selected' : ''}>Price: high to low</option>
        <option value="title" ${ui.sort === 'title' ? 'selected' : ''}>Title A–Z</option>
      </select>
    </div>
    <div class="toolbar">
      <input class="input" id="shop-search" type="search" placeholder="Search works, artists…" value="${esc(ui.q)}" autocomplete="off">
      <select class="input" id="band" style="flex:0 0 auto">
        <option value="any" ${ui.band === 'any' ? 'selected' : ''}>Any price</option>
        <option value="u250" ${ui.band === 'u250' ? 'selected' : ''}>Under $250</option>
        <option value="250_750" ${ui.band === '250_750' ? 'selected' : ''}>$250 – $750</option>
        <option value="o750" ${ui.band === 'o750' ? 'selected' : ''}>Over $750</option>
      </select>
    </div>
    <div class="chips">
      <button class="chip ${ui.cat === 'all' ? 'on' : ''}" data-action="cat" data-cat="all">All</button>
      ${CATEGORIES.map(c => `<button class="chip ${ui.cat === c.slug ? 'on' : ''}" data-action="cat" data-cat="${c.slug}">${c.name}</button>`).join('')}
    </div>
    <div class="result-line" id="shop-count">${filteredProducts().length} works</div>
    <div class="grid grid-4" id="shop-grid">${shopResultsHtml()}</div>
  </div>`;
}

function pageProduct(slug) {
  const p = PRODUCTS.find(x => x.slug === slug);
  if (!p) return `<div class="container"><div class="empty"><h2 class="h2">Work not found</h2><a class="btn btn-ghost" href="#/shop">Back to shop</a></div></div>`;
  const a = artistOf(p);
  pdpQty = 1;
  const related = PRODUCTS.filter(x => x.category === p.category && x.id !== p.id).slice(0, 4);
  const wished = store.wishlist.includes(p.id);
  return `
  <div class="container">
    <div class="crumbs"><a href="#/">Home</a> / <a href="#/shop?cat=${p.category}">${catName(p.category)}</a> / ${esc(p.title)}</div>
    <div class="pdp">
      <div>
        <img class="pdp-main" id="pdp-main" src="${IMG(p.images[0], 900, 1125)}" alt="${esc(p.title)}">
        <div class="thumbs">
          ${p.images.map((s, i) => `<img class="${i === 0 ? 'on' : ''}" data-action="thumb" data-i="${i}" src="${IMG(s, 200, 240)}" alt="View ${i + 1}">`).join('')}
        </div>
      </div>
      <div class="pdp-info">
        <div class="eyebrow">${catName(p.category)} · ${p.badge || 'Original'}</div>
        <h1 class="h1" style="font-size:clamp(30px,4vw,46px)">${esc(p.title)}</h1>
        <a class="muted" href="#/shop?artist=${a.slug}" style="font-size:15px">by ${esc(a.name)} · ${esc(a.location)}</a>
        <div class="price">${money(p.price)}</div>
        <div class="pdp-meta">
          <div><span>Medium</span><span>${esc(p.medium)}</span></div>
          <div><span>Dimensions</span><span>${esc(p.dimensions)}</span></div>
          <div><span>Year</span><span>${p.year}</span></div>
          <div><span>Shipping</span><span>${p.price >= 500 ? 'Complimentary' : '$12 flat'}</span></div>
        </div>
        <div class="pdp-actions">
          <div class="qty">
            <button data-action="pdp-qty" data-d="-1" aria-label="Decrease">−</button>
            <span id="pdp-qty">1</span>
            <button data-action="pdp-qty" data-d="1" aria-label="Increase">+</button>
          </div>
          <button class="btn btn-primary" data-action="add-pdp" data-id="${p.id}">Add to cart</button>
          <button class="icon-btn wish ${wished ? 'on' : ''}" style="position:static;background:var(--surface);border:1px solid var(--border)" data-action="wish" data-id="${p.id}" aria-label="Save">♥</button>
        </div>
        <p class="pdp-desc">${esc(p.description)}</p>
        <p class="pdp-desc muted" style="font-size:14px">Ships in 2–3 business days · Certificate of authenticity included · 14-day returns on undamaged works.</p>
      </div>
    </div>
    ${related.length ? `
    <section class="section" style="border-top:1px solid var(--border)">
      <div class="section-head"><h2 class="h2">More in ${catName(p.category)}</h2></div>
      <div class="grid grid-4">${related.map(productCard).join('')}</div>
    </section>` : ''}
  </div>`;
}

function pageCart() {
  const { subtotal, shipping, total } = cartTotals();
  if (!store.cart.length) return `
    <div class="container"><div class="empty">
      <h2 class="h2">Your cart is empty</h2><p>Find something made by hand.</p>
      <a class="btn btn-primary" href="#/shop">Browse the collection</a>
    </div></div>`;
  return `
  <div class="container">
    <div class="crumbs"><a href="#/">Home</a> / Cart</div>
    <h1 class="h2">Shopping cart</h1>
    <div class="two-col">
      <div class="list">
        ${store.cart.map(i => {
          const p = findP(i.id); if (!p) return '';
          const a = artistOf(p);
          return `<div class="row">
            <a href="#/product/${p.slug}"><img src="${IMG(p.images[0], 200, 240)}" alt="${esc(p.title)}"></a>
            <div><h4><a href="#/product/${p.slug}">${esc(p.title)}</a></h4>
              <div class="sub">${esc(a.name)} · ${catName(p.category)}</div></div>
            <div class="row-right">
              <div class="qty">
                <button data-action="qty" data-id="${p.id}" data-d="-1">−</button>
                <span>${i.qty}</span>
                <button data-action="qty" data-id="${p.id}" data-d="1">+</button>
              </div>
              <strong>${money(p.price * i.qty)}</strong>
              <button class="remove" data-action="remove" data-id="${p.id}">Remove</button>
            </div>
          </div>`; }).join('')}
      </div>
      <aside class="summary">
        <h3>Order summary</h3>
        <div class="sum-row"><span>Subtotal</span><span>${money(subtotal)}</span></div>
        <div class="sum-row"><span>Shipping</span><span>${shipping ? money(shipping) : 'Complimentary'}</span></div>
        <div class="sum-row total"><span>Total</span><span>${money(total)}</span></div>
        <a class="btn btn-primary btn-block" href="#/checkout" style="margin-top:16px">Proceed to checkout</a>
        <a class="btn btn-ghost btn-block" href="#/shop" style="margin-top:10px">Continue shopping</a>
      </aside>
    </div>
  </div>`;
}

function pageWishlist() {
  const items = store.wishlist.map(findP).filter(Boolean);
  if (!items.length) return `
    <div class="container"><div class="empty">
      <h2 class="h2">No saved works yet</h2><p>Tap the ♥ on any artwork to keep it here.</p>
      <a class="btn btn-primary" href="#/shop">Find something you love</a>
    </div></div>`;
  return `
  <div class="container" style="padding-bottom:70px">
    <div class="crumbs"><a href="#/">Home</a> / Wishlist</div>
    <div class="section-head"><h1 class="h2">Wishlist</h1><span class="muted">${items.length} saved</span></div>
    <div class="grid grid-4">${items.map(productCard).join('')}</div>
  </div>`;
}

function pageLogin(mode) {
  const signup = mode === 'signup';
  return `
  <div class="container">
    <div class="form-card">
      <div class="eyebrow">${signup ? 'Join ARVIA' : 'Welcome back'}</div>
      <h1 class="h2" style="margin-top:6px">${signup ? 'Create your account' : 'Sign in'}</h1>
      <form id="${signup ? 'signup-form' : 'login-form'}">
        ${signup ? `<label class="field"><span>Full name</span><input class="input" name="name" required placeholder="Your name"></label>` : ''}
        <label class="field"><span>Email</span><input class="input" type="email" name="email" required placeholder="you@example.com"></label>
        <label class="field"><span>Password</span><input class="input" type="password" name="password" required minlength="6" placeholder="At least 6 characters"></label>
        <button class="btn btn-primary btn-block" type="submit">${signup ? 'Create account' : 'Sign in'}</button>
      </form>
      <p class="alt-line">${signup ? 'Already have an account? <a href="#/login">Sign in</a>' : 'New here? <a href="#/signup">Create an account</a>'}</p>
    </div>
  </div>`;
}

function pageCheckout() {
  if (!store.cart.length) return `
    <div class="container"><div class="empty">
      <h2 class="h2">Your cart is empty</h2><p>Add a work before checking out.</p>
      <a class="btn btn-primary" href="#/shop">Browse the collection</a>
    </div></div>`;
  const { subtotal, shipping, total } = cartTotals();
  return `
  <div class="container">
    <div class="crumbs"><a href="#/">Home</a> / <a href="#/cart">Cart</a> / Checkout</div>
    <h1 class="h2">Checkout</h1>
    <div class="two-col">
      <form id="checkout-form">
        <div class="panel">
          <h3>Shipping</h3>
          <div class="form-row">
            <label class="field"><span>Full name</span><input class="input" name="name" required value="${store.user ? esc(store.user.name) : ''}"></label>
            <label class="field"><span>Email</span><input class="input" type="email" name="email" required value="${store.user ? esc(store.user.email) : ''}"></label>
          </div>
          <label class="field"><span>Address</span><input class="input" name="address" required placeholder="Street and number"></label>
          <div class="form-row">
            <label class="field"><span>City</span><input class="input" name="city" required></label>
            <label class="field"><span>Postal code</span><input class="input" name="postal" required></label>
          </div>
          <label class="field"><span>Country</span><input class="input" name="country" required placeholder="Portugal"></label>
        </div>
        <div class="panel">
          <h3>Payment</h3>
          <p class="muted" style="font-size:13.5px;margin-top:-8px">Demo checkout — no real charge is made.</p>
          <label class="field"><span>Card number</span><input class="input" name="card" required inputmode="numeric" placeholder="4242 4242 4242 4242"></label>
          <div class="form-row">
            <label class="field"><span>Expiry</span><input class="input" name="exp" required placeholder="MM/YY"></label>
            <label class="field"><span>CVC</span><input class="input" name="cvc" required placeholder="123"></label>
          </div>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Pay ${money(total)}</button>
      </form>
      <aside class="summary">
        <h3>Order summary</h3>
        ${store.cart.map(i => {
          const p = findP(i.id); if (!p) return '';
          return `<div class="sum-row"><span>${esc(p.title)} × ${i.qty}</span><span>${money(p.price * i.qty)}</span></div>`;
        }).join('')}
        <div class="sum-row"><span>Shipping</span><span>${shipping ? money(shipping) : 'Complimentary'}</span></div>
        <div class="sum-row total"><span>Total</span><span>${money(total)}</span></div>
      </aside>
    </div>
  </div>`;
}

function pageOrder(id) {
  const o = store.orders.find(x => x.id === id);
  if (!o) return `<div class="container"><div class="empty"><h2 class="h2">Order not found</h2><a class="btn btn-ghost" href="#/shop">Back to shop</a></div></div>`;
  return `
  <div class="container">
    <div class="form-card wide">
      <div class="eyebrow">Order confirmed</div>
      <h1 class="h2" style="margin-top:6px">Thank you, ${esc(o.shipTo.name.split(' ')[0])}</h1>
      <p class="muted">Order <b>${o.id}</b> · ${new Date(o.date).toLocaleDateString()}<br>A confirmation email is on its way to ${esc(o.shipTo.email)}.</p>
      <div style="margin:20px 0">
        ${o.items.map(i => `<div class="order-item">
          <img src="${IMG(i.img, 160, 200)}" alt="">
          <div><b>${esc(i.title)}</b><br><span class="muted">${esc(i.artist)} · qty ${i.qty}</span></div>
          <span class="oi-price">${money(i.price * i.qty)}</span></div>`).join('')}
      </div>
      <div class="sum-row"><span>Shipping to</span><span>${esc(o.shipTo.city)}, ${esc(o.shipTo.country)}</span></div>
      <div class="sum-row"><span>Shipping</span><span>${o.shipping ? money(o.shipping) : 'Complimentary'}</span></div>
      <div class="sum-row total"><span>Total paid</span><span>${money(o.total)}</span></div>
      <div style="display:flex;gap:12px;margin-top:22px;flex-wrap:wrap">
        <a class="btn btn-primary" href="#/profile">View orders</a>
        <a class="btn btn-ghost" href="#/shop">Continue shopping</a>
      </div>
    </div>
  </div>`;
}

function pageProfile() {
  if (!store.user) return `
    <div class="container"><div class="empty">
      <h2 class="h2">You're not signed in</h2><p>Sign in to see your orders, wishlist and details.</p>
      <button class="btn btn-primary" data-action="open-login">Sign in</button>
      <a class="btn btn-ghost" href="#/signup" style="margin-left:10px">Create account</a>
    </div></div>`;
  const orders = [...store.orders, ...SAMPLE_ORDERS];
  return `
  <div class="container" style="padding-bottom:70px">
    <div class="dash-head">
      <div><div class="eyebrow">Account</div><h1 class="h2">${esc(store.user.name)}</h1>
        <span class="muted">${esc(store.user.email)}</span></div>
      <button class="btn btn-ghost btn-sm" data-action="logout">Sign out</button>
    </div>
    <div class="metrics">
      <div class="metric"><span>Orders</span><b>${orders.length}</b></div>
      <div class="metric"><span>Saved works</span><b>${store.wishlist.length}</b></div>
      <div class="metric"><span>Cart items</span><b>${store.cart.reduce((n, i) => n + i.qty, 0)}</b></div>
      <div class="metric"><span>Member since</span><b>2025</b></div>
    </div>
    <div class="section-head" style="margin:34px 0 16px"><h2 class="h3">Order history</h2></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>${orders.map(o => `<tr>
          <td><b>${o.id}</b></td>
          <td>${new Date(o.date).toLocaleDateString()}</td>
          <td>${o.items.reduce((n, i) => n + i.qty, 0)}</td>
          <td>${money(o.total)}</td>
          <td><span class="status ok">${esc(o.status)}</span></td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

function pageSeller() {
  const mine = PRODUCTS.filter(p => p.mine);
  const max = Math.max(...SAMPLE_REVENUE);
  return `
  <div class="container" style="padding-bottom:70px">
    <div class="dash-head">
      <div><div class="eyebrow">Seller studio</div><h1 class="h2">Mara Ellison Studio</h1>
        <span class="muted">Lisbon, Portugal · Stripe Connect connected</span></div>
      <button class="btn btn-primary" data-action="open-add-product">+ Add listing</button>
    </div>
    <div class="metrics">
      <div class="metric"><span>Revenue (12 mo)</span><b>${money(SAMPLE_REVENUE.reduce((a, b) => a + b, 0))}</b></div>
      <div class="metric"><span>Orders</span><b>34</b></div>
      <div class="metric"><span>Listings</span><b>${mine.length}</b></div>
      <div class="metric"><span>Store views</span><b>8.2k</b></div>
    </div>
    <div class="dash-cols">
      <div class="panel">
        <h3>Revenue</h3>
        <div class="chart">${SAMPLE_REVENUE.map(v => `<div class="bar" style="height:${Math.round(v / max * 100)}%" title="${money(v)}"></div>`).join('')}</div>
        <div class="chart-x">${CHART_MONTHS.map(m => `<span>${m}</span>`).join('')}</div>
      </div>
      <div class="panel">
        <h3>Recent orders</h3>
        <div class="table-wrap" style="border:0">
          <table style="min-width:0">
            <thead><tr><th>Order</th><th>Item</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>${SAMPLE_SELLER_ORDERS.map(o => `<tr>
              <td>${o.id}</td><td>${esc(o.item)}</td><td>${money(o.total)}</td>
              <td><span class="status ${o.status === 'To ship' ? 'warn' : 'ok'}">${o.status}</span></td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="section-head" style="margin:10px 0 16px"><h2 class="h3">Your listings</h2><span class="muted">${mine.length} active</span></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Work</th><th>Category</th><th>Price</th><th>Year</th><th>Status</th></tr></thead>
        <tbody>${mine.map(p => `<tr>
          <td><div style="display:flex;gap:12px;align-items:center">
            <img src="${IMG(p.images[0], 90, 110)}" alt="" style="width:44px;height:54px;object-fit:cover">
            <a href="#/product/${p.slug}">${esc(p.title)}</a></div></td>
          <td>${catName(p.category)}</td><td>${money(p.price)}</td><td>${p.year}</td>
          <td><span class="status ok">Live</span></td></tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="section-head" style="margin:34px 0 16px"><h2 class="h3">Payouts</h2></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Reference</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Jun 1, 2025</td><td>Weekly payout</td><td>${money(1840)}</td><td><span class="status ok">Paid</span></td></tr>
          <tr><td>May 25, 2025</td><td>Weekly payout</td><td>${money(2120)}</td><td><span class="status ok">Paid</span></td></tr>
          <tr><td>Jun 8, 2025</td><td>Pending clearance</td><td>${money(640)}</td><td><span class="status warn">Pending</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

function page404() {
  return `<div class="container"><div class="empty">
    <h2 class="h2">Page not found</h2><p>That route doesn't exist.</p>
    <a class="btn btn-primary" href="#/">Back home</a></div></div>`;
}

/* ---------- render ---------- */
function syncShopUi(params) {
  ui.q      = params.get('q') || '';
  ui.cat    = params.get('cat') || 'all';
  ui.artist = params.get('artist') || 'all';
  ui.sort   = params.get('sort') || 'featured';
  ui.band   = params.get('band') || 'any';
}
function shopQueryString() {
  const q = new URLSearchParams();
  if (ui.q) q.set('q', ui.q);
  if (ui.cat !== 'all') q.set('cat', ui.cat);
  if (ui.artist !== 'all') q.set('artist', ui.artist);
  if (ui.sort !== 'featured') q.set('sort', ui.sort);
  if (ui.band !== 'any') q.set('band', ui.band);
  const s = q.toString();
  return '#/shop' + (s ? '?' + s : '');
}
function applyShop(pushHash = true) {
  if (pushHash) history.replaceState(null, '', shopQueryString());
  const grid = $('#shop-grid'), count = $('#shop-count');
  if (grid) { grid.innerHTML = shopResultsHtml(); count.textContent = filteredProducts().length + ' works'; }
}
function render(scroll = true) {
  const { path, params } = parseHash();
  const app = $('#app');
  let html;
  if (path === '/') html = pageHome();
  else if (path === '/categories') html = pageCategories();
  else if (path === '/shop') { syncShopUi(params); html = pageShop(); }
  else if (path.startsWith('/product/')) html = pageProduct(decodeURIComponent(path.slice(9)));
  else if (path === '/cart') html = pageCart();
  else if (path === '/wishlist') html = pageWishlist();
  else if (path === '/login') html = pageLogin('login');
  else if (path === '/signup') html = pageLogin('signup');
  else if (path === '/checkout') html = pageCheckout();
  else if (path.startsWith('/order/')) html = pageOrder(decodeURIComponent(path.slice(7)));
  else if (path === '/profile') html = pageProfile();
  else if (path === '/seller') html = pageSeller();
  else html = page404();
  app.innerHTML = html;
  updateBadges();
  $$('.main-nav a').forEach(a => a.classList.toggle('active', a.dataset.nav === (path.startsWith('/shop') ? '/shop' : path)));
  if (scroll) window.scrollTo(0, 0);
}

/* ---------- overlays ---------- */
const openDrawer  = () => { $('#drawer').classList.add('open'); $('#scrim').classList.add('open'); document.body.classList.add('no-scroll'); };
const closeDrawer = () => { $('#drawer').classList.remove('open'); $('#scrim').classList.remove('open'); document.body.classList.remove('no-scroll'); };
const openSearch  = () => { $('#search-ov').classList.add('open'); document.body.classList.add('no-scroll'); setTimeout(() => $('#global-search').focus(), 50); };
const closeSearch = () => { $('#search-ov').classList.remove('open'); document.body.classList.remove('no-scroll'); $('#search-results').innerHTML = ''; $('#global-search').value = ''; };

function searchResults(q) {
  q = q.trim().toLowerCase();
  if (!q) return '';
  const hits = PRODUCTS.filter(p =>
    p.title.toLowerCase().includes(q) ||
    artistOf(p).name.toLowerCase().includes(q) ||
    catName(p.category).toLowerCase().includes(q)).slice(0, 6);
  if (!hits.length) return `<p class="muted">No matches for “${esc(q)}”.</p>`;
  return hits.map(p => `<a href="#/product/${p.slug}" data-action="search-go">
    <img src="${IMG(p.images[0], 120, 150)}" alt="">
    <div><b>${esc(p.title)}</b><br><span class="muted">${esc(artistOf(p).name)} · ${catName(p.category)}</span></div>
    <span class="sr-price">${money(p.price)}</span></a>`).join('');
}

/* ---------- actions ---------- */
function doLogin(form) {
  const email = form.email.value.trim();
  const name = form.name ? form.name.value.trim() : email.split('@')[0].replace(/[._-]/g, ' ');
  store.user = { name: name.charAt(0).toUpperCase() + name.slice(1), email };
  save(); closeModal();
  toast('Signed in');
  if (['#/login', '#/signup'].includes(location.hash)) location.hash = '#/profile'; else render(false);
}
function doCheckout(form) {
  const { subtotal, shipping, total } = cartTotals();
  const items = store.cart.map(i => {
    const p = findP(i.id);
    return p ? { title: p.title, artist: artistOf(p).name, price: p.price, qty: i.qty, img: p.images[0] } : null;
  }).filter(Boolean);
  const order = {
    id: 'ARV-' + Date.now().toString().slice(-6),
    date: new Date().toISOString(),
    status: 'Confirmed',
    subtotal, shipping, total, items,
    shipTo: {
      name: form.name.value.trim(), email: form.email.value.trim(),
      city: form.city.value.trim(), country: form.country.value.trim(),
    },
  };
  store.orders.unshift(order);
  store.cart = [];
  if (!store.user) store.user = { name: order.shipTo.name, email: order.shipTo.email };
  save(); updateBadges();
  toast('Payment successful');
  location.hash = '#/order/' + order.id;
}
function doAddProduct(form) {
  const title = form.title.value.trim();
  const n = PRODUCTS.length + 1;
  PRODUCTS.push({
    id: 'p' + Date.now(), seq: n,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'listing-' + n,
    title, artistId: 'a1', mine: true, featured: false,
    category: form.category.value,
    price: Number(form.price.value),
    badge: 'Original', medium: form.medium.value.trim() || 'Mixed media',
    dimensions: '—', year: 2025,
    images: ['arvia-custom-' + Date.now(), 'arvia-custom-b-' + Date.now(), 'arvia-custom-c-' + Date.now()],
    description: 'Newly listed by your studio.',
  });
  closeModal();
  toast('Listing published');
  render(false);
}

/* ---------- delegated events ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');

  if (e.target === modal) { closeModal(); return; }          // click backdrop closes
  if (!el) return;
  const a = el.dataset.action;
  const id = el.dataset.id;

  switch (a) {
    case 'menu-open': openDrawer(); break;
    case 'menu-close': closeDrawer(); break;
    case 'search-open': openSearch(); break;
    case 'search-close': closeSearch(); break;
    case 'search-go': closeSearch(); break;
    case 'modal-close': closeModal(); break;
    case 'open-login': openModal(loginModalHtml()); break;
    case 'open-add-product': openAddProductModal(); break;
    case 'account':
      if (store.user) location.hash = '#/profile';
      else openModal(loginModalHtml());
      break;
    case 'add': addToCart(id, 1); break;
    case 'add-pdp': addToCart(id, pdpQty); break;
    case 'pdp-qty': {
      pdpQty = Math.max(1, pdpQty + Number(el.dataset.d));
      $('#pdp-qty').textContent = pdpQty;
      break;
    }
    case 'wish': toggleWish(id); break;
    case 'qty': setQty(id, Number(el.dataset.d)); break;
    case 'remove':
      store.cart = store.cart.filter(i => i.id !== id);
      save(); updateBadges(); render(false); toast('Removed');
      break;
    case 'move': addToCart(id, 1); store.wishlist = store.wishlist.filter(x => x !== id); save(); updateBadges(); render(false); break;
    case 'cat':
      ui.cat = el.dataset.cat; ui.artist = 'all';
      applyShop(true); render(false);
      break;
    case 'clear-filters':
      ui.q = ''; ui.cat = 'all'; ui.artist = 'all'; ui.band = 'any'; ui.sort = 'featured';
      history.replaceState(null, '', '#/shop'); render(false);
      break;
    case 'thumb': {
      const p = PRODUCTS.find(x => x.slug === (parseHash().path.slice(9)));
      if (!p) break;
      const i = Number(el.dataset.i);
      $('#pdp-main').src = IMG(p.images[i], 900, 1125);
      $$('.thumbs img').forEach(t => t.classList.toggle('on', t === el));
      break;
    }
    case 'logout':
      store.user = null; save(); toast('Signed out'); render(false);
      break;
  }
  if (e.target.closest('.drawer a')) closeDrawer();
});

document.addEventListener('input', e => {
  if (e.target.id === 'shop-search') { ui.q = e.target.value; applyShop(true); }
  if (e.target.id === 'global-search') $('#search-results').innerHTML = searchResults(e.target.value);
});

document.addEventListener('change', e => {
  if (e.target.id === 'sort') { ui.sort = e.target.value; applyShop(true); render(false); }
  if (e.target.id === 'band') { ui.band = e.target.value; applyShop(true); render(false); }
});

document.addEventListener('submit', e => {
  const form = e.target;
  e.preventDefault();
  switch (form.id) {
    case 'login-form':
    case 'modal-login-form':
    case 'signup-form': doLogin(form); break;
    case 'checkout-form': doCheckout(form); break;
    case 'add-product-form': doAddProduct(form); break;
    case 'newsletter': form.reset(); toast('Subscribed — thank you'); break;
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeDrawer(); closeSearch(); }
  if (e.key === 'Enter' && e.target.id === 'global-search') {
    const q = e.target.value.trim();
    closeSearch();
    location.hash = '#/shop' + (q ? '?q=' + encodeURIComponent(q) : '');
  }
});

/* ---------- init ---------- */
render(true);
