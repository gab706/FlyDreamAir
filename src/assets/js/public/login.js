$(document).ready(function () {
    const video = $('#bg-video')[0];
    video.pause();

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    $(".pane").each(function (index) {
        const $pane = $(this);
        const target = $pane.data("letter");
        let count = 0;

        const flipInterval = setInterval(function () {
            if (target === " ") {
                $pane.text(" ");
                return clearInterval(flipInterval);
            }

            const randomChar = characters[Math.floor(Math.random() * characters.length)];
            $pane.text(randomChar);
            count++;

            if (count > 10 + index * 2) {
                $pane.text(target);
                clearInterval(flipInterval);
            }
        }, 40);
    });

    $('#login-form').on('submit', function (e) {
        e.preventDefault();

        video.play();

        $('#login-card').css('display', 'none');

        setTimeout(() => {
            window.location.replace("/pages/public/index.html");
        }, 5000);
    });

    $('#forgot-password').on('click', function (e) {
        e.preventDefault();

        $.notify('A Forgot Password email has been Sent', {
            className: 'success',
            position: "top right",
            autoHideDelay: 3000
        });
    });
});