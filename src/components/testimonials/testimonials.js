$(document).ready(function () {
    const $testim = $('#fly-testimonials');
    const $testimDots = $('#fly-testimonials-dots').children();
    const $testimContent = $('#fly-testimonials-content').children();
    const $leftArrow = $('#left-arrow');
    const $rightArrow = $('#right-arrow');
    const testimSpeed = 4500;

    let currentSlide = 0;
    let currentActive = 0;
    let testimTimer;
    let touchStartPos = 0;
    let touchEndPos = 0;
    const ignoreTouch = 30;

    function playSlide(slide) {
        $testimDots.removeClass('active');
        $testimContent.removeClass('active inactive');

        if (slide < 0) {
            slide = currentSlide = $testimContent.length - 1;
        }

        if (slide >= $testimContent.length) {
            slide = currentSlide = 0;
        }

        if (currentActive !== currentSlide) {
            $testimContent.eq(currentActive).addClass('inactive');
        }

        $testimContent.eq(slide).addClass('active');
        $testimDots.eq(slide).addClass('active');

        currentActive = currentSlide;

        clearTimeout(testimTimer);
        testimTimer = setTimeout(() => {
            playSlide(++currentSlide);
        }, testimSpeed);
    }

    $leftArrow.on('click', function () {
        playSlide(--currentSlide);
    });

    $rightArrow.on('click', function () {
        playSlide(++currentSlide);
    });

    $testimDots.each(function (index) {
        $(this).on('click', function () {
            playSlide(currentSlide = index);
        });
    });

    playSlide(currentSlide);

    $(document).on('keyup', function (e) {
        if (e.keyCode === 37) {
            $leftArrow.click();
        } else if (e.keyCode === 39) {
            $rightArrow.click();
        }
    });

    $testim.on('touchstart', function (e) {
        touchStartPos = e.originalEvent.changedTouches[0].clientX;
    });

    $testim.on('touchend', function (e) {
        touchEndPos = e.originalEvent.changedTouches[0].clientX;
        const diff = touchStartPos - touchEndPos;

        if (diff > ignoreTouch) {
            $rightArrow.click();
        } else if (diff < -ignoreTouch) {
            $leftArrow.click();
        }
    });
});