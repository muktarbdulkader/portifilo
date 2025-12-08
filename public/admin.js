// public/admin.js - Corrected Version
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const loginSection = document.getElementById('loginSection');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const messagesTableBody = document.getElementById('messagesTableBody');

    // Stats elements
    const totalMessagesEl = document.getElementById('totalMessages');
    const unreadMessagesEl = document.getElementById('unreadMessages');
    const repliedMessagesEl = document.getElementById('repliedMessages');
    const archivedMessagesEl = document.getElementById('archivedMessages');

    // Pagination elements
    let currentPage = 1;
    let totalPages = 1;
    let currentFilter = 'all'; // Added filter tracking

    // Configuration
    const API_BASE_URL = window.location.origin;
    let authToken = localStorage.getItem('adminToken');

    // Check if already logged in
    if (authToken) {
        verifyToken();
    } else {
        showLogin();
    }

    // Login Form Handler
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success && data.token) {
                authToken = data.token;
                localStorage.setItem('adminToken', data.token);
                showDashboard();
                loadMessages();
                loadStats();
                showNotification('Login successful!', 'success');
            } else {
                showNotification(data.message || 'Invalid credentials!', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Login failed. Please try again.', 'error');
        }
    });

    // Logout Handler
    logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('adminToken');
        authToken = null;
        showLogin();
        showNotification('Logged out successfully!', 'success');
    });

    // Verify token validity
    async function verifyToken() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/verify`, {
                headers: {
                    'x-admin-token': authToken
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    showDashboard();
                    loadMessages();
                    loadStats();
                } else {
                    throw new Error('Invalid token');
                }
            } else {
                throw new Error('Invalid token');
            }
        } catch (error) {
            localStorage.removeItem('adminToken');
            authToken = null;
            showLogin();
            showNotification('Session expired. Please login again.', 'error');
        }
    }

    // Show/Hide Functions
    function showLogin() {
        loginSection.style.display = 'flex';
        dashboard.style.display = 'none';
        // Clear form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    function showDashboard() {
        loginSection.style.display = 'none';
        dashboard.style.display = 'block';
    }

    // Load Statistics
    async function loadStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
                headers: {
                    'x-admin-token': authToken
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    updateStats(data.stats);
                }
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    // Update Statistics Display
    function updateStats(stats) {
        totalMessagesEl.textContent = stats.totalMessages || 0;
        unreadMessagesEl.textContent = stats.newMessages || 0;
        repliedMessagesEl.textContent = stats.repliedMessages || 0;
        archivedMessagesEl.textContent = stats.archivedMessages || 0;
    }

    // Load Messages from API
    async function loadMessages(page = 1) {
        try {
            if (!authToken) {
                showLogin();
                return;
            }

            currentPage = page;

            // Show loading state
            messagesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-2">Loading messages...</p>
                    </td>
                </tr>
            `;

            // Build URL with filter
            let url = `${API_BASE_URL}/api/admin/messages?page=${page}&limit=50`;
            if (currentFilter !== 'all') {
                url += `&status=${currentFilter}`;
            }

            const response = await fetch(url, {
                headers: {
                    'x-admin-token': authToken
                }
            });

            if (response.status === 401) {
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                renderMessages(data.data);
                updatePagination(data.pagination);
            } else {
                throw new Error(data.message || 'Failed to load messages');
            }

        } catch (error) {
            console.error('Error loading messages:', error);
            if (error.message === 'Unauthorized') {
                localStorage.removeItem('adminToken');
                showLogin();
                showNotification('Session expired. Please login again.', 'error');
                return;
            }

            messagesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-danger">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p class="mt-2">Failed to load messages. Please try again.</p>
                        <button class="btn btn-sm btn-primary mt-2" onclick="loadMessages(${currentPage})">
                            <i class="fas fa-redo"></i> Retry
                        </button>
                    </td>
                </tr>
            `;
        }
    }

    // Update Pagination
    function updatePagination(pagination) {
        // Remove existing pagination
        const existingPagination = document.getElementById('pagination');
        if (existingPagination) {
            existingPagination.remove();
        }

        if (!pagination || pagination.pages <= 1) return;

        totalPages = pagination.pages;

        const paginationContainer = document.createElement('div');
        paginationContainer.id = 'pagination';
        paginationContainer.className = 'd-flex justify-content-center mt-4';

        let paginationHTML = `
            <nav aria-label="Page navigation">
                <ul class="pagination">
        `;

        // Previous button
        paginationHTML += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadMessages(${currentPage - 1}); return false;">Previous</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= pagination.pages; i++) {
            if (i === 1 || i === pagination.pages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="loadMessages(${i}); return false;">${i}</a>
                    </li>
                `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${currentPage === pagination.pages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadMessages(${currentPage + 1}); return false;">Next</a>
            </li>
        `;

        paginationHTML += `
                </ul>
            </nav>
        `;

        paginationContainer.innerHTML = paginationHTML;

        // Append to table container
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            tableContainer.appendChild(paginationContainer);
        }
    }

    // Render Messages in Table
    function renderMessages(messages) {
        if (!messages || messages.length === 0) {
            const noDataMessage = currentFilter === 'all'
                ? 'No messages yet. All messages will appear here.'
                : `No ${currentFilter} messages found.`;

            messagesTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        <i class="fas fa-inbox fa-2x text-muted mb-2"></i>
                        <p>${noDataMessage}</p>
                    </td>
                </tr>
            `;
            return;
        }

        const rows = messages.map(msg => {
            // Format date
            const date = msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : 'N/A';
            const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            // Truncate long messages and subject
            const truncatedMessage = msg.message && msg.message.length > 100 ?
                msg.message.substring(0, 100) + '...' : msg.message || '';
            const truncatedSubject = msg.subject && msg.subject.length > 50 ?
                msg.subject.substring(0, 50) + '...' : msg.subject || 'No subject';

            // Determine status badge
            const status = msg.status || 'new';
            const statusBadge = getStatusBadge(status);

            return `
                <tr data-id="${msg._id}">
                    <td><strong>${escapeHtml(msg.name)}</strong></td>
                    <td><a href="mailto:${escapeHtml(msg.email)}">${escapeHtml(msg.email)}</a></td>
                    <td title="${escapeHtml(msg.subject || '')}">${escapeHtml(truncatedSubject)}</td>
                    <td title="${escapeHtml(msg.message)}">${escapeHtml(truncatedMessage)}</td>
                    <td><small>${date}<br>${time}</small></td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="viewMessage('${msg._id}')" 
                                    title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-success" onclick="replyToMessage('${msg._id}', '${escapeHtml(msg.email)}', '${escapeHtml(msg.name)}')" 
                                    title="Reply">
                                <i class="fas fa-reply"></i>
                            </button>
                            <button class="btn btn-outline-warning" onclick="markAsReplied('${msg._id}')" 
                                    title="Mark as replied">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-outline-info" onclick="archiveMessage('${msg._id}')" 
                                    title="Archive">
                                <i class="fas fa-archive"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteMessage('${msg._id}')" 
                                    title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        messagesTableBody.innerHTML = rows;
    }

    // Helper Functions
    function getStatusBadge(status) {
        const statusMap = {
            'new': '<span class="badge badge-new">New</span>',
            'read': '<span class="badge badge-read">Read</span>',
            'replied': '<span class="badge badge-replied">Replied</span>',
            'sent': '<span class="badge badge-replied">Sent</span>',
            'archived': '<span class="badge badge-archived">Archived</span>',
            'failed': '<span class="badge badge-danger">Failed</span>'
        };

        return statusMap[status] || '<span class="badge badge-secondary">' + status + '</span>';
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const alertClass = type === 'error' ? 'danger' :
            type === 'success' ? 'success' :
                type === 'warning' ? 'warning' : 'info';

        const notification = document.createElement('div');
        notification.className = `notification alert alert-${alertClass} alert-dismissible fade show`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 500px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                <div>${message}</div>
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Action Functions (exposed globally)
    window.viewMessage = async function (id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/messages/${id}`, {
                headers: {
                    'x-admin-token': authToken
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    showMessageModal(data.data);
                } else {
                    throw new Error(data.message);
                }
            } else {
                throw new Error('Failed to load message');
            }
        } catch (error) {
            console.error('Error viewing message:', error);
            showNotification('Error loading message details: ' + error.message, 'error');
        }
    };

    window.replyToMessage = function (id, email, name) {
        const modal = document.createElement('div');
        modal.className = 'modal fade show d-block';
        modal.style.cssText = 'background-color: rgba(0,0,0,0.5);';
        modal.setAttribute('tabindex', '-1');

        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Reply to ${escapeHtml(name)}</h5>
                        <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                    </div>
                    <div class="modal-body">
                        <form id="replyForm">
                            <div class="mb-3">
                                <label class="form-label">To:</label>
                                <input type="email" class="form-control" value="${email}" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Subject:</label>
                                <input type="text" class="form-control" id="replySubject" 
                                       value="Re: Your message" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Message:</label>
                                <textarea class="form-control" id="replyMessage" rows="8" 
                                          placeholder="Type your reply here..." required></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" 
                                onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="sendReply('${id}')">
                            <i class="fas fa-paper-plane me-1"></i> Send Reply
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Focus on message field
        setTimeout(() => {
            const textarea = modal.querySelector('#replyMessage');
            if (textarea) {
                textarea.focus();
                textarea.value = `Hi ${name},\n\nThank you for your message. `;
            }
        }, 100);
    };

    window.sendReply = async function (id) {
        const modal = document.querySelector('.modal');
        const subject = modal.querySelector('#replySubject').value;
        const message = modal.querySelector('#replyMessage').value;
        const to = modal.querySelector('input[type="email"]').value;

        if (!subject || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-token': authToken
                },
                body: JSON.stringify({
                    to: to,
                    subject: subject,
                    message: message
                })
            });

            const data = await response.json();

            if (data.success) {
                modal.remove();
                showNotification('Reply sent successfully!', 'success');

                // Mark as replied
                await markAsReplied(id);
            } else {
                throw new Error(data.message || 'Failed to send reply');
            }

        } catch (error) {
            console.error('Error sending reply:', error);
            showNotification('Failed to send reply: ' + error.message, 'error');
        }
    };

    window.markAsReplied = async function (id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/messages/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-token': authToken
                },
                body: JSON.stringify({
                    status: 'replied'
                })
            });

            const data = await response.json();

            if (data.success) {
                showNotification('Message marked as replied', 'success');
                loadMessages(currentPage);
                loadStats();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error marking as replied:', error);
            showNotification('Failed to update status: ' + error.message, 'error');
        }
    };

    window.archiveMessage = async function (id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/messages/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-token': authToken
                },
                body: JSON.stringify({
                    status: 'archived'
                })
            });

            const data = await response.json();

            if (data.success) {
                showNotification('Message archived', 'success');
                loadMessages(currentPage);
                loadStats();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error archiving message:', error);
            showNotification('Failed to archive message: ' + error.message, 'error');
        }
    };

    window.deleteMessage = async function (id) {
        if (!confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/messages/${id}`, {
                method: 'DELETE',
                headers: {
                    'x-admin-token': authToken
                }
            });

            const data = await response.json();

            if (data.success) {
                showNotification('Message deleted successfully', 'success');
                loadMessages(currentPage);
                loadStats();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            showNotification('Failed to delete message: ' + error.message, 'error');
        }
    };

    // Helper function to show message modal - FIXED VERSION
    function showMessageModal(message) {
        const modal = document.createElement('div');
        modal.className = 'modal fade show d-block';
        modal.style.cssText = 'background-color: rgba(0,0,0,0.5);';
        modal.setAttribute('tabindex', '-1');

        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Message from ${escapeHtml(message.name)}</h5>
                        <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>From:</strong><br>
                                ${escapeHtml(message.name)}
                            </div>
                            <div class="col-md-6">
                                <strong>Email:</strong><br>
                                <a href="mailto:${escapeHtml(message.email)}">${escapeHtml(message.email)}</a>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>Date:</strong><br>
                                ${message.createdAt ? new Date(message.createdAt).toLocaleString() : 'N/A'}
                            </div>
                            <div class="col-md-6">
                                <strong>Status:</strong><br>
                                ${getStatusBadge(message.status || 'new')}
                            </div>
                        </div>
                        <hr>
                        <div class="mb-3">
                            <strong>Subject:</strong><br>
                            <div style="background: #f8f9fa; padding: 0.5rem; border-radius: 0.25rem; margin-top: 0.25rem;">
                                ${escapeHtml(message.subject || 'No subject')}
                            </div>
                        </div>
                        <div class="mb-3">
                            <strong>Message:</strong><br>
                            <div style="white-space: pre-wrap; background: #f8f9fa; padding: 1rem; border-radius: 0.375rem; max-height: 400px; overflow-y: auto;">
                                ${escapeHtml(message.message)}
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" 
                                onclick="replyToMessage('${message._id}', '${escapeHtml(message.email)}', '${escapeHtml(message.name)}'); this.closest('.modal').remove()">
                            <i class="fas fa-reply me-1"></i> Reply
                        </button>
                        <button type="button" class="btn btn-secondary" 
                                onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Filter messages by status
    window.filterMessages = function (status) {
        currentFilter = status;
        loadMessages(1); // Reset to first page when changing filters

        // Update table title to show current filter
        const tableTitle = document.querySelector('.table-header h3');
        if (tableTitle) {
            const filterText = status === 'all' ? 'All Messages' :
                status === 'new' ? 'Unread Messages' :
                    status === 'replied' ? 'Replied Messages' : 'Archived Messages';
            tableTitle.innerHTML = `<i class="fas fa-inbox me-2"></i> ${filterText}`;
        }
    };

    // Refresh messages function
    window.refreshMessages = function () {
        loadMessages(currentPage);
        loadStats();
        showNotification('Messages refreshed', 'success');
    };

    // Export messages function
    window.exportMessages = function () {
        showNotification('Export feature coming soon!', 'info');
    };

    // Auto-refresh messages every 60 seconds
    setInterval(() => {
        if (dashboard && dashboard.style.display === 'block') {
            loadMessages(currentPage);
        }
    }, 60000);

    // Make loadMessages globally accessible for retry button
    window.loadMessages = loadMessages;
});