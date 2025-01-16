const searchInput = document.getElementById('search-input');
const suggestionsList = document.getElementById('suggestions');
const resultsContainer = document.getElementById('results');
const apiKey = '791d58e1-3359-45f5-8ec4-7350cd00e872';

searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim();


    if (query.length < 3) {
        suggestionsList.innerHTML = '';
        suggestionsList.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/autocomplete?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
        const data = await response.json();


        suggestionsList.innerHTML = '';


        if (Array.isArray(data) && data.length > 0) {
            data.forEach(item => {
                const suggestionItem = document.createElement('li');
                suggestionItem.textContent = item; 
                suggestionItem.className = 'suggestion-item';

                suggestionItem.addEventListener('click', () => {
                    const words = searchInput.value.split(' ');
                    words.pop(); 
                    const newQuery = words.join(' ') + ' ' + item; 
                    searchInput.value = newQuery;
                    suggestionsList.innerHTML = ''; 
                    suggestionsList.style.display = 'none'; 
                });

                suggestionsList.appendChild(suggestionItem);
            });
            suggestionsList.style.display = 'block'; 
        } else {
            suggestionsList.style.display = 'none'; 
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        suggestionsList.innerHTML = '<li class="suggestion-item">Ошибка получения данных.</li>';
        suggestionsList.style.display = 'block';
    }
});


document.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.innerHTML = '';
        suggestionsList.style.display = 'none'; 
    }
});


document.getElementById('search-form').addEventListener('submit', async (event) => {
    event.preventDefault(); 
    const query = searchInput.value.trim();
    resultsContainer.innerHTML = ''; 

    try {
        const response = await fetch(`https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <h3>${item.name}</h3>
                    <p>${item.description || 'Описание не доступно.'}</p>
                    <p>Цена: <strong>${item.actual_price} ₽</strong></p>
                    <button class="add-to-cart" data-product='${JSON.stringify(item)}'>Добавить в корзину</button>
                `;

                const addToCartButton = card.querySelector('.add-to-cart');
                addToCartButton.addEventListener('click', () => {
                    addToCart(item);
                });

                resultsContainer.appendChild(card);
            });
        } else {
            resultsContainer.innerHTML = '<p class="no-results">Нет товаров, соответствующих вашему запросу.</p>';
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        alert("Ошибка при выполнении запроса");
    }
});

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Товар добавлен в корзину');
}
