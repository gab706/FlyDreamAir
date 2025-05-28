(() => {
    // DOM references for newsletter form and input field
    const $form = $('#newsletter-form');
    const $emailInput = $('#newsletter-email');

    /**
     * Newsletter Form Submission Handler
     * - Prevents default form action
     * - Displays a success message
     * - Clears the email input field
     */
    $form.on('submit', function (e) {
        e.preventDefault();

        $.notify("Thank you for subscribing to our Newsletter!", { className: "success", position: "top right" });
        $emailInput.val('');
    });
})();
