$(document).ready(function () {
    const $testimonialWrapper = $('#fly-testimonials');
    const $dots = $('#fly-testimonials-dots').children();
    const $slides = $('#fly-testimonials-content').children();
    const $arrowLeft = $('#left-arrow');
    const $arrowRight = $('#right-arrow');
    const slideInterval = 4500;

    let activeIndex = 0;
    let autoSlideTimer;
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 30;

    function showSlide(index) {
        $dots.removeClass('active');
        $slides.removeClass('active inactive');

        if (index < 0)
            index = $slides.length - 1;
        if (index >= $slides.length)
            index = 0;

        if (index !== activeIndex)
            $slides.eq(activeIndex).addClass('inactive');

        $slides.eq(index).addClass('active');
        $dots.eq(index).addClass('active');

        activeIndex = index;

        clearTimeout(autoSlideTimer);
        autoSlideTimer = setTimeout(() =>
            showSlide(activeIndex + 1), slideInterval);
    }

    $arrowLeft.on('click', () => showSlide(activeIndex - 1));
    $arrowRight.on('click', () => showSlide(activeIndex + 1));

    $dots.each(function (i) {
        $(this).on('click', () => showSlide(i));
    });

    showSlide(activeIndex);

    $(document).on('keyup', function (e) {
        if (e.key === 'ArrowLeft')
            $arrowLeft.click();
        else if (e.key === 'ArrowRight')
            $arrowRight.click();
    });

    $testimonialWrapper
        .on('touchstart', function (e) {
            touchStartX = e.originalEvent.changedTouches[0].clientX;
        })
        .on('touchend', function (e) {
            touchEndX = e.originalEvent.changedTouches[0].clientX;
            const delta = touchStartX - touchEndX;

            if (delta > swipeThreshold)
                $arrowRight.click();
            else if (delta < -swipeThreshold)
                $arrowLeft.click();
        });
});