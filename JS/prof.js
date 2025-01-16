document.addEventListener('DOMContentLoaded', () => {
    const ordersTbody = document.getElementById('orders-tbody');
    const viewModal = document.getElementById('viewModal');
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const viewModalContent = document.getElementById('viewModalContent');
    const editForm = document.getElementById('editForm');
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDelete = document.getElementById('cancelDelete');
    const saveEdit = document.getElementById('saveEdit');
    const cancelEdit = document.getElementById('cancelEdit');
    const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api';
    const apiKey = '791d58e1-3359-45f5-8ec4-7350cd00e872';

    let orders = [];
    let goods = [];

    async function fetchOrders() {
        try {
            const response = await fetch(`${apiUrl}/orders?api_key=${apiKey}`);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            orders = data;
            await fetchGoods();
            displayOrders();
        } catch (error) {
            console.error('Ошибка при получении заказов:', error);
        }
    }

    async function fetchGoods() {
        try {
            const response = await fetch(`${apiUrl}/goods?api_key=${apiKey}`);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            goods = data;
        } catch (error) {
            console.error('Ошибка при получении товаров:', error);
        }
    }

    async function fetchOrder(orderId) {
        try {
            const response = await fetch(`${apiUrl}/orders/${orderId}?api_key=${apiKey}`);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при получении заказа:', error);
        }
    }

    function getGoodNames(goodIds) {
        return goodIds.map(id => {
            const good = goods.find(g => g.id === id);
            return good ? good.name : `Товар ${id}`;
        }).join(', ');
    }

    function calculateTotalCost(goodIds) {
        return goodIds.reduce((total, id) => {
            const good = goods.find(g => g.id === id);
            return total + (good ? good.discount_price || good.actual_price : 0);
        }, 0);
    }

    function displayOrders() {
        ordersTbody.innerHTML = '';
        orders.forEach((order, index) => {
            const goodNames = getGoodNames(order.good_ids);
            const totalCost = calculateTotalCost(order.good_ids);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${order.created_at}</td>
                <td>${goodNames}</td>
                <td>${totalCost} ₽</td>
                <td>${order.delivery_date} ${order.delivery_interval}</td>
                <td class="actions">
                    <button class="view-button" data-order="${order.id}"><img src="/Images/view.png" alt="Просмотр"></button>
                    <button class="edit-button" data-order="${order.id}"><img src="/Images/edit.png" alt="Редактирование"></button>
                    <button class="delete-button" data-order="${order.id}"><img src="/Images/delete.png" alt="Удаление"></button>
                </td>
            `;
            ordersTbody.appendChild(row);
        });
    }

    function openModal(modal) {
        modal.style.display = 'block';
    }

    function closeModal(modal) {
        modal.style.display = 'none';
    }

    async function updateOrder(orderId, orderData) {
        try {
            const response = await fetch(`${apiUrl}/orders/${orderId}?api_key=${apiKey}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при обновлении заказа:', error);
        }
    }

    async function deleteOrder(orderId) {
        try {
            const response = await fetch(`${apiUrl}/orders/${orderId}?api_key=${apiKey}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Ошибка при удалении заказа:', error);
        }
    }

    ordersTbody.addEventListener('click', async (event) => {
        if (event.target.closest('.view-button')) {
            const orderId = event.target.closest('.view-button').getAttribute('data-order');
            const order = await fetchOrder(orderId);
            const goodNames = getGoodNames(order.good_ids);
            const totalCost = calculateTotalCost(order.good_ids);
            viewModalContent.innerHTML = `
                <strong>Дата оформления:</strong> ${order.created_at}<br>
                <strong>Имя:</strong> ${order.full_name}<br>
                <strong>Номер телефона:</strong> ${order.phone}<br>
                <strong>Email:</strong> ${order.email}<br>
                <strong>Адрес доставки:</strong> ${order.delivery_address}<br>
                <strong>Дата доставки:</strong> ${order.delivery_date}<br>
                <strong>Время доставки:</strong> ${order.delivery_interval}<br>
                <strong>Состав заказа:</strong> ${goodNames}<br>
                <strong>Стоимость:</strong> ${totalCost} ₽<br>
                <strong>Комментарий:</strong> ${order.comment}
            `;
            openModal(viewModal);
        } else if (event.target.closest('.edit-button')) {
            const orderId = event.target.closest('.edit-button').getAttribute('data-order');
            const order = await fetchOrder(orderId);
            editForm.editName.value = order.full_name;
            editForm.editEmail.value = order.email;
            editForm.editPhone.value = order.phone;
            editForm.editAddress.value = order.delivery_address;
            editForm.editDeliveryDate.value = order.delivery_date;
            editForm.editDeliveryTime.value = order.delivery_interval;
            editForm.editComments.value = order.comment;
            editModal.setAttribute('data-order', orderId);
            openModal(editModal);
        } else if (event.target.closest('.delete-button')) {
            const orderId = event.target.closest('.delete-button').getAttribute('data-order');
            deleteModal.setAttribute('data-order', orderId);
            openModal(deleteModal);
        }
    });

    saveEdit.addEventListener('click', async () => {
        const orderId = editModal.getAttribute('data-order');
        const orderData = {
            full_name: editForm.editName.value,
            email: editForm.editEmail.value,
            phone: editForm.editPhone.value,
            delivery_address: editForm.editAddress.value,
            delivery_date: editForm.editDeliveryDate.value,
            delivery_interval: editForm.editDeliveryTime.value,
            comment: editForm.editComments.value
        };
        const updatedOrder = await updateOrder(orderId, orderData);
        if (updatedOrder) {
            fetchOrders();
            closeModal(editModal);
        }
    });

    cancelEdit.addEventListener('click', () => {
        closeModal(editModal);
    });

    confirmDelete.addEventListener('click', async () => {
        const orderId = deleteModal.getAttribute('data-order');
        const deletedOrder = await deleteOrder(orderId);
        if (deletedOrder) {
            fetchOrders();
            closeModal(deleteModal);
        }
    });

    cancelDelete.addEventListener('click', () => {
        closeModal(deleteModal);
    });

    document.querySelectorAll('.close').forEach(closeButton => {
        closeButton.addEventListener('click', () => {
            closeModal(closeButton.closest('.modal'));
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target == viewModal) {
            closeModal(viewModal);
        } else if (event.target == editModal) {
            closeModal(editModal);
        } else if (event.target == deleteModal) {
            closeModal(deleteModal);
        }
    });

    fetchOrders();
});