(() => {
    /**
     * Page Load Handler
     * - Waits for full page load event
     * - Hides and then removes the preloader element smoothly
     */
    $(window).on('load', function () {
        const $loader = $('.loader');

        // If a loader element exists, fade it out and then remove from DOM
        if ($loader.length) {
            $loader.addClass('hidden'); // Apply hidden class for fade-out effect
            setTimeout(() => $loader.remove(), 600); // Fully remove after animation
        }
    });
})();