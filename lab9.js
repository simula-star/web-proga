
(function () {
  const API = window.API_URL || 'http://localhost:3010';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function createPreloader() {
    const preloader = document.createElement('div');
    preloader.className = 'lab9-preloader';
    preloader.innerHTML = '<div><div class="lab9-loader"></div><p>MealDrop is loading...</p></div>';
    document.body.prepend(preloader);
    window.addEventListener('load', () => setTimeout(() => preloader.classList.add('hidden'), 450));
  }

  function initBurgerMenu() {
    const burger = document.querySelector('.menu1');
    if (!burger) return;
    burger.setAttribute('role', 'button');
    burger.setAttribute('tabindex', '0');
    burger.setAttribute('aria-label', 'Open menu');
    const overlay = document.createElement('div');
    overlay.className = 'lab9-overlay';
    const menu = document.createElement('aside');
    menu.className = 'lab9-burger-menu';
    menu.innerHTML = `
      <button class="lab9-close-menu" type="button" aria-label="Close menu">×</button>
      <a href="saut.html#home">Home</a>
      <a href="catalog.html">Catalog</a>
      <a href="favorites.html">Favorites</a>
      <a href="cart.html">Cart</a>
      <a href="feedback.html">Feedback</a>
      <a href="auth.html">Login</a>
    `;
    document.body.append(overlay, menu);
    const open = () => { menu.classList.add('active'); overlay.classList.add('active'); burger.classList.add('lab9-burger-active'); document.body.classList.add('no-scroll'); };
    const close = () => { menu.classList.remove('active'); overlay.classList.remove('active'); burger.classList.remove('lab9-burger-active'); document.body.classList.remove('no-scroll'); };
    burger.addEventListener('click', open);
    burger.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
    overlay.addEventListener('click', close);
    menu.querySelector('.lab9-close-menu').addEventListener('click', close);
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) { event.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  function initRevealOnScroll() {
    document.querySelectorAll('main section, .food-card, .admin-item').forEach(el => el.classList.add('reveal'));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  function initSlider() {
    const slider = document.querySelector('.lab9-slider');
    if (!slider) return;
    const slides = [...slider.querySelectorAll('.lab9-slide')];
    let index = 0;
    const show = i => { slides[index].classList.remove('active'); index = (i + slides.length) % slides.length; slides[index].classList.add('active'); };
    slider.querySelector('[data-slider-prev]').addEventListener('click', () => show(index - 1));
    slider.querySelector('[data-slider-next]').addEventListener('click', () => show(index + 1));
    setInterval(() => show(index + 1), 4500);
  }

  function initParallax() {
    const section = document.querySelector('.lab9-parallax');
    if (!section) return;
    const bg = section.querySelector('.lab9-parallax-bg');
    const mid = section.querySelector('.lab9-parallax-mid');
    const front = section.querySelector('.lab9-parallax-front');
    const move = () => {
      const rect = section.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      bg.style.transform = `translateY(${clamped * 28}px)`;
      mid.style.transform = `translateY(${clamped * -48}px)`;
      front.style.transform = `translateY(${clamped * -86}px)`;
    };
    window.addEventListener('scroll', move, { passive: true });
    move();
  }

  function initMediaGallery() {
    const root = document.querySelector('.lab9-media-gallery');
    if (!root) return;
    const images = [
      ['pizza_pic.jpg', 'Pizza mood'], ['burgers_pic.png', 'Burger mood'], ['desserts_pic.png', 'Dessert mood'], ['sushi_pic.png', 'Sushi mood'], ['asian_pic.png', 'Asian mood'],
      ['comfort_food_pic.png', 'Comfort mood'], ['pic2.jpg', 'Restaurant mood'], ['pic3.jpg', 'Dinner mood'], ['pic5.jpg', 'Cafe mood'], ['pic7.jpg', 'Delivery mood']
    ];
    const img = root.querySelector('[data-media-image]');
    const title = root.querySelector('[data-media-title]');
    const status = root.querySelector('[data-player-status]');
    const volume = root.querySelector('[data-volume]');
    let audio = null;
    function playRandom() {
      const randomIndex = Math.floor(Math.random() * images.length);
      const [src, label] = images[randomIndex];
      img.classList.add('fade');
      setTimeout(() => { img.src = src; img.alt = label; title.textContent = label; img.classList.remove('fade'); }, 170);
      if (audio) { audio.pause(); audio.currentTime = 0; }
      audio = new Audio(`assets/audio/effect${randomIndex + 1}.wav`);
      audio.volume = Number(volume.value || 0.5);
      status.textContent = 'Playing';
      status.classList.add('playing');
      audio.addEventListener('ended', () => { status.textContent = 'Paused'; status.classList.remove('playing'); });
      audio.play().catch(() => { status.textContent = 'Click again to play'; status.classList.remove('playing'); });
    }
    root.querySelectorAll('[data-random-media]').forEach(btn => btn.addEventListener('click', playRandom));
    volume.addEventListener('input', () => { if (audio) audio.volume = Number(volume.value); });
    const videoBtn = root.querySelector('[data-video-trigger]');
    const video = root.querySelector('video');
    videoBtn.addEventListener('click', () => { video.classList.toggle('active'); if (video.classList.contains('active')) video.play(); else video.pause(); });
  }

  async function animateCounter(el, target) {
    const duration = 900;
    const start = performance.now();
    const step = now => {
      const p = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(target * p);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  async function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;
    let counts = { foods: 0, cart: 0, favorites: 0 };
    try {
      const [foods, cart, favorites] = await Promise.all([
        fetch(`${API}/foods`).then(r => r.json()),
        fetch(`${API}/cart`).then(r => r.json()),
        fetch(`${API}/favorites`).then(r => r.json())
      ]);
      counts = { foods: foods.length, cart: cart.length, favorites: favorites.length };
    } catch (e) {}
    counters.forEach(el => animateCounter(el, counts[el.dataset.counter] || 0));
  }

  function createProductModal() {
    if (document.querySelector('[data-product-modal]')) return;
    const backdrop = document.createElement('div');
    backdrop.className = 'lab9-modal-backdrop';
    backdrop.dataset.productModal = 'true';
    backdrop.innerHTML = '<article class="lab9-product-modal"><button class="lab9-modal-close" type="button">×</button><div data-product-content></div></article>';
    document.body.append(backdrop);
    const close = () => backdrop.classList.remove('active');
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
    backdrop.querySelector('.lab9-modal-close').addEventListener('click', close);
  }

  async function openProductModal(id) {
    const backdrop = document.querySelector('[data-product-modal]');
    const content = backdrop.querySelector('[data-product-content]');
    content.innerHTML = '<p>Loading...</p>';
    backdrop.classList.add('active');
    try {
      const food = await fetch(`${API}/foods/${id}`).then(r => r.json());
      content.innerHTML = `
        <img src="${food.image}" alt="${food.name}">
        <h2>${food.name}</h2>
        <p>${food.description}</p>
        <p><b>Category:</b> ${food.category}</p>
        <p><b>Price:</b> $${food.price}</p>
        <p><b>Rating:</b> ${food.rating}</p>
      `;
    } catch (error) { content.innerHTML = '<p>Unable to load product details.</p>'; }
  }

  function initProductModal() {
    createProductModal();
    document.addEventListener('click', event => {
      const card = event.target.closest('[data-food-card]');
      if (!card || event.target.closest('button, a')) return;
      openProductModal(card.dataset.foodId);
    });
  }

  function initAdminModals() {
    const formCard = document.querySelector('.admin-grid > .form-card');
    if (!formCard) return;
    formCard.classList.add('lab9-admin-modal', 'lab9-food-modal-hidden');
    const backdrop = document.createElement('div');
    backdrop.className = 'lab9-modal-backdrop';
    backdrop.dataset.adminFoodBackdrop = 'true';
    formCard.parentNode.insertBefore(backdrop, formCard);
    backdrop.append(formCard);
    if (!formCard.querySelector('.lab9-modal-close')) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button'; closeBtn.className = 'lab9-modal-close'; closeBtn.textContent = '×';
      formCard.prepend(closeBtn);
      closeBtn.addEventListener('click', () => closeAdminModal());
    }
    const openBtn = document.createElement('button');
    openBtn.type = 'button'; openBtn.className = 'lab9-btn lab9-admin-open'; openBtn.textContent = 'Add meal in modal window';
    const adminGrid = document.querySelector('.admin-grid');
    adminGrid.parentNode.insertBefore(openBtn, adminGrid);
    window.openFoodAdminModal = () => { backdrop.classList.add('active'); formCard.classList.remove('lab9-food-modal-hidden'); formCard.classList.add('lab9-food-modal-active'); };
    window.closeAdminModal = () => { backdrop.classList.remove('active'); formCard.classList.add('lab9-food-modal-hidden'); formCard.classList.remove('lab9-food-modal-active'); };
    openBtn.addEventListener('click', () => { const f = document.getElementById('foodForm'); if (f) f.reset(); const id = document.getElementById('foodId'); if (id) id.value = ''; window.openFoodAdminModal(); });
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeAdminModal(); });

    const delBackdrop = document.createElement('div');
    delBackdrop.className = 'lab9-modal-backdrop';
    delBackdrop.innerHTML = '<article class="lab9-delete-modal"><button class="lab9-modal-close" type="button">×</button><h2>Delete meal?</h2><p>This action uses a DELETE request and cannot be undone.</p><div class="admin-actions"><button class="danger" type="button" data-confirm-delete>Delete</button><button type="button" data-cancel-delete>Cancel</button></div></article>';
    document.body.append(delBackdrop);
    let deleteId = null;
    window.openDeleteFoodModal = id => { deleteId = id; delBackdrop.classList.add('active'); };
    delBackdrop.querySelector('.lab9-modal-close').addEventListener('click', () => delBackdrop.classList.remove('active'));
    delBackdrop.querySelector('[data-cancel-delete]').addEventListener('click', () => delBackdrop.classList.remove('active'));
    delBackdrop.querySelector('[data-confirm-delete]').addEventListener('click', async () => {
      if (window.confirmDeleteFood && deleteId != null) await window.confirmDeleteFood(deleteId);
      delBackdrop.classList.remove('active'); deleteId = null;
    });
  }

  ready(() => {
    createPreloader();
    initBurgerMenu();
    initSmoothScroll();
    initSlider();
    initParallax();
    initMediaGallery();
    initCounters();
    initProductModal();
    initAdminModals();
    setTimeout(initRevealOnScroll, 100);
  });
})();
