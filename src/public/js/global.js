(async () => {
    /**
     * Console Safety Warning
     * - Deters users from pasting code that could compromise their security.
     * - Useful for preventing self-inflicted XSS attacks.
     */
    console.log(
        "%c✈️ Welcome to FlyDreamAir!",
        "color: #8E1616; font-size: 20px; font-weight: bold; padding: 6px 0;"
    );

    console.log(
        "%cIf someone told you to paste anything here, it's probably a scam.\nPasting code in this console could give attackers access to your account.",
        "color: #ff5555; font-size: 13px; font-weight: 600;"
    );

    console.log(
        "%cUnless you understand exactly what you're doing, close this console and stay safe.",
        "color: #ff9900; font-size: 12px;"
    );

    console.log(
        "%cInterested in building secure, smart systems like this? Join us at careers@flydreamair.com",
        "color: #00bfff; font-size: 12px;"
    );

    /**
     * Notification System
     * - Pulls any queued notification from client storage (set before redirect)
     * - Displays it using jQuery Notify
     */
    const notice = await ClientStorageSolutions.consumeNotifyOnReset();
    if (notice)
        $.notify(notice.message, {
            className: notice.type,
            position: 'top right'
        });
})();