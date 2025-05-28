(() => {
    // Handle tab switching for .menu_tab navigation
    $('.menu_tab .nav-link').on('click', function (e) {
        e.preventDefault();

        // Remove active state from all tabs and panes
        $('.menu_tab .nav-link').removeClass('active');
        $('.tab-pane').removeClass('show active');

        // Activate the clicked tab and corresponding pane
        $(this).addClass('active');
        const target = $(this).attr('href');
        $(target).addClass('show active');
    });
})();