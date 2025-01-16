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

    async function fetchOrders() {
        try {
            const response = await fetch(`${apiUrl}/orders?api_key=${apiKey}`);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            console.log('Fetched orders:', data); 
            orders = data;
            displayOrders();
        } catch (error) {
            console.error('Ошибка при получении заказов:', error);
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

    function displayOrders() {
        ordersTbody.innerHTML = '';
        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${order.date}</td>
                <td>${order.items.map(item => item.name).join(', ')}</td>
                <td>${order.totalCost} ₽</td>
                <td>${order.deliveryDate} ${order.deliveryTime}</td>
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
            viewModalContent.innerHTML = `
                <strong>Дата оформления:</strong> ${order.date}<br>
                <strong>Имя:</strong> ${order.name}<br>
                <strong>Номер телефона:</strong> ${order.phone}<br>
                <strong>Email:</strong> ${order.email}<br>
                <strong>Адрес доставки:</strong> ${order.address}<br>
                <strong>Дата доставки:</strong> ${order.deliveryDate}<br>
                <strong>Время доставки:</strong> ${order.deliveryTime}<br>
                <strong>Состав заказа:</strong> ${order.items.map(item => item.name).join(', ')}<br>
                <strong>Стоимость:</strong> ${order.totalCost} ₽<br>
                <strong>Комментарий:</strong> ${order.comments}
            `;
            openModal(viewModal);
        } else if (event.target.closest('.edit-button')) {
            const orderId = event.target.closest('.edit-button').getAttribute('data-order');
            const order = await fetchOrder(orderId);
            editForm.editName.value = order.name;
            editForm.editEmail.value = order.email;
            editForm.editPhone.value = order.phone;
            editForm.editAddress.value = order.address;
            editForm.editDeliveryDate.value = order.deliveryDate;
            editForm.editDeliveryTime.value = order.deliveryTime;
            editForm.editComments.value = order.comments;
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
            name: editForm.editName.value,
            email: editForm.editEmail.value,
            phone: editForm.editPhone.value,
            address: editForm.editAddress.value,
            deliveryDate: editForm.editDeliveryDate.value,
            deliveryTime: editForm.editDeliveryTime.value,
            comments: editForm.editComments.value
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
