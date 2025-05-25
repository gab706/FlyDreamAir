(async () => {
    const $video = $('#bg-video')[0];
    const $form = $('#auth-form');
    const $email = $('#email');
    const $password = $('#password');

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

    $video.pause();

    $('.pane').each((i, el) => {
        const target = el.dataset.letter;
        new LetterPaneAnimator(el, target, i).animate();
    });

    $form.on('submit', async (e) => {
        e.preventDefault();
        const email = $email.val().trim().toLowerCase();
        const password = $password.val().trim();

        let user = (await ClientStorageSolutions.fetchUsers('email', email))[0] || null;

        if (!user && !guestProfiles[email])
            return $.notify("Invalid email or passwor", { className: 'error', position: 'top right' });

        if (user && user.password !== password)
            return $.notify("Invalid email or password", { className: 'error', position: 'top right' });

        if (guestProfiles[email] && guestProfiles[email].password === password)
            user = await ClientStorageSolutions.createUser({...guestProfiles[email], email});

        await ClientStorageSolutions.setUserSession(user.userID);

        $('#bg-video')[0].play();
        $('#auth-entry-card').hide();

        setTimeout(() =>
            window.location.replace('/dashboard'), 5000);
    });

    $('#forgot-password').on('click', e => {
        e.preventDefault();

        $.notify("A forgot password email has been sent", { className: 'success', position: 'top right' });
    });
})();