document.addEventListener('DOMContentLoaded', () => {
const transportRoutesContainer = document.getElementById('transportRoutesContainer');
const addTransportForm = document.getElementById('addTransportForm');

// Add this function to load routes
// In js/admin.js

// In js/admin.js, replace the existing loadTransportRoutes function
async function loadTransportRoutes() {
    try {
        const response = await fetch(`${API_BASE}/api/admin/transport`, {
            headers: getAuthHeaders(true)
        });
        const data = await response.json();
        
        if (data.success) {
            const routes = data.routes;
            transportRoutesContainer.innerHTML = '';
            routes.forEach(route => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${route.routeName}</td>
                    <td>${route.type}</td>
                    <td>${route.departureTime}</td>
                    <td>₹${route.price}</td>
                    <td><span class="badge bg-${route.status === 'active' ? 'success' : 'warning'}">${route.status.replace('_', ' ')}</span></td>
                    <td>
                        <button class="btn btn-sm btn-warning edit-transport-btn" data-id="${route._id}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-transport-btn" data-id="${route._id}">Delete</button>
                        <div class="form-check form-switch d-inline-block ms-2 align-middle">
                            <input class="form-check-input transport-status-toggle" type="checkbox" role="switch" data-id="${route._id}" ${route.status === 'active' ? 'checked' : ''}>
                        </div>
                    </td>
                `;
                transportRoutesContainer.appendChild(tr);
            });
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error loading transport routes:', error);
        transportRoutesContainer.innerHTML = '<tr><td colspan="6" class="text-danger">Failed to load transport routes.</td></tr>';
    }
}
document.getElementById('editTransportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const transportId = document.getElementById('editTransportId').value;
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data.password = adminPassword;

    try {
        const response = await fetch(`${API_BASE}/api/admin/transport/${transportId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            alert('Route updated successfully!');
            bootstrap.Modal.getInstance(document.getElementById('editTransportModal')).hide();
            loadTransportRoutes();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        alert('An error occurred.');
    }
});

// Add this event listener for the new form
addTransportForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(addTransportForm);
    const data = Object.fromEntries(formData.entries());
    data.status = data.status ? 'active' : 'coming_soon';
    data.password = adminPassword;

    try {
        const response = await fetch(`${API_BASE}/api/admin/transport`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            alert('Route added!');
            addTransportForm.reset();
            loadTransportRoutes();
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        alert('An error occurred.');
    } 
}); 
 
const paymentDetailsContainer = document.getElementById('paymentDetailsContainer');
const addDetailBtn = document.getElementById('addDetailBtn');
const paymentTotalEl = document.getElementById('paymentTotal');

// Function to add a new row of inputs for a payment item
function addPaymentDetailRow() {
    const row = document.createElement('div');
    row.className = 'row g-2 mb-2 align-items-center payment-detail-row';
    row.innerHTML = `
        <div class="col">
            <input type="text" class="form-control payment-description" placeholder="Item Description (e.g., Transport)">
        </div>
        <div class="col-md-3">
            <input type="number" class="form-control payment-price" placeholder="Price" min="0">
        </div>
        <div class="col-auto">
            <button type="button" class="btn btn-danger btn-sm remove-detail-btn">&times;</button>
        </div>
    `;
    paymentDetailsContainer.appendChild(row);
}

// Function to update the total price automatically
function updatePaymentTotal() {
    let total = 0;
    document.querySelectorAll('.payment-price').forEach(input => {
        const price = parseFloat(input.value) || 0;
        total += price;
    });
    paymentTotalEl.textContent = `Total: ₹${total}`;
}

// Event listeners for the dynamic form
if (addDetailBtn) {
    addDetailBtn.addEventListener('click', addPaymentDetailRow);

    paymentDetailsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-detail-btn')) {
            e.target.closest('.payment-detail-row').remove();
            updatePaymentTotal();
        }
    });

    paymentDetailsContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('payment-price')) {
            updatePaymentTotal();
        }
    });
}
// --- Site Settings Logic ---
const backgroundForm = document.getElementById('backgroundForm');
const backgroundPreview = document.getElementById('backgroundPreview');

// Function to load and display the current background
async function loadCurrentBackground() {
    try {
        const response = await fetch(`${API_BASE}/api/settings/background`);
        const settings = await response.json();
        
        if (settings.backgroundType === 'video') {
            backgroundPreview.innerHTML = `<video src="${settings.backgroundUrl}" muted playsinline loop autoplay style="width: 100%;"></video>`;
        } else {
            backgroundPreview.innerHTML = `<img src="${settings.backgroundUrl}" style="width: 100%;">`;
        }
    } catch (error) {
        backgroundPreview.innerHTML = '<p class="text-danger">Could not load preview.</p>';
    }
}

// Add event listener for the form submission
if (backgroundForm) {
    backgroundForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = backgroundForm.querySelector('button[type="submit"]');
        const spinner = button.querySelector('.spinner-border');
        const buttonText = button.querySelector('.button-text');
        const originalButtonText = buttonText.textContent;
        
        // Show loading state
        button.disabled = true;
        spinner.classList.remove('d-none');
        buttonText.textContent = 'Uploading...';

        try {
            const formData = new FormData(backgroundForm);
            formData.append('password', adminPassword);

            const response = await fetch(`${API_BASE}/api/admin/settings/background`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                alert('Background updated successfully!');
                loadCurrentBackground(); // Refresh the preview
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        } finally {
            // Hide loading state
            button.disabled = false;
            spinner.classList.add('d-none');
            buttonText.textContent = originalButtonText;
        }
    });

    // Also load the preview when the page loads
    loadCurrentBackground();
}
    const API_BASE = "https://gotravelup-backend.onrender.com";
    let adminPassword = '';

    const adminContent = document.getElementById('admin-content');
    
    // Containers
    const tripsContainer = document.getElementById('tripsContainer');
    const usersContainer = document.getElementById('usersContainer');
    const transactionsContainer = document.getElementById('transactionsContainer');
    const bookingsModalContainer = document.getElementById('bookingsModalContainer');
    const refundsContainer = document.getElementById('refundsContainer');

    // Forms & Buttons
    const addTripForm = document.getElementById('addTripForm');
    const downloadUsersBtn = document.getElementById('downloadUsersBtn');
    const refreshAllBtn = document.getElementById('refreshAllBtn');

    // Initial password prompt
    async function askForPassword() {
        adminPassword = prompt("Please enter the admin password:");

        if (!adminPassword) {
            alert("Password is required to access this page.");
            document.body.innerHTML = '<div class="alert alert-danger text-center m-5">Access Denied.</div>';
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/admin/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: adminPassword })
            });

            if (response.ok) {
                adminContent.classList.remove('d-none');
                loadAllData();
            } else {
                alert("Incorrect password. Access has been denied.");
                document.body.innerHTML = ''; 
            }
        } catch (error) {
            console.error('Error during password verification:', error);
            alert('Could not connect to the server. Please try again later.');
            document.body.innerHTML = '<div class="alert alert-danger text-center m-5">Server Connection Error.</div>';
        }
    }

    function getAuthHeaders(isGetRequest = false) {
        const headers = new Headers();
        if (isGetRequest) {
            headers.append('admin-password', adminPassword);
        }
        return headers;
    }

    function getAuthBody() {
        return { password: adminPassword };
    }

    // --- DATA LOADING FUNCTIONS ---
    async function loadAllData() {
        loadTrips();
        loadUsers();
        loadPendingTransactions();
        loadRefundRequests();
        loadCurrentBackground();
        loadTransportRoutes();
    }

     async function refreshAllData() {
        const originalText = refreshAllBtn.innerHTML;
        refreshAllBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Refreshing...';
        refreshAllBtn.disabled = true;

        try {
            // Promise.all runs all data-loading functions at the same time for a faster refresh
            await Promise.all([
                loadTrips(),
                loadUsers(),
                loadPendingTransactions(),
                loadRefundRequests()
            ]);
        } catch (error) {
            console.error("Failed to refresh all data:", error);
            alert("An error occurred while refreshing data.");
        } finally {
            // Restore the button to its original state
            refreshAllBtn.innerHTML = originalText;
            refreshAllBtn.disabled = false;
        }
    }

    
    async function loadTrips() {
        try {
            const response = await fetch(`${API_BASE}/api/trips`);
            const trips = await response.json();
            tripsContainer.innerHTML = '';
            trips.forEach(trip => {
                const tr = document.createElement('tr');
// Inside the loadTrips function in admin.js
tr.innerHTML = `
    <td><img src="${trip.image}" alt="${trip.destination}" width="100" class="img-thumbnail"></td>
    <td>${trip.destination}</td>
    <td><span class="badge bg-${trip.status === 'active' ? 'success' : 'warning'}">${trip.status.replace('_', ' ')}</span></td>
    <td>₹${trip.salePrice}</td>
    <td>${trip.currentBookings} / ${trip.maxParticipants}</td>
    <td>
        <button class="btn btn-sm btn-info view-bookings-btn" data-id="${trip._id}" data-name="${trip.destination}">View</button>
        <button class="btn btn-sm btn-warning edit-trip-btn" data-id="${trip._id}">Edit</button>
        <button class="btn btn-sm btn-danger delete-trip-btn" data-id="${trip._id}">Delete</button>
        <div class="form-check form-switch d-inline-block ms-2 align-middle">
            <input class="form-check-input trip-status-toggle" type="checkbox" role="switch" data-id="${trip._id}" ${trip.status === 'active' ? 'checked' : ''}>
        </div>
    </td>
`;
                tripsContainer.appendChild(tr);
            });
        } catch (error) {
            console.error('Error loading trips:', error);
            tripsContainer.innerHTML = '<tr><td colspan="6" class="text-danger">Failed to load trips.</td></tr>';
        }
    }

    async function loadUsers() {
        try {
            const response = await fetch(`${API_BASE}/api/admin/users`, {
                headers: getAuthHeaders(true)
            });
            const data = await response.json();
            if(data.success) {
                usersContainer.innerHTML = '';
                data.users.forEach(user => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${user.name}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.sapId}</td>
                        <td>${user.gender || 'N/A'}</td><td>₹${user.wallet}</td>
                        <td>
                            <button class="btn btn-sm btn-danger delete-user-btn" data-id="${user._id}">Delete</button>
                        </td>
                    `;
                    usersContainer.appendChild(tr);
                });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            usersContainer.innerHTML = '<tr><td colspan="6" class="text-danger">Failed to load users.</td></tr>';
        }
    }

    async function loadPendingTransactions() {
        try {
            const response = await fetch(`${API_BASE}/api/admin/pending-transactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(getAuthBody())
            });
            const data = await response.json();
             if(data.success) {
                transactionsContainer.innerHTML = '';
                if(data.transactions.length === 0) {
                     transactionsContainer.innerHTML = '<tr><td colspan="5" class="text-center">No pending transactions.</td></tr>';
                     return;
                }
                data.transactions.forEach(tx => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${tx.userId?.name || 'N/A'} (${tx.userId?.username || 'N/A'})</td>
                        <td>${tx.amount}</td>
                        <td><span class="badge bg-${tx.method === 'QR' ? 'info' : 'warning'}">${tx.method}</span></td>
                        <td>${new Date(tx.createdAt).toLocaleString()}</td>
                        <td>
                            <button class="btn btn-sm btn-success approve-btn" data-id="${tx._id}">Approve</button>
                            <button class="btn btn-sm btn-danger deny-btn ms-1" data-id="${tx._id}">Deny</button>
                        </td>
                    `;
                    transactionsContainer.appendChild(tr);
                });
            } else {
                 throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            transactionsContainer.innerHTML = '<tr><td colspan="5" class="text-danger">Failed to load transactions.</td></tr>';
        }
    }

    async function loadRefundRequests() {
        try {
            const response = await fetch(`${API_BASE}/api/admin/refunds`, {
                headers: getAuthHeaders(true)
            });
            const data = await response.json();
            refundsContainer.innerHTML = '';
            if(data.success) {
                if(data.refunds.length === 0) {
                    refundsContainer.innerHTML = '<tr><td colspan="5" class="text-center">No pending refund requests.</td></tr>';
                    return;
                }
                data.refunds.forEach(refund => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
    <td>${refund.userId.name}</td>
    <td>${refund.tripDestination}</td>
    <td>${refund.amount}</td>
    <td>${new Date(refund.requestedAt).toLocaleString()}</td>
    <td>
        <button class="btn btn-sm btn-primary approve-refund-btn" data-id="${refund._id}">Approve Refund</button>
        <button class="btn btn-sm btn-secondary deny-refund-btn ms-1" data-id="${refund._id}">Deny</button>
    </td>
`;
                    refundsContainer.appendChild(tr);
                });
            }
        } catch (error) {
            console.error('Error loading refunds:', error);
            refundsContainer.innerHTML = '<tr><td colspan="5" class="text-danger">Failed to load refunds.</td></tr>';
        }
    }
// Inside the DOMContentLoaded listener in admin.js
const editTripForm = document.getElementById('editTripForm');
editTripForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tripId = document.getElementById('editTripId').value;
    const formData = new FormData(editTripForm);
    const data = Object.fromEntries(formData.entries());
    data.password = adminPassword; // Add admin password for auth

    try {
        const response = await fetch(`${API_BASE}/api/admin/trips/${tripId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            alert('Trip updated successfully!');
            bootstrap.Modal.getInstance(document.getElementById('editTripModal')).hide();
            loadTrips(); // Refresh the trips list
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        alert('An error occurred. Please try again.');
    }
});
    // --- EVENT HANDLERS ---
addTripForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = addTripForm.querySelector('button[type="submit"]');
    const spinner = button.querySelector('.spinner-border');
    const buttonText = button.querySelector('.button-text');
    const originalButtonText = buttonText.textContent;

    // Show loading state
    button.disabled = true;
    spinner.classList.remove('d-none');
    buttonText.textContent = 'Adding Trip...';

    try {
        const formData = new FormData(addTripForm);
        formData.append('password', adminPassword);
        const statusCheckbox = document.getElementById('addTripStatus');
if (!statusCheckbox.checked) {
    formData.set('status', 'coming_soon');
}
                const detailsArray = [];
        document.querySelectorAll('.payment-detail-row').forEach(row => {
            const description = row.querySelector('.payment-description').value;
            const price = row.querySelector('.payment-price').value;
            if (description && price) {
                detailsArray.push({ description, price: parseFloat(price) });
            }
        });
        formData.append('paymentDetails', JSON.stringify(detailsArray));

        const response = await fetch(`${API_BASE}/api/admin/trips`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        if (data.success) {
            alert('Trip added successfully!');
            addTripForm.reset();
            loadTrips();
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error adding trip:', error);
        alert('An error occurred. Please try again.');
    } finally {
        // Hide loading state
        button.disabled = false;
        spinner.classList.add('d-none');
        buttonText.textContent = originalButtonText;
    }
});

    downloadUsersBtn.addEventListener('click', () => {
        const downloadUrl = `${API_BASE}/api/admin/users/download`;
        fetch(downloadUrl, { headers: getAuthHeaders(true) })
            .then(res => res.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = 'uniscape_users.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            })
            .catch(() => alert('Could not download file.'));
    });

    if (refreshAllBtn) {
        refreshAllBtn.addEventListener('click', refreshAllData);
    }

    // Handle Trip Status Toggle
document.body.addEventListener('change', async (e) => {
    if (e.target.classList.contains('transport-status-toggle')) {
    const routeId = e.target.dataset.id;
    const newStatus = e.target.checked ? 'active' : 'coming_soon';

    try {
        const response = await fetch(`${API_BASE}/api/admin/transport/${routeId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, password: adminPassword })
        });
        const result = await response.json();
        if (result.success) {
            loadTransportRoutes(); // Refresh list to show updated status
        } else {
            alert(`Error: ${result.message}`);
            e.target.checked = !e.target.checked;
        }
    } catch (error) {
        alert('An error occurred.');
        e.target.checked = !e.target.checked;
    }
}
    if (e.target.classList.contains('trip-status-toggle')) {
        const tripId = e.target.dataset.id;
        const newStatus = e.target.checked ? 'active' : 'coming_soon';

        try {
            const response = await fetch(`${API_BASE}/api/admin/trips/${tripId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus, password: adminPassword })
            });
            const result = await response.json();
            if (result.success) {
                // Refresh just the trips list for a quick update
                loadTrips();
            } else {
                alert(`Error: ${result.message}`);
                e.target.checked = !e.target.checked; // Revert the switch on failure
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
            e.target.checked = !e.target.checked;
        }
    }
});
    // Event delegation for all dynamically created buttons
    document.body.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-transport-btn')) {
    const routeId = e.target.dataset.id;
    // We fetch ALL routes again to find the one to edit.
    // A more advanced solution would be a dedicated GET /api/admin/transport/:id route.
    const response = await fetch(`${API_BASE}/api/admin/transport`, { headers: getAuthHeaders(true) });
    const data = await response.json();
    if (data.success) {
        const routeToEdit = data.routes.find(r => r._id === routeId);
        if (routeToEdit) {
            // Populate the modal
            document.getElementById('editTransportId').value = routeToEdit._id;
            document.getElementById('editDestination').value = routeToEdit.destination;
            document.getElementById('editTransportType').value = routeToEdit.type;
            document.getElementById('editDepartureTime').value = routeToEdit.departureTime;
            document.getElementById('editTransportPrice').value = routeToEdit.price;
            document.getElementById('editTransportCapacity').value = routeToEdit.capacity;
            
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('editTransportModal'));
            modal.show();
        }
    }
}
        // Inside the click event listener in admin.js
// Edit Trip Button Click
if (e.target.classList.contains('edit-trip-btn')) {
    const tripId = e.target.dataset.id;
    try {
        // Find the trip data from the already loaded trips to populate the form
        const response = await fetch(`${API_BASE}/api/trips`);
        const trips = await response.json();
        const tripToEdit = trips.find(t => t._id === tripId);

        if (tripToEdit) {
            // Populate the modal form
            document.getElementById('editTripId').value = tripToEdit._id;
            document.getElementById('editDestination').value = tripToEdit.destination;
            document.getElementById('editCategory').value = tripToEdit.category;
            document.getElementById('editOriginalPrice').value = tripToEdit.originalPrice;
            document.getElementById('editSalePrice').value = tripToEdit.salePrice;
            document.getElementById('editMaxParticipants').value = tripToEdit.maxParticipants;
            // Format date correctly for date input field (YYYY-MM-DD)
            document.getElementById('editDate').value = new Date(tripToEdit.date).toISOString().split('T')[0];
            document.getElementById('editDescription').value = tripToEdit.description;
            document.getElementById('editTripPlan').value = tripToEdit.tripPlan || '';

            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('editTripModal'));
            modal.show();
        }
    } catch (error) {
        alert('Could not fetch trip details.');
    }
}
        if (e.target.classList.contains('deny-refund-btn')) {
    const refundId = e.target.dataset.id;
    if(!confirm('Are you sure you want to deny this refund? The user booking will be reactivated.')) return;

    try {
        const response = await fetch(`${API_BASE}/api/admin/refunds/${refundId}/deny`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(getAuthBody())
        });
        const data = await response.json();
        if(data.success) {
            alert('Refund denied!');
            loadRefundRequests();
        } else { alert(`Error: ${data.message}`); }
    } catch (error) { alert('An error occurred.'); }
}
        // Approve Payment Transaction
        if (e.target.classList.contains('approve-btn')) {
            const transactionId = e.target.dataset.id;
            try {
                const response = await fetch(`${API_BASE}/api/wallet/confirm-transaction/${transactionId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(getAuthBody())
                });
                const data = await response.json();
                if(data.success) {
                    alert('Payment approved!');
                    loadPendingTransactions();
                    loadUsers();
                } else { alert(`Error: ${data.message}`); }
            } catch (error) { alert('An error occurred.'); }
        }

        // Deny Payment Transaction
        if (e.target.classList.contains('deny-btn')) {
            const transactionId = e.target.dataset.id;
            if(!confirm('Deny and DELETE this pending transaction? This cannot be undone.')) return;

            try {
                const response = await fetch(`${API_BASE}/api/admin/transactions/${transactionId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(getAuthBody())
                });
                const data = await response.json();
                if(data.success) {
                    alert('Transaction denied and deleted!');
                    loadPendingTransactions();
                } else { alert(`Error: ${data.message}`); }
            } catch (error) { alert('An error occurred.'); }
        }

        // Approve Refund
        if (e.target.classList.contains('approve-refund-btn')) {
            const refundId = e.target.dataset.id;
            if(!confirm('Approve this refund? The amount will be added to the user\'s wallet.')) return;

            try {
                const response = await fetch(`${API_BASE}/api/admin/refunds/${refundId}/approve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(getAuthBody())
                });
                const data = await response.json();
                if(data.success) {
                    alert('Refund approved!');
                    loadRefundRequests();
                    loadUsers(); // Refresh user list for updated wallet balances
                } else { alert(`Error: ${data.message}`); }
            } catch (error) { alert('An error occurred.'); }
        }
        
        // Delete Trip
        if (e.target.classList.contains('delete-trip-btn')) {
            const tripId = e.target.dataset.id;
            if(!confirm('Are you sure you want to delete this trip? This cannot be undone.')) return;

            try {
                const response = await fetch(`${API_BASE}/api/admin/trips/${tripId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(getAuthBody())
                });
                const data = await response.json();
                if(data.success) {
                    alert('Trip deleted!');
                    loadTrips();
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                alert('An error occurred.');
            }
        }

        // Delete User
        if (e.target.classList.contains('delete-user-btn')) {
            const userId = e.target.dataset.id;
            if(!confirm('Are you sure you want to PERMANENTLY delete this user and all their data?')) return;
            
             try {
                const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(getAuthBody())
                });
                const data = await response.json();
                if(data.success) {
                    alert('User deleted!');
                    loadUsers();
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch (error) {
                alert('An error occurred.');
            }
        }
            if (e.target.classList.contains('delete-transport-btn')) {
        const routeId = e.target.dataset.id;
        if (!confirm('Are you sure you want to delete this transport route?')) return;

        try {
            const response = await fetch(`${API_BASE}/api/admin/transport/${routeId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(getAuthBody())
            });
            const result = await response.json();
            if (result.success) {
                alert('Transport route deleted!');
                loadTransportRoutes(); // Refresh the list
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            alert('An error occurred.');
        }
    }
        
        // View Bookings
        if (e.target.classList.contains('view-bookings-btn')) {
            const tripId = e.target.dataset.id;
            const tripName = e.target.dataset.name;
            document.getElementById('bookingsTripName').textContent = tripName;
            
            try {
                const response = await fetch(`${API_BASE}/api/admin/trips/${tripId}/bookings`, {
                    headers: getAuthHeaders(true)
                });
                const data = await response.json();
                bookingsModalContainer.innerHTML = '';
                if(data.success) {
                    if(data.bookings.length === 0) {
                        bookingsModalContainer.innerHTML = '<tr><td colspan="4" class="text-center">No one has booked this trip yet.</td></tr>';
                    } else {
                         data.bookings.forEach(booking => {
                            const user = booking.userId;
                            const tr = document.createElement('tr');
                            tr.innerHTML = `
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>${user.phone}</td>
                                <td>${user.sapId}</td>
                                <td>${new Date(booking.bookingDate).toLocaleString()}</td>
                            `;
                            bookingsModalContainer.appendChild(tr);
                        });
                    }
                    const modal = new bootstrap.Modal(document.getElementById('bookingsModal'));
                    modal.show();
                } else {
                    alert(`Error: ${data.message}`);
                }
            } catch(error) {
                 alert('An error occurred while fetching bookings.');
            }
        }
    });

    // Start the application
    askForPassword();
});