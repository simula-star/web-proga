const foods = [
    {
        id: 1,
        name: "Pepperoni Pizza",
        category: "Pizza",
        price: 15,
        rating: 4.8,
        description: "Hot pizza with pepperoni",
        image: "pizza_pic.jpg"
    },
    {
        id: 2,
        name: "Cheese Burger",
        category: "Burgers",
        price: 12,
        rating: 4.5,
        description: "Juicy burger with cheese",
        image: "burgers_pic.png"
    },
    {
        id: 3,
        name: "Chocolate Cake",
        category: "Desserts",
        price: 8,
        rating: 4.9,
        description: "Sweet chocolate dessert",
        image: "desserts_pic.png"
    },
    {
        id: 4,
        name: "Philadelphia Roll",
        category: "Sushi",
        price: 18,
        rating: 4.7,
        description: "Classic sushi roll",
        image: "sushi_pic.png"
    },
    {
        id: 5,
        name: "Noodles Wok",
        category: "Asian",
        price: 14,
        rating: 4.4,
        description: "Asian noodles with chicken",
        image: "asian_pic.png"
    },
    {
        id: 6,
        name: "Margherita",
        category: "Pizza",
        price: 13,
        rating: 4.6,
        description: "Classic Italian pizza",
        image: "pizza_pic.jpg"
    },
    {
        id: 7,
        name: "Double Burger",
        category: "Burgers",
        price: 16,
        rating: 4.8,
        description: "Double meat burger",
        image: "burgers_pic.png"
    },
    {
        id: 8,
        name: "Ice Cream",
        category: "Desserts",
        price: 6,
        rating: 4.3,
        description: "Vanilla ice cream",
        image: "desserts_pic.png"
    },
    {
        id: 9,
        name: "Dragon Roll",
        category: "Sushi",
        price: 20,
        rating: 4.9,
        description: "Premium sushi roll",
        image: "sushi_pic.png"
    },
    {
        id: 10,
        name: "Chicken Rice",
        category: "Asian",
        price: 11,
        rating: 4.2,
        description: "Rice with chicken",
        image: "asian_pic.png"
    },
    {
        id: 11,
        name: "BBQ Pizza",
        category: "Pizza",
        price: 17,
        rating: 4.7,
        description: "Pizza with BBQ sauce",
        image: "pizza_pic.jpg"
    },
    {
        id: 12,
        name: "Fish Burger",
        category: "Burgers",
        price: 13,
        rating: 4.1,
        description: "Burger with fish fillet",
        image: "burgers_pic.png"
    },
    {
        id: 13,
        name: "Cheesecake",
        category: "Desserts",
        price: 9,
        rating: 4.8,
        description: "Cream cheese dessert",
        image: "desserts_pic.png"
    },
    {
        id: 14,
        name: "Tempura Roll",
        category: "Sushi",
        price: 19,
        rating: 4.6,
        description: "Hot sushi roll",
        image: "sushi_pic.png"
    },
    {
        id: 15,
        name: "Thai Soup",
        category: "Asian",
        price: 10,
        rating: 4.5,
        description: "Spicy thai soup",
        image: "asian_pic.png"
    }
];

const catalogContainer = document.getElementById("catalogContainer");

function renderCards(items) {

    catalogContainer.innerHTML = "";

    if (items.length === 0) {
        catalogContainer.innerHTML = `
            <p class="not-found">Товары не найдены</p>
        `;
        return;
    }

    items.forEach(item => {
        catalogContainer.innerHTML += `
            <div class="food-card">
                <img src="${item.image}" alt="${item.name}">
                <div class="food-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p><strong>Категория:</strong> ${item.category}</p>
                    <p><strong>Цена:</strong> $${item.price}</p>
                    <p><strong>Рейтинг:</strong> ${item.rating}</p>
                </div>
            </div>
        `;
    });
}

renderCards(foods);



// ПОИСК

document.getElementById("searchInput").addEventListener("input", (e) => {

    const value = e.target.value.toLowerCase();

    const filtered = foods.filter(item =>
        item.name.toLowerCase().includes(value) ||
        item.description.toLowerCase().includes(value)
    );

    renderCards(filtered);
});



// СОРТИРОВКА

document.getElementById("sortSelect").addEventListener("change", (e) => {

    let sorted = [...foods];

    if (e.target.value === "price") {
        sorted.sort((a, b) => a.price - b.price);
    }

    if (e.target.value === "name") {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (e.target.value === "rating") {
        sorted.sort((a, b) => b.rating - a.rating);
    }

    renderCards(sorted);
});



// КАТЕГОРИИ

const categoryButtons = document.querySelectorAll(".category-buttons button");

categoryButtons.forEach(button => {

    button.addEventListener("click", () => {

        const category = button.dataset.category;

        if (category === "all") {
            renderCards(foods);
            return;
        }

        const filtered = foods.filter(item => item.category === category);

        renderCards(filtered);
    });
});



// 10 МЕТОДОВ МАССИВОВ

document.getElementById("mapBtn").addEventListener("click", () => {
    const mapped = foods.map(item => ({
        ...item,
        price: item.price + 2
    }));

    renderCards(mapped);
});

document.getElementById("filterBtn").addEventListener("click", () => {
    const filtered = foods.filter(item => item.price > 12);
    renderCards(filtered);
});

document.getElementById("sortBtn").addEventListener("click", () => {
    const sorted = [...foods].sort((a, b) => b.rating - a.rating);
    renderCards(sorted);
});

document.getElementById("reduceBtn").addEventListener("click", () => {

    const total = foods.reduce((sum, item) => sum + item.price, 0);

    alert("Общая стоимость: $" + total);
});

document.getElementById("findBtn").addEventListener("click", () => {

    const found = foods.find(item => item.rating > 4.8);

    renderCards([found]);
});

document.getElementById("someBtn").addEventListener("click", () => {

    const result = foods.some(item => item.price < 7);

    alert("Есть дешевые товары: " + result);
});

document.getElementById("everyBtn").addEventListener("click", () => {

    const result = foods.every(item => item.rating > 4);

    alert("У всех рейтинг выше 4: " + result);
});

document.getElementById("sliceBtn").addEventListener("click", () => {

    const sliced = foods.slice(0, 5);

    renderCards(sliced);
});

document.getElementById("reverseBtn").addEventListener("click", () => {

    const reversed = [...foods].reverse();

    renderCards(reversed);
});

document.getElementById("includesBtn").addEventListener("click", () => {

    const categories = foods.map(item => item.category);

    alert(categories.includes("Pizza"));
});