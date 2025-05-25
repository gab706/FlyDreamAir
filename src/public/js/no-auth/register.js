(() => {
    const $video = $('#bg-video')[0];
    const $form = $('#auth-form');
    const $email = $('#email');
    const $name = $('#name');
    const $password = $('#password');

    const blockedEmails = new Set([
        'user@user.com',
        'admin@admin.com',
        'staff@staff.com',
        'manager@manager.com'
    ]);

    $video.pause();

    $('.pane').each((i, el) => {
        const target = el.dataset.letter;
        new LetterPaneAnimator(el, target, i).animate();
    });

    $form.on('submit', async (e) => {
        e.preventDefault();
        const email = $email.val().trim().toLowerCase();
        const name = $name.val().trim();
        const password = $password.val().trim();

        if (blockedEmails.has(email))
            return $.notify("That email is blocked", { className: 'error', position: 'top right' });

        if ((await ClientStorageSolutions.fetchUsers('email', email)).length > 0)
            return $.notify("That email is already registered", { className: 'error', position: 'top right' });

        const newUser = await ClientStorageSolutions.createUser({
            email,
            name,
            password
        });

        await ClientStorageSolutions.setUserSession(newUser.userID);
        await ClientStorageSolutions.sendNotification(newUser.userID, `Welcome to FlyDreamAir, ${newUser.name}! 🎉`);

        $('#bg-video')[0].play();
        $('#auth-entry-card').hide();

        setTimeout(() =>
            window.location.replace('/dashboard'), 5000);
    });
})();