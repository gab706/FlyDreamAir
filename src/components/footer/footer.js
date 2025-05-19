$(document).ready(function () {
    const $form = $('#newsletter-form');
    const $emailInput = $('#newsletter-email');
    const storageKey = 'subscribedEmails';
    const cooldownKey = 'newsletterCooldown';
    const cooldownMs = 15000;

    $form.on('submit', function (e) {
        e.preventDefault();

        const email = $emailInput.val().trim();

        if (!isValidEmail(email)) {
            return notify("Please enter a valid Email Address", "error");
        }

        if (isInCooldown()) {
            return notify("Please wait a few seconds before Subscribing Again", "warn");
        }

        const emails = StorageWrapper.get(storageKey) || [];

        if (emails.includes(email)) {
            return notify("You are already Subscribed", "warn");
        }

        emails.push(email);
        StorageWrapper.set(storageKey, emails, 'local');
        setCooldown();

        notify("Thank you for subscribing to our Newsletter!", "success");
        $emailInput.val('');
    });

    function isValidEmail(email) {
        const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(email);
    }

    function notify(message, type) {
        $.notify(message, {
            className: type,
            position: "top right",
            autoHideDelay: 3000
        });
    }

    function setCooldown() {
        StorageWrapper.set(cooldownKey, Date.now(), 'local');
    }

    function isInCooldown() {
        const lastTime = StorageWrapper.get(cooldownKey);
        return lastTime && Date.now() - lastTime < cooldownMs;
    }
});