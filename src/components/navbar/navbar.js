$(document).ready(function () {
    const $plane = $('#plane');
    const $text = $('#trail-text');

    $('#logo-container').on('mouseenter', () => {
        $plane.removeClass('plane-animate');
        $text.removeClass('trail-animate');

        $plane[0]?.offsetWidth;
        $text[0]?.offsetWidth;

        $plane.addClass('plane-animate');
        $text.addClass('trail-animate');
    });
});