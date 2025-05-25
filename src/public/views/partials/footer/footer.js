(() => {
    function notify(message, type) {
        $.notify(message, {
            className: type,
            position: "top right",
            autoHideDelay: 3000
        });
    }
    const $form = $('#newsletter-form');
    const $emailInput = $('#newsletter-email');

    $form.on('submit', function (e) {
        e.preventDefault();

        const email = $emailInput.val().trim();

        if (ClientStorageWrapper.isNewsletterInCooldown())
            return notify("Please wait a few seconds before Subscribing Again", "warn");

        if (ClientStorageWrapper.isEmailSubscribed(email))
            return notify("You are already Subscribed", "warn");

        ClientStorageWrapper.addSubscribedEmail(email);

        notify("Thank you for subscribing to our Newsletter!", "success");
        $emailInput.val('');
    });
})();