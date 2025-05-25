(() => {
    const $themeToggle = $('#theme-toggle');
    const $navbar = $('.navbar');
    const $navbarLinks = $('.navbar-links');
    const $menuToggle = $('#mobile-menu-toggle');
    const $menuIcon = $menuToggle.find('i');
    const $plane = $('#plane');
    const $text = $('#trail-text');
    const $logoContainer = $('#logo-container');

    $logoContainer.on('mouseenter', () => {
        $plane.removeClass('plane-animate');
        $text.removeClass('trail-animate');

        void $plane[0].offsetWidth;
        void $text[0].offsetWidth;

        $plane.addClass('plane-animate');
        $text.addClass('trail-animate');
    });

    $menuToggle.on('click', () => {
        const isVisible = $navbarLinks.toggleClass('show').hasClass('show');
        $navbar.toggleClass('showing-menu', isVisible);
        $menuIcon.toggleClass('fa-bars fa-times');
    });

    $themeToggle.on('click', async () => {
        await ClientStorageSolutions.toggleDarkMode();
        location.reload();
    });
})();