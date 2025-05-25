(() => {
    function toggleSection(triggerSelector, contentSelector, iconSelector, activeClass = 'active', plus = '+', minus = '-') {
        $(triggerSelector).on('click', function () {
            const $trigger = $(this);
            const $content = $trigger.next(contentSelector);
            const $icon = $trigger.find(iconSelector);

            const isVisible = $content.is(':visible');

            $(contentSelector).not($content).slideUp();
            $(triggerSelector).not($trigger).find(iconSelector).text(plus);

            $content.slideToggle();
            $icon.text(isVisible ? plus : minus);
        });
    }

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

    toggleSection('.faq-question', '.faq-answer', '.q-icon');
    toggleSection('.category-toggle', '.category-content', '.toggle-icon');
})();