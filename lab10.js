(function () {
  const LS_LANG = 'mealdropLang';
  const LS_THEME = 'mealdropTheme';
  const LS_USER = 'mealdropCurrentUser';

  const i18n = {
    en: {
      home: 'Home', restaurants: 'All restaurants', favorites: '❤ Favorites', login: 'Login', logout: 'Logout', admin: 'Admin',
      heroTitle: 'Hungry? Find your next meal', heroButton: 'See all restaurants', picks: 'Our favourite picks', award: 'Award winning The best restaurants near you!',
      catalogTitle: 'Food Catalog', search: 'Search by name...', sort: 'Sort by', priceLow: 'Price (Low to High)', priceHigh: 'Price (High to Low)', nameAz: 'Name (A-Z)', ratingHigh: 'Rating (High to Low)', min: 'Min $', max: 'Max $', prev: 'Previous', next: 'Next',
      profile: 'User profile', save: 'Save profile', reset: 'Reset settings', theme: 'Theme', dark: 'Dark', light: 'Light', firstName: 'First name', lastName: 'Last name', email: 'Email', phone: 'Phone', nickname: 'Nickname'
    },
    ru: {
      home: 'Главная', restaurants: 'Все рестораны', favorites: '❤ Избранное', login: 'Войти', logout: 'Выйти', admin: 'Админ',
      heroTitle: 'Голоден? Найди следующее блюдо', heroButton: 'Смотреть рестораны', picks: 'Наш выбор', award: 'Победители рейтингов Лучшие рестораны рядом!',
      catalogTitle: 'Каталог еды', search: 'Поиск по названию...', sort: 'Сортировать', priceLow: 'Цена по возрастанию', priceHigh: 'Цена по убыванию', nameAz: 'Название А-Я', ratingHigh: 'Рейтинг по убыванию', min: 'Мин $', max: 'Макс $', prev: 'Назад', next: 'Вперёд',
      profile: 'Профиль пользователя', save: 'Сохранить профиль', reset: 'Сбросить настройки', theme: 'Тема', dark: 'Тёмная', light: 'Светлая', firstName: 'Имя', lastName: 'Фамилия', email: 'Email', phone: 'Телефон', nickname: 'Никнейм'
    }
  };

  const bindings = [
    ['.nav-home', 'home'], ['.nav-rest', 'restaurants'], ['.nav-fav', 'favorites'], ['[data-auth-link]', 'login'], ['[data-logout-button]', 'logout'], ['[data-admin-link]', 'admin'],
    ['.hero-text', 'heroTitle'], ['.cta-button', 'heroButton'], ['.rest-text', 'picks'], ['.awrd-text', 'award'], ['.awrd-button', 'heroButton'],
    ['.catalog-title', 'catalogTitle'], ['#prevPage', 'prev'], ['#nextPage', 'next']
  ];

  const placeholderBindings = [
    ['#searchInput', 'search'], ['#priceMin', 'min'], ['#priceMax', 'max']
  ];

  function currentLang() {
    return localStorage.getItem(LS_LANG) || 'en';
  }

  function currentTheme() {
    return localStorage.getItem(LS_THEME) || 'light';
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(LS_USER)); } catch (e) { return null; }
  }

  function saveUser(user) {
    localStorage.setItem(LS_USER, JSON.stringify(user));
  }

  function setDataAttributes() {
    bindings.forEach(([selector, key]) => {
      document.querySelectorAll(selector).forEach(el => { el.dataset.i18n = key; });
    });
    placeholderBindings.forEach(([selector, key]) => {
      document.querySelectorAll(selector).forEach(el => { el.dataset.i18nPlaceholder = key; });
    });
    document.querySelectorAll('#sortSelect option').forEach(option => {
      const map = { '': 'sort', price_asc: 'priceLow', price_desc: 'priceHigh', name_asc: 'nameAz', rating_desc: 'ratingHigh' };
      if (map[option.value]) option.dataset.i18n = map[option.value];
    });
  }

  function translate(lang) {
    const dict = i18n[lang] || i18n.en;
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (dict[key]) el.textContent = dict[key];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      if (dict[key]) el.placeholder = dict[key];
    });
    document.querySelectorAll('.lab10-lang').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    const themeBtn = document.querySelector('.lab10-theme');
    if (themeBtn) themeBtn.textContent = `${dict.theme}: ${currentTheme() === 'dark' ? dict.dark : dict.light}`;
  }

  function applyTheme(theme) {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.querySelectorAll('.hero-image, .pic-cont img, .food-card img, .fav-card img, .rest-mira img, .rest-kara_fin img, .rest-tkuy img')
      .forEach(img => img.classList.toggle('theme-dark-image', theme === 'dark'));
    const logo = document.querySelector('.logo-icon');
    if (logo) logo.src = theme === 'dark' ? 'Logo_green.png' : 'Logo_blue.png';
    document.querySelectorAll('.lab10-theme').forEach(btn => btn.classList.toggle('active', theme === 'dark'));
    translate(currentLang());
  }

  function showToast(text, type = 'success') {
    if (typeof window.showMessage === 'function') window.showMessage(text, type);
  }

  function addPanel() {
    const nav = document.querySelector('.navigation');
    if (!nav || document.querySelector('.lab10-panel')) return;
    const panel = document.createElement('div');
    panel.className = 'lab10-panel';
    panel.innerHTML = `
      <button type="button" class="lab10-lang" data-lang="en">en</button>
      <button type="button" class="lab10-lang" data-lang="ru">ru</button>
      <button type="button" class="lab10-theme"></button>
      <button type="button" class="lab10-profile" title="Profile">👤</button>
      <button type="button" class="lab10-reset"></button>
    `;
    nav.append(panel);

    panel.querySelectorAll('.lab10-lang').forEach(btn => {
      btn.addEventListener('click', () => {
        localStorage.setItem(LS_LANG, btn.dataset.lang);
        translate(btn.dataset.lang);
      });
    });

    panel.querySelector('.lab10-theme').addEventListener('click', () => {
      const nextTheme = currentTheme() === 'dark' ? 'light' : 'dark';
      localStorage.setItem(LS_THEME, nextTheme);
      applyTheme(nextTheme);
    });

    panel.querySelector('.lab10-reset').addEventListener('click', () => {
      localStorage.removeItem(LS_LANG);
      localStorage.removeItem(LS_THEME);
      applyTheme('light');
      translate('en');
      showToast('Settings were reset');
    });

    panel.querySelector('.lab10-profile').addEventListener('click', openProfileModal);
  }

  function createProfileModal() {
    if (document.querySelector('#lab10ProfileModal')) return;
    const modal = document.createElement('div');
    modal.className = 'lab10-modal';
    modal.id = 'lab10ProfileModal';
    modal.innerHTML = `
      <div class="lab10-modal__content">
        <button type="button" class="lab10-modal__close">×</button>
        <h2 data-i18n="profile">User profile</h2>
        <form class="lab10-profile-form">
          <label><span data-i18n="firstName">First name</span><input name="firstName"></label>
          <label><span data-i18n="lastName">Last name</span><input name="lastName"></label>
          <label><span data-i18n="email">Email</span><input name="email" type="email"></label>
          <label><span data-i18n="phone">Phone</span><input name="phone"></label>
          <label><span data-i18n="nickname">Nickname</span><input name="nickname"></label>
          <button type="submit" data-i18n="save">Save profile</button>
        </form>
      </div>
    `;
    document.body.append(modal);
    modal.addEventListener('click', event => { if (event.target === modal) closeProfileModal(); });
    modal.querySelector('.lab10-modal__close').addEventListener('click', closeProfileModal);
    modal.querySelector('form').addEventListener('submit', saveProfile);
  }

  function openProfileModal() {
    const user = getUser();
    if (!user) {
      showToast(currentLang() === 'ru' ? 'Сначала войдите в аккаунт' : 'Please log in first', 'error');
      window.location.href = 'auth.html';
      return;
    }
    createProfileModal();
    const modal = document.querySelector('#lab10ProfileModal');
    ['firstName', 'lastName', 'email', 'phone', 'nickname'].forEach(name => {
      const input = modal.querySelector(`[name="${name}"]`);
      if (input) input.value = user[name] || '';
    });
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    translate(currentLang());
  }

  function closeProfileModal() {
    const modal = document.querySelector('#lab10ProfileModal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  async function saveProfile(event) {
    event.preventDefault();
    const user = getUser();
    if (!user) return;
    const formData = new FormData(event.currentTarget);
    const updated = { ...user };
    ['firstName', 'lastName', 'email', 'phone', 'nickname'].forEach(name => { updated[name] = formData.get(name).trim(); });
    try {
      const response = await fetch(`${window.API_URL || 'http://localhost:3010'}/users/${user.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated)
      });
      const saved = await response.json();
      saveUser(saved);
      closeProfileModal();
      showToast(currentLang() === 'ru' ? 'Профиль сохранён' : 'Profile saved');
      setTimeout(() => window.location.reload(), 400);
    } catch (error) {
      saveUser(updated);
      closeProfileModal();
      showToast(currentLang() === 'ru' ? 'Профиль сохранён локально' : 'Profile saved locally');
    }
  }

  function patchLogoutButton() {
    const user = getUser();
    if (!user) return;
    const nav = document.querySelector('.navigation');
    if (!nav || nav.querySelector('.lab10-logout')) return;
    const btn = document.createElement('button');
    btn.className = 'lab10-logout';
    btn.type = 'button';
    btn.dataset.i18n = 'logout';
    btn.textContent = 'Logout';
    btn.addEventListener('click', () => {
      localStorage.removeItem(LS_USER);
      showToast(currentLang() === 'ru' ? 'Вы вышли из аккаунта' : 'You logged out');
      setTimeout(() => window.location.reload(), 450);
    });
    nav.append(btn);
  }

  document.addEventListener('DOMContentLoaded', () => {
    addPanel();
    patchLogoutButton();
    setDataAttributes();
    applyTheme(currentTheme());
    translate(currentLang());
    setTimeout(() => { setDataAttributes(); translate(currentLang()); patchLogoutButton(); }, 350);
  });
})();
