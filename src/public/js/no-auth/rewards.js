(() => {
    /**
     * Toggle accordion-like sections (FAQ or category).
     * Closes others when opening one, and updates +/- icon.
     */
    function toggleSection(triggerSelector, contentSelector, iconSelector, activeClass = 'active', plus = '+', minus = '-') {
        $(triggerSelector).on('click', function () {
            const $trigger = $(this);
            const $content = $trigger.next(contentSelector); // Finds the content directly after the trigger
            const $icon = $trigger.find(iconSelector);       // Finds the icon inside the trigger

            const isVisible = $content.is(':visible');

            // Close all other sections and reset icons
            $(contentSelector).not($content).slideUp();
            $(triggerSelector).not($trigger).find(iconSelector).text(plus);

            // Toggle current section and icon
            $content.slideToggle();
            $icon.text(isVisible ? plus : minus);
        });
    }

    /**
     * Initialize Swiper slider for partner logos
     */
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

    // Enable toggling for FAQ and category sections
    toggleSection('.faq-question', '.faq-answer', '.q-icon');
    toggleSection('.category-toggle', '.category-content', '.toggle-icon');
})();