$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);

    const code = params.get("code");
    const message = params.get("message");
    const detail = params.get("detail");

    if (code)
        $("#error-code").text(`Error ${code}`);
    if (message)
        $("#error-message").text(message);
    if (detail)
        $("#error-detail").text(detail);

    if (code && message)
        document.title = `FlyDreamAir | Error ${code} - ${message}`;
    else if (code)
        document.title = `FlyDreamAir | Error ${code}`;
    else if (message)
        document.title = `FlyDreamAir | ${message}`;
    else
        document.title = `FlyDreamAir | Error`;
});