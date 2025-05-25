(() => {
    $('.menu_tab .nav-link').on('click', function (e) {
        e.preventDefault();

        $('.menu_tab .nav-link').removeClass('active');
        $('.tab-pane').removeClass('show active');

        $(this).addClass('active');
        const target = $(this).attr('href');
        $(target).addClass('show active');
    });
})();