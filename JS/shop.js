document.addEventListener('DOMContentLoaded', () => {
    const basketContent = document.querySelector('.basket-content');
    const emptyBasketMessage = document.getElementById('empty-basket-message');
    const clearCartButton = document.querySelector('.clear-cart-button');
    const totalCostElement = document.getElementById('total-cost');
    const orderForm = document.querySelector('.order-form');
    const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api';
    const apiKey = '791d58e1-3359-45f5-8ec4-7350cd00e872';

    function getCartItems() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    function displayCartProducts() {
        const cart = getCartItems();
        if (cart.length === 0) {
            emptyBasketMessage.style.display = 'block';
            return;
        }

        emptyBasketMessage.style.display = 'none';
        basketContent.innerHTML = '';

        cart.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-cardShop');

            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" class="product-image">
                <h3 class="product-name">${product.name}</h3><br>
                <p class="product-category">${product.main_category}</p><br>
                <p class="product-rating">Рейтинг: ${product.rating}</p><br>
                <p class="product-price">Цена: <strong>${product.actual_price} ₽</strong></p><br>
                ${product.discount_price ? `<p class="product-discount-price">Цена по скидке: <strong>${product.discount_price} ₽</strong></p><br>` : ''}
            `;

            basketContent.appendChild(productCard);
        });

        updateTotalCost(cart);
    }

    function clearCart() {
        localStorage.removeItem('cart');
        basketContent.innerHTML = '';
        emptyBasketMessage.style.display = 'block';
        updateTotalCost([]);
    }

    function updateTotalCost(cart) {
        const totalCost = cart.reduce((total, product) => total + (product.discount_price || product.actual_price), 0);
        totalCostElement.textContent = `Итоговая стоимость: ${totalCost} ₽`;
    }

    function formatDateToServer(date) {
        const [year, month, day] = date.split('-');
        return `${day}.${month}.${year}`;
    }

    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const fullName = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();
        const deliveryDate = document.getElementById("delivery-date").value.trim();
        const deliveryInterval = document.getElementById("delivery-time").value.trim();
        const comment = document.getElementById("comments").value.trim();
        const cart = getCartItems();

        const formattedDate = formatDateToServer(deliveryDate);

        const orderData = {
            full_name: fullName,
            email: email,
            phone: phone,
            subscribe: document.getElementById("newsletter").checked,
            delivery_address: address,
            delivery_date: formattedDate,
            delivery_interval: deliveryInterval,
            comment: comment,
            good_ids: cart.map(item => item.id)
        }; 

        await createOrder(orderData);
    });

    async function createOrder(orderData) {
        console.log(orderData);
        const url = `${apiUrl}/orders?api_key=${apiKey}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                window.showNotification("Заказ успешно оформлен!");
                localStorage.removeItem("cart");
                displayCartProducts();
            } else {
                const errorText = await response.text();
                console.error("Ошибка при оформлении заказа:", response.status, errorText);
                window.showNotification(`Ошибка при оформлении заказа: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка сети или сервера:", error);
            window.showNotification("Ошибка при отправке запроса. Проверьте соединение.");
        }
    }

    clearCartButton.addEventListener('click', clearCart);

    displayCartProducts();
});
