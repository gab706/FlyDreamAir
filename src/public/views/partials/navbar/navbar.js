(() => {
    /**
     * DOM Elements
     * - Navbar, toggle buttons, plane animation, and logo container
     */
    const $themeToggle = $('#theme-toggle');
    const $navbar = $('.navbar');
    const $navbarLinks = $('.navbar-links');
    const $menuToggle = $('#mobile-menu-toggle');
    const $menuIcon = $menuToggle.find('i');
    const $plane = $('#plane');
    const $text = $('#trail-text');
    const $logoContainer = $('#logo-container');

    /**
     * Plane Logo Hover Animation
     * - Triggers a reflow to restart CSS animations
     */
    $logoContainer.on('mouseenter', () => {
        $plane.removeClass('plane-animate');
        $text.removeClass('trail-animate');

        // Force reflow to restart the animation
        void $plane[0].offsetWidth;
        void $text[0].offsetWidth;

        $plane.addClass('plane-animate');
        $text.addClass('trail-animate');
    });

    /**
     * Mobile Menu Toggle
     * - Toggles navbar visibility and menu icon between bars and times
     */
    $menuToggle.on('click', () => {
        const isVisible = $navbarLinks.toggleClass('show').hasClass('show');
        $navbar.toggleClass('showing-menu', isVisible);
        $menuIcon.toggleClass('fa-bars fa-times');
    });

    /**
     * Dark Theme Toggle
     * - Switches dark mode using ClientStorageSolutions and reloads the page
     */
    $themeToggle.on('click', async () => {
        await ClientStorageSolutions.toggleDarkMode();
        location.reload();
    });
})();