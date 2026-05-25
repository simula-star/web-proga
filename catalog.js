// Адрес вашего JSON-сервера
const API_URL = 'http://localhost:3010'; 

// Текущее состояние фильтров, пагинации и сортировки (для формирования запросов)
let queryParams = {
    _page: 1,
    _limit: 8,      // Пагинация: сколько товаров показывать на одной странице
    q: '',          // Поиск по ключевому слову
    _sort: '',      // Поле сортировки (price, name, rating)
    _order: '',     // Направление сортировки (asc, desc)
    category: '',   // Выбранная категория
    price_gte: '',  // Минимальная цена диапазона
    price_lte: ''   // Максимальная цена диапазона
};

// Хранилище исходного массива из 15 элементов для работы с Set (Пункт 5)
const foods = [
    { id: 1, name: "Pepperoni Pizza", category: "Pizza", price: 15, rating: 4.8, description: "Hot pizza with pepperoni", image: "pizza_pic.jpg" },
    { id: 2, name: "Cheese Burger", category: "Burgers", price: 12, rating: 4.5, description: "Juicy burger with cheese", image: "burgers_pic.png" },
    { id: 3, name: "Chocolate Cake", category: "Desserts", price: 8, rating: 4.9, description: "Sweet chocolate dessert", image: "desserts_pic.png" },
    { id: 4, name: "Philadelphia Roll", category: "Sushi", price: 18, rating: 4.7, description: "Classic sushi roll", image: "sushi_pic.png" },
    { id: 5, name: "Noodles Wok", category: "Asian", price: 14, rating: 4.4, description: "Asian noodles with chicken", image: "asian_pic.png" },
    { id: 6, name: "Margarita Pizza", category: "Pizza", price: 11, rating: 4.2, description: "Classic cheese pizza", image: "pizza_pic.jpg" },
    { id: 7, name: "Spicy Burger", category: "Burgers", price: 14, rating: 4.6, description: "Burger with jalapeno", image: "burgers_pic.png" },
    { id: 8, name: "Ice Cream", category: "Desserts", price: 6, rating: 4.3, description: "Vanilla ice cream with chocolate syrup", image: "desserts_pic.png" },
    { id: 9, name: "California Roll", category: "Sushi", price: 16, rating: 4.6, description: "Sushi roll with crab and avocado", image: "sushi_pic.png" },
    { id: 10, name: "Fried Rice", category: "Asian", price: 12, rating: 4.1, description: "Fried rice with vegetables and egg", image: "asian_pic.png" },
    { id: 11, name: "BBQ Pizza", category: "Pizza", price: 16, rating: 4.7, description: "Pizza with BBQ chicken and red onion", image: "pizza_pic.jpg" },
    { id: 12, name: "Vegan Burger", category: "Burgers", price: 13, rating: 4.4, description: "Plant-based burger with lettuce and tomato", image: "burgers_pic.png" },
    { id: 13, name: "Cheesecake", category: "Desserts", price: 9, rating: 4.8, description: "New York style cheesecake", image: "desserts_pic.png" },
    { id: 14, name: "Salmon Nigiri", category: "Sushi", price: 15, rating: 4.5, description: "Fresh salmon over pressed rice", image: "sushi_pic.png" },
    { id: 15, name: "Spring Rolls", category: "Asian", price: 7, rating: 4.2, description: "Crispy rolls filled with vegetables", image: "asian_pic.png" }
];

// Автоматически собираем уникальные категории из наших 15 продуктов с помощью Set (Пункт 5)
const uniqueCategories = new Set(foods.map(item => item.category));

// Запуск при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
    initCategoryListeners(); // Привязка событий к кнопкам категорий
    fetchFoods();           // Первая загрузка данных из JSON Server
});

// ГЛАВНАЯ ФУНКЦИЯ: Запрос к JSON Server с учётом всех фильтров
async function fetchFoods() {
    // Формируем URL с динамическими параметрами
    const url = new URL(`${API_URL}/foods`);
    
    Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== '') {
            url.searchParams.append(key, queryParams[key]);
        }
    });

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        // Получаем общее количество элементов из заголовков ответа сервера (нужно для пагинации)
        const totalCount = response.headers.get('X-Total-Count');
        updatePaginationUI(totalCount);
        
        // Перерисовываем карточки товаров
        renderCards(data);
    } catch (error) {
        console.error("Ошибка при работе с JSON Server:", error);
    }
}

// ФУНКЦИЯ ОТРИСОВКИ КАРТОЧЕК (Пункт 1, 8, 10)
function renderCards(data) {
    const grid = document.getElementById("foodGrid");
    grid.innerHTML = "";

    // Пункт 8: Обработка ситуации, когда товары не найдены
    if (data.length === 0) {
        grid.innerHTML = `<p class="not-found" style="grid-column: 1/-1;">Товары по заданным критериям не найдены</p>`;
        return;
    }

    // Рендерим карточки из полученного ответа сервера
    data.forEach(item => {
        grid.innerHTML += `
            <div class="food-card" data-food-card data-food-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="food-info">
                    <h2>${item.name}</h2>
                    <p>${item.description}</p>
                    <p><strong>Price:</strong> $${item.price}</p>
                    <p><strong>Rating:</strong> ${item.rating}</p>
                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <button onclick="addToCart(${item.id})" style="flex:1; padding:10px; background:#202020; color:#fff; border:none; border-radius:8px; cursor:pointer;">В корзину</button>
                        <button onclick="addToFavorites(${item.id})" style="padding:10px; background:#fff; border:1px solid #202020; border-radius:8px; cursor:pointer;">❤</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// ПОИСК ПО НЕСКОЛЬКИМ ПОЛЯМ (Пункт 3, 6)
document.getElementById("searchInput").addEventListener("input", (e) => {
    queryParams.q = e.target.value;
    queryParams._page = 1; // Сбрасываем на первую страницу при вводе
    fetchFoods();
});

// СОРТИРОВКА ЧЕРЕЗ ЗАПРОСЫ (Пункт 4)
document.getElementById("sortSelect").addEventListener("change", (e) => {
    const value = e.target.value;
    
    if (value === "price_asc") {
        queryParams._sort = "price";
        queryParams._order = "asc";
    } else if (value === "price_desc") {
        queryParams._sort = "price";
        queryParams._order = "desc";
    } else if (value === "name_asc") {
        queryParams._sort = "name";
        queryParams._order = "asc";
    } else if (value === "rating_desc") {
        queryParams._sort = "rating";
        queryParams._order = "desc";
    } else {
        queryParams._sort = "";
        queryParams._order = "";
    }
    
    queryParams._page = 1;
    fetchFoods();
});

// ФИЛЬТРАЦИЯ ПО КАТЕГОРИЯМ (Пункт 5 - Привязка к вашим кнопкам)
function initCategoryListeners() {
    document.querySelectorAll(".category-buttons button").forEach(button => {
        button.addEventListener("click", (e) => {
            const category = e.target.getAttribute("data-category");
            
            if (category === "all") {
                queryParams.category = ""; 
            } else {
                // Проверяем, существует ли категория в нашем Set перед фильтрацией (для надежности выполнения ТЗ)
                if (uniqueCategories.has(category)) {
                    queryParams.category = category;
                }
            }
            
            queryParams._page = 1;
            fetchFoods();
        });
    });
}

// РАСШИРЕННАЯ ФИЛЬТРАЦИЯ ПО ДИАПАЗОНАМ ЦЕН (Пункт 7)
// Добавьте эти слушатели, если вы внедрили инпуты min/max цены в HTML
const priceMinInput = document.getElementById("priceMin");
const priceMaxInput = document.getElementById("priceMax");

if (priceMinInput) {
    priceMinInput.addEventListener("input", (e) => {
        queryParams.price_gte = e.target.value;
        queryParams._page = 1;
        fetchFoods();
    });
}
if (priceMaxInput) {
    priceMaxInput.addEventListener("input", (e) => {
        queryParams.price_lte = e.target.value;
        queryParams._page = 1;
        fetchFoods();
    });
}

// ПАГИНАЦИЯ (Пункт 9)
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
        if (queryParams._page > 1) {
            queryParams._page--;
            fetchFoods();
        }
    });

    nextBtn.addEventListener("click", () => {
        queryParams._page++;
        fetchFoods();
    });
}

function updatePaginationUI(totalCount) {
    if (!pageInfo || !prevBtn || !nextBtn) return;
    
    pageInfo.innerText = `Page ${queryParams._page}`;
    prevBtn.disabled = queryParams._page === 1;
    
    const maxPages = Math.ceil(totalCount / queryParams._limit);
    nextBtn.disabled = queryParams._page >= maxPages || !maxPages;
}

// ДОБAВЛЕНИЕ В КОРЗИНУ И ИЗБРАННОЕ (Пункт 11, 12)
async function addToCart(foodId) {
    try {
        const user = getCurrentUser ? getCurrentUser() : null;
        await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ foodId: foodId, userId: user ? user.id : null, quantity: 1, addedAt: new Date().toISOString() })
        });
        showMessage ? showMessage('Товар успешно добавлен в корзину!') : alert('Товар успешно добавлен в корзину!');
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
    }
}

async function addToFavorites(foodId) {
    try {
        const user = getCurrentUser ? getCurrentUser() : null;
        await fetch(`${API_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ foodId: foodId, userId: user ? user.id : null, addedAt: new Date().toISOString() })
        });
        showMessage ? showMessage('Товар успешно добавлен в избранное!') : alert('Товар успешно добавлен в избранное!');
    } catch (error) {
        console.error('Ошибка добавления в избранное:', error);
    }
}