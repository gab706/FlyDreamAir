(() => {

    const $form = $('#newsletter-form');
    const $emailInput = $('#newsletter-email');

    $form.on('submit', function (e) {
        e.preventDefault();

        $.notify("Thank you for subscribing to our Newsletter!", { className: "success", position: "top right" });
        $emailInput.val('');
    });
})();
