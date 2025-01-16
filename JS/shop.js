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


    async function createOrder(orderData) {
        try {
            const response = await fetch(`${apiUrl}/orders?api_key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            console.log('Order created:', data); // Log the created order for debugging
            return data;
        } catch (error) {
            console.error('Ошибка при создании заказа:', error);
        }
    }


    clearCartButton.addEventListener('click', clearCart);

    orderForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const orderData = {
            items: getCartItems().map(item => ({
                name: item.name,
                quantity: 1 
            })),
            totalCost: parseFloat(totalCostElement.textContent.split(': ')[1].replace(' ₽', '')),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            deliveryDate: formData.get('delivery-date'),
            deliveryTime: formData.get('delivery-time'),
            comments: formData.get('comments')
        };

        const order = await createOrder(orderData);
        if (order) {
            alert('Заказ успешно оформлен!');
            clearCart();
        }
    });

    displayCartProducts();
});
