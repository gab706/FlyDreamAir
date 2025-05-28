(() => {
    // Grab all necessary DOM elements
    const $wrapper = $('#section-testimonials');
    const $dots = $('#section-testimonials-dots .dot');
    const $slides = $('#section-testimonials-content > div');
    const $arrowLeft = $('#left-arrow');
    const $arrowRight = $('#right-arrow');

    // Configuration values
    const interval = 4500; // Auto-slide interval in milliseconds
    const swipeThreshold = 30; // Minimum swipe distance in px to trigger slide change

    let active = 0; // Currently active slide index
    let timer = null; // Timer for auto-sliding
    let touchStart = 0; // Starting X position for swipe detection

    // Sets the active slide and handles transition classes
    const setActiveSlide = (index) => {
        // Wrap around if out of bounds
        if (index < 0) index = $slides.length - 1;
        if (index >= $slides.length) index = 0;

        // Clear previous states
        $slides.removeClass('active inactive');
        $dots.removeClass('active');

        // Mark previous slide as inactive if it was a manual switch
        if (index !== active)
            $slides.eq(active).addClass('inactive');

        // Mark the new slide as active
        $slides.eq(index).addClass('active');
        $dots.eq(index).addClass('active');

        active = index;
        resetAutoSlide(); // Restart auto-slide timer
    };

    // Resets and starts the auto-slide timer
    const resetAutoSlide = () => {
        clearTimeout(timer);
        timer = setTimeout(() => setActiveSlide(active + 1), interval);
    };

    // Arrow click events
    $arrowLeft.on('click', () => setActiveSlide(active - 1));
    $arrowRight.on('click', () => setActiveSlide(active + 1));

    // Dot click events
    $dots.each((i, el) =>
        $(el).on('click', () => setActiveSlide(i)));

    // Keyboard navigation support
    $(document).on('keyup', (e) => {
        if (e.key === 'ArrowLeft')
            $arrowLeft.click();
        else if (e.key === 'ArrowRight')
            $arrowRight.click();
    });

    // Touch swipe support for mobile
    $wrapper
        .on('touchstart', (e) =>
            touchStart = e.originalEvent.changedTouches[0].clientX)
        .on('touchend', (e) => {
            const touchEnd = e.originalEvent.changedTouches[0].clientX;
            const delta = touchStart - touchEnd;

            if (delta > swipeThreshold)
                $arrowRight.click();
            else if (delta < -swipeThreshold)
                $arrowLeft.click();
        });

    // Initialize the first slide
    setActiveSlide(active);
})();