/**
 * Shyam Art World - Clean & Sober Interactive Application
 * Brand: Shyam Art World | "Handcrafted Art. Timeless Stories."
 * Instagram: @shyam_artworld_
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Global Constants ---
  const WHATSAPP_NUMBER = "919876543210"; // Official Brand WhatsApp Format
  
  // State
  let activeFilter = "all";
  let activeSort = "featured";
  let searchQuery = "";
  let currentProduct = null;
  let selectedSize = null;
  let selectedFinish = null;

  // DOM Elements
  const header = document.querySelector('.site-header');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const productsGrid = document.getElementById('productsGrid');
  const filterBtnsContainer = document.getElementById('filterBtnsContainer');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const galleryGrid = document.getElementById('galleryGrid');
  
  // Modals
  const productModal = document.getElementById('productModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');

  // --- 1. Sticky Header Scroll Effect & Scrollspy ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY || window.pageYOffset;
    
    if (scrollPos > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Accurate Scrollspy for nav links
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }, { passive: true });

  // --- 2. Mobile Menu Toggle ---
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });

    // Close menu when clicking nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // --- 3. Render Product Filter Buttons ---
  function renderFilterButtons() {
    if (!filterBtnsContainer) return;

    const uniqueCategories = [
      { id: 'all', name: 'All Creations' },
      { id: 'mdf-wall-art', name: 'MDF & Wall Art' },
      { id: 'led-lamps', name: 'LED Lamps' },
      { id: '3d-frames', name: '3D Frames' },
      { id: 'mirrors', name: 'Mirrors' },
      { id: 'swings-jhula', name: 'Swings / Jhula' },
      { id: 'clocks', name: 'Clocks' },
      { id: 'personalized-gifts', name: 'Personalized Gifts' },
      { id: 'spiritual-art', name: 'Spiritual Art' },
      { id: 'metal-art', name: 'Metal Art' }
    ];

    filterBtnsContainer.innerHTML = uniqueCategories.map(cat => `
      <button class="filter-btn ${cat.id === activeFilter ? 'active' : ''}" data-filter="${cat.id}">
        ${cat.name}
      </button>
    `).join('');

    // Attach click events
    filterBtnsContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtnsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        renderProducts();
      });
    });
  }

  // Helper for direct category filter selection
  window.filterByCategoryId = function(catId) {
    activeFilter = catId;
    if (filterBtnsContainer) {
      filterBtnsContainer.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === catId);
      });
    }
    renderProducts();
    const shopSection = document.getElementById('shop');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- 4. Render Products Grid ---
  function renderProducts() {
    if (!productsGrid || typeof PRODUCTS_DATA === 'undefined') return;

    let filtered = [...PRODUCTS_DATA];

    // Category filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(p => p.category === activeFilter);
    }

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.shortDesc.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (activeSort === 'price-low') {
      filtered.sort((a, b) => a.basePrice - b.basePrice);
    } else if (activeSort === 'price-high') {
      filtered.sort((a, b) => b.basePrice - a.basePrice);
    } else if (activeSort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px dashed var(--border-gold);">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" stroke-width="1.5" style="margin: 0 auto 14px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 6px;">No creations found</h3>
          <p style="color: var(--text-secondary); max-width: 420px; margin: 0 auto 18px; font-size: 0.9rem;">We couldn't find matches for "${searchQuery}". Looking for a custom bespoke piece?</p>
          <a href="#contact" class="btn btn-primary btn-sm">Contact Studio</a>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = filtered.map(prod => `
      <div class="product-card" data-product-id="${prod.id}">
        <div class="product-card-media">
          <img src="${prod.image}" alt="${prod.name} - Shyam Art World" class="product-card-img" loading="lazy">
          ${prod.badge ? `<span class="product-card-badge">${prod.badge}</span>` : ''}
          ${prod.isBacklit ? `
            <span class="product-backlit-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
              Warm LED Glow
            </span>
          ` : ''}
        </div>
        <div class="product-card-body">
          <span class="product-card-category">${prod.categoryName}</span>
          <h3 class="product-card-title">${prod.name}</h3>
          <p class="product-card-desc">${prod.shortDesc}</p>
          <div class="product-card-meta">
            <span class="product-price-est">${prod.priceEstimate}</span>
            <span class="product-rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#E2A03F" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              ${prod.rating} (${prod.reviewsCount})
            </span>
          </div>
          <div class="product-card-actions">
            <button class="btn btn-outline btn-sm" onclick="openProductModal('${prod.id}')">
              View Details
            </button>
            <button class="btn btn-whatsapp btn-sm" onclick="directWhatsAppEnquire('${prod.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Search and Sort listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderProducts();
    });
  }

  // --- 5. Product Quick View & Detail Modal ---
  window.openProductModal = function(productId) {
    const prod = PRODUCTS_DATA.find(p => p.id === productId);
    if (!prod || !productModal) return;

    currentProduct = prod;
    selectedSize = prod.sizes[0];
    selectedFinish = prod.finishes[0];

    const modalBody = document.getElementById('modalDynamicContent');
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="modal-gallery">
        <div class="modal-main-image-wrap">
          <img id="modalMainImg" src="${prod.image}" alt="${prod.name}">
        </div>
        <div class="modal-thumbs-row">
          ${prod.gallery.map((img, idx) => `
            <div class="modal-thumb ${idx === 0 ? 'active' : ''}" onclick="switchModalImage('${img}', this)">
              <img src="${img}" alt="${prod.name} angle ${idx + 1}">
            </div>
          `).join('')}
        </div>
      </div>

      <div class="modal-details">
        <span class="modal-product-badge">${prod.categoryName} • ${prod.madeToOrder ? 'Made to Order' : 'Ready Stock'}</span>
        <h2 class="modal-product-title">${prod.name}</h2>
        <div class="modal-product-price">${prod.priceEstimate} <span style="font-size: 0.8rem; font-weight: 500; color: var(--text-muted);">(Custom dimensions supported)</span></div>
        <p class="modal-product-desc">${prod.fullDesc}</p>

        <!-- Size Selection -->
        <div style="margin-bottom: 14px;">
          <div class="option-group-label">Select Dimensions / Size</div>
          <div class="options-pill-list" id="modalSizesList">
            ${prod.sizes.map((s, idx) => `
              <div class="option-pill ${idx === 0 ? 'active' : ''}" onclick="selectModalOption('size', '${s}', this)">
                ${s}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Finish Selection -->
        <div style="margin-bottom: 14px;">
          <div class="option-group-label">Wood & Metal Finish</div>
          <div class="options-pill-list" id="modalFinishesList">
            ${prod.finishes.map((f, idx) => `
              <div class="option-pill ${idx === 0 ? 'active' : ''}" onclick="selectModalOption('finish', '${f}', this)">
                ${f}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Materials & Spec Pill -->
        <div style="background: var(--bg-surface-elevated); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 18px; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
          <strong>Craftsmanship Specs:</strong> ${prod.materials.join(' • ')}<br>
          <strong>Estimated Dispatch:</strong> ${prod.leadTime}
        </div>

        <!-- Custom Engraving Input -->
        <div class="form-group" style="margin-bottom: 20px;">
          <label class="form-label" style="color: var(--text-primary);">Personalized Names / Date (Optional):</label>
          <input type="text" id="modalCustomText" class="form-control" placeholder="e.g. Rahul & Priya / Happy 25th Anniversary" style="background: #FFFFFF; color: #141312; border: 1px solid var(--border-light);">
        </div>

        <!-- Action CTAs -->
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button class="btn btn-whatsapp" style="flex: 1;" onclick="sendModalWhatsAppOrder()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
            Order on WhatsApp
          </button>
          <button class="btn btn-outline" onclick="closeProductModal(); window.location.hash = '#contact';">
            Custom Specification
          </button>
        </div>
      </div>
    `;

    productModal.classList.add('active');
    document.body.classList.add('no-scroll');
  };

  window.switchModalImage = function(imgSrc, element) {
    const mainImg = document.getElementById('modalMainImg');
    if (mainImg) mainImg.src = imgSrc;
    document.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
    if (element) element.classList.add('active');
  };

  window.selectModalOption = function(type, value, element) {
    if (type === 'size') selectedSize = value;
    if (type === 'finish') selectedFinish = value;

    if (element && element.parentElement) {
      element.parentElement.querySelectorAll('.option-pill').forEach(p => p.classList.remove('active'));
      element.classList.add('active');
    }
  };

  window.closeProductModal = function() {
    if (productModal) {
      productModal.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  };

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeProductModal);
  }

  if (productModal) {
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) closeProductModal();
    });
  }

  // Direct WhatsApp Enquire for product
  window.directWhatsAppEnquire = function(productId) {
    const prod = PRODUCTS_DATA.find(p => p.id === productId);
    if (!prod) return;

    const message = `Hello *Shyam Art World*! 🎨\n\nI am interested in ordering/inquiring about this handcrafted piece:\n• *Product:* ${prod.name}\n• *Category:* ${prod.categoryName}\n• *Price Estimate:* ${prod.priceEstimate}\n\nPlease share availability, customization options, and dispatch details. Thank you!`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // WhatsApp order with modal custom choices
  window.sendModalWhatsAppOrder = function() {
    if (!currentProduct) return;
    const customText = document.getElementById('modalCustomText')?.value || 'None';

    const message = `Hello *Shyam Art World*! 🎨\n\nI would like to order/customize the following piece:\n• *Item:* ${currentProduct.name}\n• *Category:* ${currentProduct.categoryName}\n• *Selected Size:* ${selectedSize || 'Standard'}\n• *Selected Finish:* ${selectedFinish || 'Default'}\n• *Personalization:* ${customText}\n• *Estimated Price:* ${currentProduct.priceEstimate}\n\nPlease verify details and provide payment & dispatch timeline.`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    showToast(`Opening WhatsApp with details for ${currentProduct.name}...`);
  };

  // --- 6. Masonry Gallery & Lightbox ---
  function renderGallery() {
    if (!galleryGrid) return;

    const galleryItems = [
      { img: 'assets/images/hero.jpg', tag: 'Living Room Mural', title: 'Illuminated Tree of Life installation' },
      { img: 'assets/images/led_lamp.jpg', tag: 'Night Lamp', title: 'Woodland Deer Layered Ambient Glow' },
      { img: 'assets/images/mdf_wall_art.jpg', tag: 'Laser Cut Wall Art', title: 'Royal Horse Carriage Mountain Panel' },
      { img: 'assets/images/jhula.jpg', tag: 'Heritage Furniture', title: 'Carved Teakwood Swing with Brass Chains' },
      { img: 'assets/images/clock.jpg', tag: 'Handcrafted Clocks', title: 'Celestial Silent Mandala Wall Clock' },
      { img: 'assets/images/3d_frame.jpg', tag: '3D Memory Box', title: 'Layered Floral Mandala Family Frame' },
      { img: 'assets/images/spiritual.jpg', tag: 'Devotional Corner', title: 'Divine Radha Krishna Backlit Shrine' },
      { img: 'assets/images/personalized.jpg', tag: 'Custom Gifts', title: 'Engraved Romantic Couple Silhouette' },
      { img: 'assets/images/geometric_panel.jpg', tag: 'Architectural Decor', title: 'Parametric 3D Modern Fretwork Panel' },
      { img: 'assets/images/metal_art.jpg', tag: 'Metal Wall Art', title: 'Monstera & Ginkgo Triptych Set' },
      { img: 'assets/images/tree_lamp.jpg', tag: 'Tabletop Decor', title: 'Tree of Wisdom Warm Bedside Lamp' },
      { img: 'assets/images/artisan.jpg', tag: 'Behind The Craft', title: 'Master Artisan Hand-Finishing in Studio' }
    ];

    galleryGrid.innerHTML = galleryItems.map(item => `
      <div class="gallery-item" onclick="openLightbox('${item.img}', '${item.title}', '${item.tag}')">
        <img src="${item.img}" alt="${item.title} - Shyam Art World" loading="lazy">
        <div class="gallery-overlay">
          <span class="gallery-item-tag">${item.tag}</span>
          <h4 class="gallery-item-title">${item.title}</h4>
          <div class="gallery-zoom-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </div>
        </div>
      </div>
    `).join('');
  }

  window.openLightbox = function(imgSrc, title, tag) {
    if (!lightboxModal) return;
    const lbImg = document.getElementById('lightboxImg');
    const lbTitle = document.getElementById('lightboxTitle');
    const lbTag = document.getElementById('lightboxTag');

    if (lbImg) lbImg.src = imgSrc;
    if (lbTitle) lbTitle.textContent = title;
    if (lbTag) lbTag.textContent = tag;

    lightboxModal.classList.add('active');
    document.body.classList.add('no-scroll');
  };

  window.closeLightbox = function() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }
  };

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // --- 7. Contact Form Handler ---
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const cName = document.getElementById('contactName')?.value.trim();
      const cPhone = document.getElementById('contactPhone')?.value.trim();
      const cEmail = document.getElementById('contactEmail')?.value.trim();
      const cMessage = document.getElementById('contactMessage')?.value.trim();

      if (!cName || !cPhone || !cMessage) {
        showToast('Please provide your name, phone number, and message.');
        return;
      }

      const msg = `Hello *Shyam Art World* Studio! 📩\n\n• *Name:* ${cName}\n• *Phone:* ${cPhone}\n• *Email:* ${cEmail || 'N/A'}\n• *Message:* ${cMessage}`;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
      showToast('Message sent! Our studio artisan will get back to you shortly.');
      contactForm.reset();
    });
  }

  // --- 8. Toast Notification Helper ---
  function showToast(msg) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-primary)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      <span>${msg}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-100%)';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // Initial Run
  renderFilterButtons();
  renderProducts();
  renderGallery();
});
