const API_URL = 'http://localhost:3010';

document.addEventListener('DOMContentLoaded', loadFavorites);

// Загрузка избранного вместе с данными о продукте (_expand=food)
async function loadFavorites() {
    try {
        const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        const userQuery = user ? `userId=${encodeURIComponent(user.id)}&` : '';
        const response = await fetch(`${API_URL}/favorites?${userQuery}_expand=food`);
        const favorites = await response.json();
        renderFavorites(favorites);
    } catch (error) {
        console.error("Ошибка загрузки избранного:", error);
    }
}

// Отрисовка
function renderFavorites(favorites) {
    const grid = document.getElementById('favoritesGrid');
    grid.innerHTML = '';

    if (favorites.length === 0) {
        grid.innerHTML = `<p>Список избранного пуст.</p>`;
        return;
    }

    favorites.forEach(fav => {
        grid.innerHTML += `
            <div class="fav-card">
                <img src="${fav.food.image}" alt="${fav.food.name}">
                <h2>${fav.food.name}</h2>
                <p>Price: <strong>$${fav.food.price}</strong></p>
                
                <button class="remove-fav-btn" onclick="removeFavorite('${fav.id}')">
                    Удалить из избранного
                </button>
            </div>
        `;
    });
}

// Удаление из избранного
async function removeFavorite(id) {
    try {
        await fetch(`${API_URL}/favorites/${id}`, { method: 'DELETE' });
        loadFavorites(); // Перерисовываем список после удаления
    } catch (error) {
        console.error("Ошибка удаления:", error);
    }
}