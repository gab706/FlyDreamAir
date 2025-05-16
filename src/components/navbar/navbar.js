$(document).ready(function () {
    $('#logo-container').on('mouseenter', function () {
        const $plane = $('#plane');
        const $text = $('#trail-text');

        $plane.removeClass('plane-animate');
        $text.removeClass('trail-animate');

        void $plane[0].offsetWidth;
        void $text[0].offsetWidth;

        $plane.addClass('plane-animate');
        $text.addClass('trail-animate');
    });
});