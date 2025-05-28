// Self-invoking async function to encapsulate user search and admin actions
(async () => {
    // Select DOM elements
    const $results = $('#search-results');
    const $matchCount = $('#match-count');
    const $tableBody = $('#search-table tbody');
    const $notifyModal = $('#notify-modal');
    const $notifyForm = $('#notify-form');
    const $passwordModal = $('#password-modal');
    const $passwordForm = $('#password-form');
    const currentUser = await ClientStorageSolutions.getCurrentUser();

    let selectedUserID = null;

    // Determine user tier based on points
    const getTier = points =>
        points >= 30000 ? 'platinum' :
            points >= 15000 ? 'gold' : 'silver';

    // Hide modal and clear selection
    const closeModal = $modal => {
        $modal.addClass('hidden');
        selectedUserID = null;
    };

    // Generate HTML for one user table row
    const renderUserRow = async (user) => {
        const tier = getTier(user.points || 0);
        const canEdit = currentUser.role >= user.role;
        const flights = (await ClientStorageSolutions.fetchBookings({ userID: user.userID })).length;
        const rewards = (await ClientStorageSolutions.fetchRewardRecords({ userID: user.userID })).length;

        const actions = canEdit
            ? `
                <i class="fas fa-bell action-notify" data-user="${user.userID}" title="Send Notification"></i>
                <i class="fas fa-key action-password" data-user="${user.userID}" title="Change Password"></i>
            `
            : `<i class="fas fa-lock lock-icon" title="Insufficient Permission"></i>`;

        return `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="tier-pill ${tier}">${tier[0].toUpperCase() + tier.slice(1)}</span></td>
                <td>${user.points || 0}</td>
                <td>${flights}</td>
                <td>${rewards}</td>
                <td><div class="table-actions">${actions}</div></td>
            </tr>
        `;
    };

    // Ensure session is valid before proceeding
    if (!currentUser)
        return $.notify("No Active Session Found", { className: 'error', position: 'top right' });

    // Handle search action
    $('#search-btn').on('click', async () => {
        const field = $('#search-type').val();
        const value = $('#search-input').val().trim().toLowerCase();

        if (!value)
            return $.notify("Please Enter a Search Value", { className: 'warn', position: 'top right' });

        const matches = await ClientStorageSolutions.fetchUsers(field, v =>
            String(v || '').toLowerCase().includes(value)
        );

        if (!matches.length)
            return $.notify("No Matching Users Found", { className: 'info', position: 'top right' });

        const rows = await Promise.all(matches.map(u => renderUserRow(u, currentUser)));
        $matchCount.text(`${matches.length} Match${matches.length === 1 ? '' : 'es'} Found`);
        $tableBody.html(rows.join(''));
        $results.removeClass('hidden');
    });

    // Open notify modal
    $(document).on('click', '.action-notify', function () {
        selectedUserID = $(this).data('user');
        $notifyForm[0].reset();
        $('#anon-toggle').prop('checked', false);
        $notifyModal.removeClass('hidden');
    });

    // Close notify modal (button or backdrop click)
    $('#close-notify-modal').on('click', () => closeModal($notifyModal));
    $notifyModal.on('click', e => { if (e.target === $notifyModal[0]) closeModal($notifyModal); });

    // Handle notify form submission
    $notifyForm.on('submit', async function (e) {
        e.preventDefault();
        const msg = this.message.value.trim();
        const isAnon = this.anonymous.checked;

        await ClientStorageSolutions.sendNotification(selectedUserID, msg, isAnon
            ? {}
            : {
                senderName: currentUser.name,
                senderAvatar: currentUser.profile_pic
            });

        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: 'Notification sent successfully.'
        });

        closeModal($notifyModal);
        location.reload();
    });

    // Open password modal
    $(document).on('click', '.action-password', function () {
        selectedUserID = $(this).data('user');
        $passwordForm[0].reset();
        $passwordModal.removeClass('hidden');
    });

    // Close password modal (button or backdrop click)
    $('#close-password-modal').on('click', () => closeModal($passwordModal));
    $passwordModal.on('click', e => { if (e.target === $passwordModal[0]) closeModal($passwordModal); });

    // Handle password form submission
    $passwordForm.on('submit', async function (e) {
        e.preventDefault();
        const newPass = this.newPassword.value.trim();
        const confirmPass = this.confirmPassword.value.trim();

        if (newPass !== confirmPass)
            return $.notify("Passwords must Match", { className: 'error', position: 'top right' });

        await ClientStorageSolutions.editUser(selectedUserID, { password: newPass });

        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: 'Password updated successfully.'
        });

        closeModal($passwordModal);
        location.reload();
    });
})();