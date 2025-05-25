(() => {
    const $wrapper = $('#section-testimonials');
    const $dots = $('#section-testimonials-dots .dot');
    const $slides = $('#section-testimonials-content > div');
    const $arrowLeft = $('#left-arrow');
    const $arrowRight = $('#right-arrow');

    const interval = 4500;
    const swipeThreshold = 30;

    let active = 0;
    let timer = null;
    let touchStart = 0;

    const setActiveSlide = (index) => {
        if (index < 0) index = $slides.length - 1;
        if (index >= $slides.length) index = 0;

        $slides.removeClass('active inactive');
        $dots.removeClass('active');

        if (index !== active)
            $slides.eq(active).addClass('inactive');

        $slides.eq(index).addClass('active');
        $dots.eq(index).addClass('active');

        active = index;
        resetAutoSlide();
    };

    const resetAutoSlide = () => {
        clearTimeout(timer);
        timer = setTimeout(() => setActiveSlide(active + 1), interval);
    };

    $arrowLeft.on('click', () => setActiveSlide(active - 1));
    $arrowRight.on('click', () => setActiveSlide(active + 1));

    $dots.each((i, el) =>
        $(el).on('click', () => setActiveSlide(i)));

    $(document).on('keyup', (e) => {
        if (e.key === 'ArrowLeft')
            $arrowLeft.click();
        else if (e.key === 'ArrowRight')
            $arrowRight.click();
    });

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

    setActiveSlide(active);
})();