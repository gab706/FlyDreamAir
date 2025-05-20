const notifyError = msg => $.notify(msg, { className: 'error', position: 'top right' });

function getRandomUserPic() {
    const genders = ['men', 'women'];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const id = Math.floor(Math.random() * 99) + 1;
    return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;
}

function loginUser(user) {
    StorageWrapper.set('userSession', { loggedIn: true, userID: user.userID }, 'local');
    $('#bg-video')[0].play();
    $('#login-card').hide();
    setTimeout(() => {
        window.location.replace("/pages/user/user-dashboard.html");
    }, 4000);
}

function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;;
    return re.test(email);
}

$(document).ready(function() {
    const session = StorageWrapper.get('userSession', 'local');

    if (session?.loggedIn)
        return window.location.replace('/pages/user/user-dashboard.html');

    $('#bg-video')[0].pause();

    $(".pane").each((i, el) => {
        const target = $(el).data("letter");
        new LetterPaneAnimator(el, target, i).animate();
    });

    $('#login-form').on('submit', e => {
        e.preventDefault();

        const email = $('#email').val().trim();
        const fullName = $('#name').val().trim();
        const password = $('#password').val();

        if ((!email || !validateEmail(email)) || !fullName || !password)
            return notifyError("Please enter valid account details");

        const blockedEmails = ['user@user.com', 'admin@admin.com', 'staff@staff.com', 'manager@manager.com'];
        if (blockedEmails.includes(email))
            return notifyError("That email is already in use");

        let users = StorageWrapper.get('users', 'local') || [];
        if (!Array.isArray(users))
            users = [];

        const emailExists = users.some(u => u.email?.toLowerCase() === email);
        if (emailExists)
            return notifyError("That email is already in use");

        const newUser = {
            userID: (users.length + 1).toString(),
            email,
            name: fullName,
            password,
            role: '0',
            profile_pic: getRandomUserPic(),
            points: '0'
        };

        users.push(newUser);
        StorageWrapper.set('users', users, 'local');

        loginUser(newUser);
    });
});