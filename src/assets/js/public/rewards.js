$(document).ready(function () {
    new Swiper('.partners-swiper', {
        loop: true,
        slidesPerView: 5,
        spaceBetween: 30,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false
        },
        breakpoints: {
            0: { slidesPerView: 2 },
            480: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 }
        }
    });

    $('.faq-question').on('click', function () {
        const $question = $(this);
        const $answer = $question.next('.faq-answer');
        const $icon = $question.find('.q-icon');

        $('.faq-answer').not($answer).slideUp();
        $('.faq-question .q-icon').not($icon).text('+');

        const isVisible = $answer.is(':visible');
        $answer.slideToggle();
        $icon.text(isVisible ? '+' : '-');
    });

    $('.category-toggle').on('click', function () {
        const $toggle = $(this);
        const $content = $toggle.next('.category-content');
        const $icon = $toggle.find('.toggle-icon');

        $('.category-content').not($content).slideUp();
        $('.category-toggle .toggle-icon').not($icon).text('+');

        const isVisible = $content.is(':visible');
        $content.slideToggle();
        $icon.text(isVisible ? '+' : '-');
    });
});