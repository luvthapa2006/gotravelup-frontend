document.addEventListener('DOMContentLoaded', () => {
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
    const refreshPaymentsBtn = document.getElementById('refreshPaymentsBtn');

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
    }
    
    async function loadTrips() {
        try {
            const response = await fetch(`${API_BASE}/api/trips`);
            const trips = await response.json();
            tripsContainer.innerHTML = '';
            trips.forEach(trip => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><img src="${API_BASE}${trip.image}" alt="${trip.destination}" width="100" class="img-thumbnail"></td>
                    <td>${trip.destination}</td>
                    <td>${new Date(trip.date).toLocaleDateString()}</td>
                    <td>₹${trip.salePrice}</td>
                    <td>${trip.currentBookings} / ${trip.maxParticipants}</td>
                    <td>
                        <button class="btn btn-sm btn-info view-bookings-btn" data-id="${trip._id}" data-name="${trip.destination}">View Bookings</button>
                        <button class="btn btn-sm btn-danger delete-trip-btn" data-id="${trip._id}">Delete</button>
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
                        <td>₹${user.wallet}</td>
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
                        <td><button class="btn btn-sm btn-primary approve-refund-btn" data-id="${refund._id}">Approve Refund</button></td>
                    `;
                    refundsContainer.appendChild(tr);
                });
            }
        } catch (error) {
            console.error('Error loading refunds:', error);
            refundsContainer.innerHTML = '<tr><td colspan="5" class="text-danger">Failed to load refunds.</td></tr>';
        }
    }

    // --- EVENT HANDLERS ---
    addTripForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(addTripForm);
        formData.append('password', adminPassword);

        try {
            const response = await fetch(`${API_BASE}/api/admin/trips`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if(data.success) {
                alert('Trip added successfully!');
                addTripForm.reset();
                loadTrips();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error adding trip:', error);
            alert('An error occurred. Please try again.');
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

    refreshPaymentsBtn.addEventListener('click', loadPendingTransactions);
    
    // Event delegation for all dynamically created buttons
    document.body.addEventListener('click', async (e) => {
        
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