(async () => {
    const $userTable = $('#user-table-body');
    const $pagination = $('#user-pagination');
    const $createUserModal = $('#create-user-modal');
    const $editUserModal = $('#edit-user-modal');
    const $createUserForm = $('#create-user-form');
    const $editUserForm = $('#edit-user-form');

    const users = await ClientStorageSolutions.fetchUsers('userID', () => true); // fetch all
    const session = await ClientStorageSolutions.getCurrentUser();

    const usersPerPage = 10;
    let currentPage = 1;
    const totalPages = Math.ceil(users.length / usersPerPage);

    function renderPage(page = 1) {
        $userTable.empty();
        $pagination.empty();

        if (!users.length) {
            $userTable.append(`<tr><td colspan="7" class="text-center">No users found.</td></tr>`);
            return;
        }

        const start = (page - 1) * usersPerPage;
        const pageUsers = users.slice(start, start + usersPerPage);

        pageUsers.forEach(user => {
            const rankMap = {
                3: { class: 'admin', label: 'Admin' },
                2: { class: 'manager', label: 'Manager' },
                1: { class: 'staff', label: 'Staff' },
            };
            const rank = rankMap[user.role];

            $userTable.append(`
                <tr>
                    <td>${user.userID}</td>
                    <td><img src="${user.profile_pic}" alt="${user.name} Avatar" class="avatar-small"></td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${rank ? `<span class="rank-pill ${rank.class}">${rank.label}</span>` : ''}</td>
                    <td>${user.points || 0}</td>
                    <td>
                        <div class="table-actions">
                            <i class="fas fa-eye action-impersonate" data-user-id="${user.userID}" title="Impersonate"></i>
                            <i class="fas fa-edit action-edit" data-user-id="${user.userID}" title="Edit"></i>
                            <i class="fas fa-trash action-delete" data-user-id="${user.userID}" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `);
        });

        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                const active = i === page ? 'active' : '';
                $pagination.append(`<a href="#" class="user-page-btn ${active}" data-page="${i}">${i}</a> `);
            }
        }
    }

    $pagination.on('click', '.user-page-btn', function (e) {
        e.preventDefault();
        const page = parseInt($(this).data('page'));
        if (page !== currentPage) {
            currentPage = page;
            renderPage(currentPage);
        }
    });

    $('#open-create-user-modal').on('click', () => $createUserModal.removeClass('hidden'));
    $('#close-create-user-modal').on('click', () => $createUserModal.addClass('hidden'));
    $('#close-edit-user-modal').on('click', () => $editUserModal.addClass('hidden'));

    $createUserForm.on('submit', async function (e) {
        e.preventDefault();
        const form = $(this);

        await ClientStorageSolutions.createUser({
            name: form.find('input[name="name"]').val(),
            email: form.find('input[name="email"]').val(),
            profile_pic: form.find('input[name="profile_pic"]').val(),
            role: parseInt(form.find('select[name="role"]').val(), 10),
            points: parseInt(form.find('input[name="points"]').val(), 10) || 0
        });

        $createUserModal.addClass('hidden');
        location.reload();
    });

    $(document).on('click', '.action-impersonate', async function () {
        const targetUserID = +$(this).data('user-id');
        await ClientStorageSolutions.setUserSession(targetUserID, session?.userID);
        await ClientStorageSolutions.sendNotification(targetUserID, "An admin has impersonated your account.");
        location.replace('/dashboard');
    });

    $(document).on('click', '.action-delete', async function () {
        const userID = +$(this).data('user-id');
        if (!confirm("Are you sure you want to delete this user?")) return;
        await ClientStorageSolutions.deleteUser(userID);
        location.reload();
    });

    $(document).on('click', '.action-edit', async function () {
        const userID = +$(this).data('user-id');
        const user = (await ClientStorageSolutions.fetchUsers('userID', userID))[0];
        if (!user) return $.notify("User not found", { className: 'error', position: 'top right' });

        $editUserForm.find('input[name="userID"]').val(user.userID);
        $editUserForm.find('input[name="name"]').val(user.name);
        $editUserForm.find('input[name="email"]').val(user.email);
        $editUserForm.find('input[name="profile_pic"]').val(user.profile_pic || '');
        $editUserForm.find('select[name="role"]').val(user.role);
        $editUserForm.find('input[name="points"]').val(user.points || 0);
        $editUserModal.removeClass('hidden');
    });

    $editUserForm.on('submit', async function (e) {
        e.preventDefault();
        const form = $(this);
        const userID = +form.find('input[name="userID"]').val();

        const originalUser = (await ClientStorageSolutions.fetchUsers('userID', userID))[0];
        const updates = {
            name: form.find('input[name="name"]').val().trim(),
            email: form.find('input[name="email"]').val().trim(),
            profile_pic: form.find('input[name="profile_pic"]').val().trim(),
            role: parseInt(form.find('select[name="role"]').val(), 10),
            points: parseInt(form.find('input[name="points"]').val(), 10) || 0
        };

        const changedFields = Object.entries(updates)
            .filter(([key, val]) => originalUser[key] !== val)
            .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1));

        if (changedFields.length)
            await ClientStorageSolutions.sendNotification(userID, `Your account has been updated. Fields changed: ${changedFields.join(', ')}.`);

        await ClientStorageSolutions.editUser(userID, updates);
        $editUserModal.addClass('hidden');
        location.reload();
    });

    renderPage(currentPage);
})();