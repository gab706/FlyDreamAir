(() => {
    $(window).on('load', function () {
        const $loader = $('.loader');
        if ($loader.length) {
            $loader.addClass('hidden');
            setTimeout(() => $loader.remove(), 600);
        }
    });
})();