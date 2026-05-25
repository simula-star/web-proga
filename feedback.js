const feedbackForm = document.getElementById('feedbackForm');
const foodSelect = document.getElementById('foodSelect');
const feedbackBtn = document.getElementById('feedbackBtn');
const accessBox = document.getElementById('feedbackAccess');
let purchasedFoods = [];

function setError(name, text = '') {
  const box = document.querySelector(`[data-error-for="${name}"]`);
  if (box) box.textContent = text;
}

async function loadPurchasedFoods() {
  const user = getCurrentUser();
  if (!user) {
    accessBox.textContent = 'Please log in before leaving feedback.';
    feedbackForm.hidden = true;
    return;
  }
  if (user.role === 'administrator') {
    accessBox.textContent = 'Administrator cannot leave feedback.';
    feedbackForm.hidden = true;
    return;
  }

  const response = await fetch(`${API_URL}/orders?userId=${user.id}`);
  const orders = await response.json();
  const map = new Map();
  orders.forEach(order => (order.items || []).forEach(item => map.set(item.foodId, item)));
  purchasedFoods = [...map.values()];

  if (!purchasedFoods.length) {
    accessBox.textContent = 'You need to buy a meal before leaving feedback.';
    feedbackForm.hidden = true;
    return;
  }

  foodSelect.innerHTML = '<option value="">Choose purchased meal</option>' + purchasedFoods.map(item => `<option value="${item.foodId}">${item.name}</option>`).join('');
  feedbackForm.hidden = false;
}

function validateFeedback() {
  let valid = true;
  setError('food'); setError('rating'); setError('review');
  const text = document.getElementById('reviewText').value.trim();
  const rating = Number(document.getElementById('rating').value);
  if (!foodSelect.value) { setError('food', 'Choose a meal.'); valid = false; }
  if (rating < 1 || rating > 5) { setError('rating', 'Rating must be from 1 to 5.'); valid = false; }
  if (text.length < 20) { setError('review', 'Review must contain at least 20 characters.'); valid = false; }
  feedbackBtn.disabled = !valid;
  return valid;
}

feedbackForm.addEventListener('input', validateFeedback);
feedbackForm.addEventListener('change', validateFeedback);
feedbackForm.addEventListener('submit', async event => {
  event.preventDefault();
  if (!validateFeedback()) return;
  const user = getCurrentUser();
  const item = purchasedFoods.find(food => String(food.foodId) === foodSelect.value);
  await fetch(`${API_URL}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: user.id,
      userEmail: user.email,
      nickname: user.nickname,
      foodId: Number(foodSelect.value),
      foodName: item ? item.name : foodSelect.value,
      rating: Number(document.getElementById('rating').value),
      text: document.getElementById('reviewText').value.trim(),
      createdAt: new Date().toISOString()
    })
  });
  feedbackForm.reset();
  feedbackBtn.disabled = true;
  showMessage('Feedback was sent successfully');
});

document.addEventListener('DOMContentLoaded', loadPurchasedFoods);
