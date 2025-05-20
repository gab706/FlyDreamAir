const notifyError = msg => $.notify(msg, { className: 'error', position: 'top right' });
const notifySuccess = msg => $.notify(msg, { className: 'success', position: 'top right' });

const guestProfiles = {
    user: {
        email: 'user@user.com',
        name: 'Guest User',
        password: 'user',
        role: '0',
        profile_pic: 'https://www.clker.com/cliparts/q/V/z/1/V/8/square-number-1-hi.png'
    },
    staff: {
        email: 'staff@staff.com',
        name: 'Staff User',
        password: 'staff',
        role: '1',
        profile_pic: 'https://www.clker.com/cliparts/l/O/r/4/C/p/number-2-square-orange-md.png'
    },
    manager: {
        email: 'manager@manager.com',
        name: 'Manager User',
        password: 'manager',
        role: '2',
        profile_pic: 'https://www.clker.com/cliparts/n/C/g/1/l/x/red-rounded-square-with-number-3-hi.png'
    },
    admin: {
        email: 'admin@admin.com',
        name: 'Admin User',
        password: 'admin',
        role: '3',
        profile_pic: 'https://www.clker.com/cliparts/g/t/y/l/z/P/blue-rounded-square-with-number-4-hi.png'
    }
};

function resolveGuestProfile(email, password) {
    const guestLogins = {
        'user@user.com': 'user',
        'staff@staff.com': 'staff',
        'manager@manager.com': 'manager',
        'admin@admin.com': 'admin'
    };

    const key = guestLogins[email];
    if (!key || guestProfiles[key].password !== password)
        return null;
    return guestProfiles[key];
}

function loginUser(user) {
    StorageWrapper.set('userSession', { loggedIn: true, userID: user.userID }, 'local', { days: 1 });
    $('#bg-video')[0].play();
    $('#login-card').hide();
    setTimeout(() =>
        window.location.replace("/pages/user/user-dashboard.html"), 5000);
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

$(document).ready(function () {
    const session = StorageWrapper.get('userSession', 'local');

    if (session?.loggedIn)
        return window.location.replace('/pages/user/user-dashboard.html');

    $('#bg-video')[0].pause();

    $(".pane").each((i, el) => {
        const target = $(el).data("letter");
        new LetterPaneAnimator(el, target, i).animate();
    });

    $('#login-form').on('submit', function (e) {
        e.preventDefault();

        const emailInput = $('#email').val().trim().toLowerCase();
        const passwordInput = $('#password').val();

        if (!validateEmail(emailInput) || !passwordInput)
            return notifyError("Please enter valid email and password");

        let users = StorageWrapper.get('users', 'local') || [];

        const guestProfile = resolveGuestProfile(emailInput, passwordInput);
        if (guestProfile) {
            let guestUser = users.find(u => u.email?.toLowerCase() === guestProfile.email);
            if (!guestUser) {
                guestUser = {
                    userID: (users.length + 1).toString(),
                    ...guestProfile,
                    points: '0'
                };

                users.push(guestUser);
                StorageWrapper.set('users', users, 'local');
            }
            return loginUser(guestUser);
        }

        const user = users.find(u => u.email?.toLowerCase() === emailInput);

        if (!user || user.password !== passwordInput)
            return notifyError("Incorrect username or password");

        loginUser(user);
    });

    $('#forgot-password').on('click', e => {
        e.preventDefault();
        notifySuccess("A forgot password email has been sent");
    });
});