const API_URL = 'http://localhost:3010';

document.addEventListener('DOMContentLoaded', loadCart);

// Загрузка корзины
async function loadCart() {
    try {
        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        const userQuery = user ? `userId=${encodeURIComponent(user.id)}&` : '';
        const response = await fetch(`${API_URL}/cart?${userQuery}_expand=food`);
        const cartItems = await response.json();
        renderCart(cartItems);
    } catch (error) {
        console.error("Ошибка загрузки корзины:", error);
    }
}

// Отрисовка корзины и подсчет суммы (Пункты 3, 4)
function renderCart(cartItems) {
    const container = document.getElementById('cartItems');
    const totalElement = document.getElementById('cartTotal');
    
    container.innerHTML = '';
    let totalPrice = 0;

    if (cartItems.length === 0) {
        container.innerHTML = `<p style="font-size: 20px;">Ваша корзина пуста</p>`;
        totalElement.innerText = '0';
        return;
    }

    cartItems.forEach(item => {
        if (!item.food) return;

        // Считаем стоимость позиции (цена * количество)
        const itemTotal = item.food.price * item.quantity;
        totalPrice += itemTotal;

        container.innerHTML += `
            <div style="display: flex; gap: 20px; align-items: center; border: 1px solid #eee; padding: 15px; border-radius: 12px;">
                <img src="${item.food.image}" style="width: 120px; height: 100px; object-fit: cover; border-radius: 8px;">
                
                <div style="flex-grow: 1;">
                    <h3 style="font-size: 20px; margin-bottom: 5px;">${item.food.name}</h3>
                    <p style="color: #666;">$${item.food.price} за шт.</p>
                </div>
                
                <div style="display: flex; align-items: center; gap: 10px; font-size: 18px;">
                    <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" style="width: 30px; height: 30px; cursor: pointer;">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" style="width: 30px; height: 30px; cursor: pointer;">+</button>
                </div>
                
                <div style="min-width: 80px; text-align: right;">
                    <strong style="font-size: 18px;">$${itemTotal}</strong>
                </div>

                <button onclick="removeFromCart('${item.id}')" style="margin-left: 20px; padding: 8px 15px; background: #ff4d4d; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    X
                </button>
            </div>
        `;
    });

    totalElement.innerText = totalPrice;
}

// Изменение количества (PATCH-запрос)
async function updateQuantity(id, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(id); // Если количество = 0, удаляем товар
        return;
    }

    try {
        await fetch(`${API_URL}/cart/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQuantity })
        });
        loadCart(); // Обновляем корзину
    } catch (error) {
        console.error("Ошибка обновления количества:", error);
    }
}

// Удаление из корзины (DELETE-запрос)
async function removeFromCart(id) {
    try {
        await fetch(`${API_URL}/cart/${id}`, { method: 'DELETE' });
        loadCart();
    } catch (error) {
        console.error("Ошибка удаления:", error);
    }
}

// Оформление покупки: заказ записывается в коллекцию orders
async function checkout() {
    try {
        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;

        if (!user) {
            showMessage ? showMessage("Для оформления покупки сначала войдите в аккаунт.", "error") : alert("Для оформления покупки сначала войдите в аккаунт.");
            window.location.href = 'auth.html';
            return;
        }

        // user is already loaded above
        const userQuery = user ? `userId=${encodeURIComponent(user.id)}&` : '';
        const response = await fetch(`${API_URL}/cart?${userQuery}_expand=food`);
        const cartItems = await response.json();

        if (cartItems.length === 0) {
            showMessage ? showMessage("Корзина пуста. Добавьте товары перед оформлением!", "error") : alert("Корзина пуста. Добавьте товары перед оформлением!");
            return;
        }

        const items = cartItems
            .filter(item => item.food)
            .map(item => ({
                foodId: item.foodId,
                name: item.food.name,
                price: item.food.price,
                quantity: item.quantity,
                image: item.food.image
            }));

        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                userEmail: user.email,
                items,
                total,
                createdAt: new Date().toISOString()
            })
        });

        for (let item of cartItems) {
            await fetch(`${API_URL}/cart/${item.id}`, { method: 'DELETE' });
        }

        showMessage ? showMessage("Покупка успешно оформлена! Заказ записан в orders.") : alert("Покупка успешно оформлена! Заказ записан в orders.");
        loadCart();

    } catch (error) {
        console.error("Ошибка при оформлении заказа:", error);
    }
}
