window.API_URL = window.API_URL || 'http://localhost:3010';

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('mealdropCurrentUser'));
  } catch (error) {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem('mealdropCurrentUser', JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem('mealdropCurrentUser');
}

function showMessage(text, type = 'success') {
  let box = document.querySelector('.app-message');
  if (!box) {
    box = document.createElement('div');
    box.className = 'app-message';
    document.body.append(box);
  }
  box.textContent = text;
  box.className = `app-message app-message--${type} app-message--visible`;
  setTimeout(() => box.classList.remove('app-message--visible'), 3000);
}

function updateHeaderByUser() {
  const nav = document.querySelector('.navigation');
  if (!nav) return;

  const user = getCurrentUser();
  let authLink = nav.querySelector('[data-auth-link]');
  let adminLink = nav.querySelector('[data-admin-link]');
  let logoutBtn = nav.querySelector('[data-logout-button]');

  if (!authLink) {
    authLink = document.createElement('a');
    authLink.dataset.authLink = 'true';
    authLink.href = 'auth.html';
    authLink.textContent = 'Login';
    authLink.className = 'nav-auth';
    nav.append(authLink);
  }

  if (user) {
    authLink.textContent = user.nickname || user.email;
    authLink.href = 'auth.html';

    if (!logoutBtn) {
      logoutBtn = document.createElement('button');
      logoutBtn.dataset.logoutButton = 'true';
      logoutBtn.className = 'nav-logout';
      logoutBtn.type = 'button';
      logoutBtn.textContent = 'Logout';
      nav.append(logoutBtn);
      logoutBtn.addEventListener('click', () => {
        clearCurrentUser();
        showMessage('You logged out');
        setTimeout(() => window.location.reload(), 500);
      });
    }

    if (user.role === 'administrator') {
      if (!adminLink) {
        adminLink = document.createElement('a');
        adminLink.dataset.adminLink = 'true';
        adminLink.href = 'admin.html';
        adminLink.textContent = 'Admin';
        adminLink.className = 'nav-admin';
        nav.append(adminLink);
      }
    } else if (adminLink) {
      adminLink.remove();
    }
  } else {
    authLink.textContent = 'Login';
    authLink.href = 'auth.html';
    if (adminLink) adminLink.remove();
    if (logoutBtn) logoutBtn.remove();
  }
}

document.addEventListener('DOMContentLoaded', updateHeaderByUser);
