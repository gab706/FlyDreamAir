(async() => {
    const currentUser = await ClientStorageSolutions.getCurrentUser();
    const actualPassword = currentUser?.password || '';
    const $passwordField = $('#password-field');
    const $togglePassword = $('#toggle-password');
    let visible = false;

    // Function to update displayed password (masked or plain)
    const updatePasswordDisplay = () => {
        $passwordField.text(visible ? actualPassword : '•'.repeat(actualPassword.length));
        $togglePassword
            .toggleClass('fa-eye', !visible)
            .toggleClass('fa-eye-slash', visible);
    };

    // Modal utility functions
    const openModal = id => $(`#${id}`).removeClass('hidden');
    const closeModal = id => $(`#${id}`).addClass('hidden');

    updatePasswordDisplay(); // Initialize password display

    // Toggle password visibility
    $togglePassword.on('click', () => {
        if (currentUser?.adminImpersonating)
            return $.notify("You can't do that on this account", { className: 'error', position: 'top right' });
        visible = !visible;
        updatePasswordDisplay();
    });

    // Open email change modal and pre-fill current email
    $('#change-email').on('click', () => {
        $('#email-input').val(currentUser.email);
        openModal('email-modal');
    });

    // Open password change modal and clear input fields
    $('#change-password').on('click', () => {
        $('#new-password, #confirm-password').val('');
        openModal('password-modal');
    });

    // Open profile picture modal and pre-fill current URL
    $('.change-pfp-btn').on('click', () => {
        $('#pfp-url').val(currentUser.profile_pic);
        openModal('pfp-modal');
    });

    // Close modal when clicking the "X" button
    $('.modal-close').on('click', function () {
        closeModal($(this).closest('.modal-overlay').attr('id'));
    });

    // Close modal when clicking outside the modal content
    $('.modal-overlay').on('click', function (e) {
        if (e.target === this) closeModal(this.id);
    });

    // Handle profile picture form submission
    $('#update-pfp-form').on('submit', async function (e) {
        e.preventDefault();
        await ClientStorageSolutions.editUser(currentUser.userID, { profile_pic: $('#pfp-url').val().trim() });
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: 'Successfully updated profile picture.'
        });
        location.reload();
    });

    // Handle email update form submission
    $('#update-email-form').on('submit', async function (e) {
        e.preventDefault();
        await ClientStorageSolutions.editUser(currentUser.userID, { email: $('#email-input').val().trim() });
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: 'Successfully updated email.'
        });
        location.reload();
    });

    // Handle password update form submission
    $('#update-password-form').on('submit', async function (e) {
        e.preventDefault();
        const newPass = $('#new-password').val().trim();
        const confirmPass = $('#confirm-password').val().trim();

        // Ensure password confirmation matches
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