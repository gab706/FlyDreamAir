(async () => {
    const $video = $('#bg-video')[0];
    const $form = $('#auth-form');
    const $email = $('#email');
    const $password = $('#password');

    // Define guest profiles for quick demo logins
    const guestProfiles = {
        'user@user.com': {
            name: 'Guest User',
            password: 'user',
            role: 0,
        },
        'staff@staff.com': {
            name: 'Staff User',
            password: 'staff',
            role: 1,
        },
        'manager@manager.com': {
            name: 'Manager User',
            password: 'manager',
            role: 2,
        },
        'admin@admin.com': {
            name: 'Admin User',
            password: 'admin',
            role: 3,
        }
    };

    // Pause background video until login is complete
    $video.pause();

    // Animate each letter of the entry title using LetterPaneAnimator
    $('.pane').each((i, el) => {
        const target = el.dataset.letter;
        new LetterPaneAnimator(el, target, i).animate();
    });

    // Handle login form submission
    $form.on('submit', async (e) => {
        e.preventDefault();
        const email = $email.val().trim().toLowerCase();
        const password = $password.val().trim();

        // Try to fetch existing user
        let user = (await ClientStorageSolutions.fetchUsers('email', email))[0] || null;

        // If not found in storage or guestProfiles, show error
        if (!user && !guestProfiles[email])
            return $.notify("Invalid email or passwor", { className: 'error', position: 'top right' });

        // If user exists but password doesn't match
        if (user && user.password !== password)
            return $.notify("Invalid email or password", { className: 'error', position: 'top right' });

        // If it's a guest login, create the user on the fly
        if (guestProfiles[email] && guestProfiles[email].password === password)
            user = await ClientStorageSolutions.createUser({ ...guestProfiles[email], email });

        // Start user session and play entry animation
        await ClientStorageSolutions.setUserSession(user.userID);
        $('#bg-video')[0].play();
        $('#auth-entry-card').hide();

        // Redirect after 5 seconds
        setTimeout(() =>
            window.location.replace('/dashboard'), 5000);
    });

    // Handle "forgot password" action
    $('#forgot-password').on('click', e => {
        e.preventDefault();

        $.notify("A forgot password email has been sent", { className: 'success', position: 'top right' });
    });
})();