(() => {
    // DOM references for background video and form fields
    const $video = $('#bg-video')[0];
    const $form = $('#auth-form');
    const $email = $('#email');
    const $name = $('#name');
    const $password = $('#password');

    // Blocked guest account emails (reserved for demo access)
    const blockedEmails = new Set([
        'user@user.com',
        'admin@admin.com',
        'staff@staff.com',
        'manager@manager.com'
    ]);

    // Pause video on page load
    $video.pause();

    // Animate each pane letter with scramble effect
    $('.pane').each((i, el) => {
        const target = el.dataset.letter;
        new LetterPaneAnimator(el, target, i).animate();
    });

    // Handle signup form submission
    $form.on('submit', async (e) => {
        e.preventDefault();

        const email = $email.val().trim().toLowerCase();
        const name = $name.val().trim();
        const password = $password.val().trim();

        // Block guest/demo emails from signup
        if (blockedEmails.has(email))
            return $.notify("That email is blocked", { className: 'error', position: 'top right' });

        // Check if email is already registered
        if ((await ClientStorageSolutions.fetchUsers('email', email)).length > 0)
            return $.notify("That email is already registered", { className: 'error', position: 'top right' });

        // Create and store new user
        const newUser = await ClientStorageSolutions.createUser({ email, name, password });

        // Start session and send welcome notification
        await ClientStorageSolutions.setUserSession(newUser.userID);
        await ClientStorageSolutions.sendNotification(
            newUser.userID,
            `Welcome to FlyDreamAir, ${newUser.name}! 🎉`
        );

        // Resume background video and transition
        $('#bg-video')[0].play();
        $('#auth-entry-card').hide();

        // Redirect to dashboard after brief delay
        setTimeout(() => window.location.replace('/dashboard'), 5000);
    });
})();