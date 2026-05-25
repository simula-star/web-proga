const adminAccess = document.getElementById('adminAccess');
const adminContent = document.getElementById('adminContent');
const foodForm = document.getElementById('foodForm');
const saveFoodBtn = document.getElementById('saveFoodBtn');
const adminFoods = document.getElementById('adminFoods');
const adminFeedback = document.getElementById('adminFeedback');
const feedbackFoodFilter = document.getElementById('feedbackFoodFilter');
const feedbackUserFilter = document.getElementById('feedbackUserFilter');

function err(name, text = '') {
  const box = document.querySelector(`[data-error-for="${name}"]`);
  if (box) box.textContent = text;
}

function checkAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'administrator') {
    adminAccess.innerHTML = '<h1>Access denied</h1><p>Only administrator can open this page. Use admin@mealdrop.local / Admin123!</p><a class="submit-btn" href="auth.html">Go to login</a>';
    adminContent.hidden = true;
    return false;
  }
  adminAccess.hidden = true;
  adminContent.hidden = false;
  return true;
}

function validateFoodForm() {
  let valid = true;
  err('foodName'); err('foodCategory'); err('foodNumbers'); err('foodImage'); err('foodDescription');
  const name = document.getElementById('foodName').value.trim();
  const category = document.getElementById('foodCategory').value.trim();
  const price = Number(document.getElementById('foodPrice').value);
  const rating = Number(document.getElementById('foodRating').value);
  const image = document.getElementById('foodImage').value.trim();
  const description = document.getElementById('foodDescription').value.trim();
  if (name.length < 2) { err('foodName', 'Enter meal name.'); valid = false; }
  if (category.length < 2) { err('foodCategory', 'Enter category.'); valid = false; }
  if (price <= 0 || rating < 1 || rating > 5) { err('foodNumbers', 'Price must be positive. Rating must be from 1 to 5.'); valid = false; }
  if (!image) { err('foodImage', 'Enter image filename.'); valid = false; }
  if (description.length < 10) { err('foodDescription', 'Description must contain at least 10 characters.'); valid = false; }
  saveFoodBtn.disabled = !valid;
  return valid;
}

function readFoodForm() {
  return {
    name: document.getElementById('foodName').value.trim(),
    category: document.getElementById('foodCategory').value.trim(),
    price: Number(document.getElementById('foodPrice').value),
    rating: Number(document.getElementById('foodRating').value),
    image: document.getElementById('foodImage').value.trim(),
    description: document.getElementById('foodDescription').value.trim()
  };
}

function fillFoodForm(food) {
  document.getElementById('foodId').value = food.id;
  document.getElementById('foodName').value = food.name;
  document.getElementById('foodCategory').value = food.category;
  document.getElementById('foodPrice').value = food.price;
  document.getElementById('foodRating').value = food.rating;
  document.getElementById('foodImage').value = food.image;
  document.getElementById('foodDescription').value = food.description;
  validateFoodForm();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function loadFoods() {
  const response = await fetch(`${API_URL}/foods`);
  const foods = await response.json();
  adminFoods.innerHTML = foods.map(food => `
    <article class="admin-item">
      <img src="${food.image}" alt="${food.name}">
      <div><b>${food.name}</b><br>${food.category} · $${food.price} · ⭐ ${food.rating}</div>
      <button type="button" onclick='editFood(${JSON.stringify(food).replace(/'/g, '&apos;')})'>Edit</button>
      <button type="button" class="danger" onclick="deleteFood(${food.id})">Delete</button>
    </article>
  `).join('');
  feedbackFoodFilter.innerHTML = '<option value="">All meals</option>' + foods.map(food => `<option value="${food.id}">${food.name}</option>`).join('');
}

function editFood(food) { fillFoodForm(food); if (window.openFoodAdminModal) window.openFoodAdminModal(); }

async function deleteFood(id) {
  if (window.openDeleteFoodModal) { window.openDeleteFoodModal(id); return; }
  if (!confirm('Delete this meal?')) return;
  await confirmDeleteFood(id);
}

async function confirmDeleteFood(id) {
  await fetch(`${API_URL}/foods/${id}`, { method: 'DELETE' });
  showMessage('Meal deleted');
  loadFoods();
}
window.confirmDeleteFood = confirmDeleteFood;

foodForm.addEventListener('input', validateFoodForm);
foodForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!validateFoodForm()) return;
  const id = document.getElementById('foodId').value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/foods/${id}` : `${API_URL}/foods`;
  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(readFoodForm())
  });
  showMessage(id ? 'Meal updated' : 'Meal added');
  if (window.closeAdminModal) window.closeAdminModal();
  foodForm.reset();
  document.getElementById('foodId').value = '';
  saveFoodBtn.disabled = true;
  loadFoods();
});

document.getElementById('resetFoodBtn').addEventListener('click', () => {
  foodForm.reset(); document.getElementById('foodId').value = ''; saveFoodBtn.disabled = true;
});

async function loadUsersForFilter() {
  const response = await fetch(`${API_URL}/users`);
  const users = await response.json();
  feedbackUserFilter.innerHTML = '<option value="">All users</option>' + users.map(user => `<option value="${user.id}">${user.nickname} (${user.email})</option>`).join('');
}

async function loadFeedback() {
  const params = new URLSearchParams();
  if (feedbackFoodFilter.value) params.append('foodId', feedbackFoodFilter.value);
  if (feedbackUserFilter.value) params.append('userId', feedbackUserFilter.value);
  const response = await fetch(`${API_URL}/feedback?${params.toString()}`);
  const items = await response.json();
  if (!items.length) {
    adminFeedback.innerHTML = '<p>No feedback found.</p>';
    return;
  }
  adminFeedback.innerHTML = items.map(item => `
    <article class="admin-item admin-item--feedback">
      <div><b>${item.foodName}</b> · ⭐ ${item.rating}<br>By ${item.nickname || item.userEmail}<p>${item.text}</p></div>
      <button type="button" class="danger" onclick="deleteFeedback(${item.id})">Delete</button>
    </article>
  `).join('');
}

async function deleteFeedback(id) {
  await fetch(`${API_URL}/feedback/${id}`, { method: 'DELETE' });
  showMessage('Feedback deleted');
  loadFeedback();
}

feedbackFoodFilter.addEventListener('change', loadFeedback);
feedbackUserFilter.addEventListener('change', loadFeedback);

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAdmin()) return;
  loadFoods();
  loadUsersForFilter();
  loadFeedback();
});
