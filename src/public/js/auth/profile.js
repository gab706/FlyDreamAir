(async() => {
    const currentUser = await ClientStorageSolutions.getCurrentUser();
    const actualPassword = currentUser?.password || '';
    const $passwordField = $('#password-field');
    const $togglePassword = $('#toggle-password');
    let visible = false;

    const updatePasswordDisplay = () => {
        $passwordField.text(visible ? actualPassword : '•'.repeat(actualPassword.length));
        $togglePassword
            .toggleClass('fa-eye', !visible)
            .toggleClass('fa-eye-slash', visible);
    };

    const openModal = id => $(`#${id}`).removeClass('hidden');
    const closeModal = id => $(`#${id}`).addClass('hidden');

    updatePasswordDisplay();

    $togglePassword.on('click', () => {
        if (currentUser?.adminImpersonating)
            return $.notify("You can't do that on this account", { className: 'error', position: 'top right' });
        visible = !visible;
        updatePasswordDisplay();
    });

    $('#change-email').on('click', () => {
        $('#email-input').val(currentUser.email);
        openModal('email-modal');
    });

    $('#change-password').on('click', () => {
        $('#new-password, #confirm-password').val('');
        openModal('password-modal');
    });

    $('.change-pfp-btn').on('click', () => {
        $('#pfp-url').val(currentUser.profile_pic);
        openModal('pfp-modal');
    });

    $('.modal-close').on('click', function () {
        closeModal($(this).closest('.modal-overlay').attr('id'));
    });

    $('.modal-overlay').on('click', function (e) {
        if (e.target === this) closeModal(this.id);
    });

    $('#update-pfp-form').on('submit', async function (e) {
        e.preventDefault();
        await ClientStorageSolutions.editUser(currentUser.userID, { profile_pic: $('#pfp-url').val().trim() });
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: 'Successfully updated profile picture.'
        });
        location.reload();
    });

    $('#update-email-form').on('submit', async function (e) {
        e.preventDefault();
        await ClientStorageSolutions.editUser(currentUser.userID, { email: $('#email-input').val().trim() });
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: 'Successfully updated email.'
        });
        location.reload();
    });

    $('#update-password-form').on('submit', async function (e) {
        e.preventDefault();
        const newPass = $('#new-password').val().trim();
        const confirmPass = $('#confirm-password').val().trim();

        if (newPass !== confirmPass)
            return $.notify("Passwords do not match", { className: 'error', position: 'top right' });

        await ClientStorageSolutions.editUser(currentUser.userID, { password: newPass });
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: 'Successfully updated password.'
        });
        location.reload();
    });
})();