$(document).ready(function () {
    const $plane = $('#plane');
    const $text = $('#trail-text');
    const session = StorageWrapper.get('userSession', 'local');

    $('#logo-container').on('mouseenter', () => {
        $plane.removeClass('plane-animate');
        $text.removeClass('trail-animate');

        $plane[0]?.offsetWidth;
        $text[0]?.offsetWidth;

        $plane.addClass('plane-animate');
        $text.addClass('trail-animate');
    });

    if (session?.loggedIn === true) {
        const $signupBtn = $('.signup-btn');
        $signupBtn.attr('href', '../user/user-dashboard.html');
        $signupBtn.text('📝 Account');
    }
});