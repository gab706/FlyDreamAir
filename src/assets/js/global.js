$(document).ready(async function () {
    try {
        await Component.defineFromURL('fly-navbar', '../../components/navbar/navbar.html');
    } catch (_) {}

    try {
        await Component.defineFromURL('fly-footer', '../../components/footer/footer.html');
    } catch (_) {}

    console.log(
        "%c✈️ Welcome to FlyDreamAir!",
        "color: #8E1616; font-size: 16px; font-weight: bold;"
    );
});