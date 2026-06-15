window.FlyDreamAir = window.FlyDreamAir || {};
window.FlyDreamAir.escapeHTML = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

(async () => {
    const notice = await ClientStorageSolutions.consumeNotifyOnReset();
    if (notice)
        $.notify(notice.message, {
            className: notice.type,
            position: 'top right'
        });
})();
