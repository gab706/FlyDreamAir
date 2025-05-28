(async () => {
    // DOM references for notifications and user menu
    const $notificationBtn = $('#notification-btn');
    const $notificationDrop = $('#notification-dropdown');
    const $notificationBadge = $('.notification-badge');

    // Attempt to get the current user from client storage
    const currentUser = await ClientStorageSolutions.getCurrentUser();
    if (!currentUser)
        return $.notify("No Active Session Found", { className: 'error', position: 'top right' });

    // Fetch and filter user-specific notifications
    const allNotifications = await ClientStorageWrapper.get('notifications', 'indexed') || [];
    const userNotifications = allNotifications
        .filter(n => n.userID === currentUser.userID)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Update the unread badge if there are unread notifications
    const unreadCount = userNotifications.filter(n => n.read === 0).length;
    if (unreadCount > 0) {
        $notificationBadge.text(unreadCount);
        $notificationBadge.show();
    } else {
        $notificationBadge.hide();
    }

    // Toggle dropdown and populate notifications on click
    $notificationBtn.on('click', async function (e) {
        e.stopPropagation();
        $notificationDrop.toggleClass('active');

        // Clear previous notifications and loaders
        $notificationDrop.find('.notification-loading, .notification-item, .notification-clear').remove();

        // Re-fetch notifications to ensure accuracy
        const allNotifications = await ClientStorageWrapper.get('notifications', 'indexed') || [];
        const userNotifications = allNotifications
            .filter(n => n.userID === currentUser.userID)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Display messages or fallback
        if (userNotifications.length === 0) {
            $notificationDrop.append(`<div class="notification-item">No Notifications</div>`);
        } else {
            userNotifications.forEach(notification => {
                $notificationDrop.append(`
                    <div class="notification-item ${notification.read === 0 ? 'unread' : ''}">
                        <div>${notification.message}</div>
                        <div class="notification-meta">
                            <img src="${notification.senderAvatar}" alt="${notification.senderName} Avatar" class="sender-avatar">
                            <span>${notification.senderName}</span> •
                            ${new Date(notification.timestamp).toLocaleString('en-AU', {
                    dateStyle: 'short', timeStyle: 'short'
                })}
                        </div>
                    </div>
                `);
            });

            $notificationDrop.append(`<div class="notification-clear">Clear All</div>`);
        }

        // Mark as read (only if not impersonating)
        if (!currentUser?.adminImpersonating) {
            setTimeout(() => {
                $notificationBadge.hide();
                $('#notification-dropdown .notification-item.unread').removeClass('unread');
            }, 2500);

            await ClientStorageSolutions.markNotificationsRead({ userID: currentUser.userID });
        }
    });

    // Hide dropdown when clicking outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.notification-wrapper').length)
            $notificationDrop.removeClass('active');
    });

    // Clear all notifications (only if not impersonating)
    $(document).on('click', '.notification-clear', async function () {
        if (!currentUser?.adminImpersonating) {
            await ClientStorageSolutions.deleteNotifications({ userID: currentUser.userID });
            await ClientStorageSolutions.setNotifyOnReset({
                type: 'success',
                message: 'Successfully cleared all notifications.',
            });
            location.reload();
        } else {
            $.notify("You can't do that on this account", { className: 'error', position: 'top right' });
        }
    });

    // Toggle dark mode and reload
    $('#toggle-dark-mode').on('click', async function () {
        await ClientStorageSolutions.toggleDarkMode();
        location.reload();
    });

    // Account dropdown toggle
    const $toggle = $('#user-account-toggle');
    const $dropdown = $('#user-dropdown');

    $toggle.on('click', function (e) {
        e.stopPropagation();
        $toggle.toggleClass('active');
        $dropdown.toggleClass('hidden');
    });

    $(document).on('click', function () {
        $dropdown.addClass('hidden');
        $toggle.removeClass('active');
    });

    // Logout or exit impersonation
    $('#logout-btn').on('click', async function () {
        if (currentUser.adminImpersonating !== null && currentUser.adminImpersonating !== undefined) {
            await ClientStorageSolutions.setUserSession(currentUser.adminImpersonating);
            location.href = '/dashboard';
        } else {
            await ClientStorageSolutions.clearUserSession();
            location.href = '/login';
        }
    });
})();