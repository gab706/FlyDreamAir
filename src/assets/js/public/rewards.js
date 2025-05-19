$(document).ready(function () {
    new Swiper('.partners-swiper', {
        loop: true,
        slidesPerView: 5,
        spaceBetween: 30,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
        breakpoints: {
            0: { slidesPerView: 2 },
            480: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 }
        }
    });

    $('.faq-question').on('click', function () {
        const $answer = $(this).next('.faq-answer');
        const $icon = $(this).find('.q-icon');

        $('.faq-answer').not($answer).slideUp();
        $('.q-icon').not($icon).text('+');

        $answer.slideToggle();
        $icon.text($answer.is(':visible') ? '-' : '+');
    });

    $('.category-toggle').on('click', function () {
        const $content = $(this).next('.category-content');
        const $icon = $(this).find('.toggle-icon');

        $('.category-content').not($content).slideUp();
        $('.toggle-icon').not($icon).text('+');

        $content.slideToggle();
        $icon.text($content.is(':visible') ? '-' : '+');
    });
});