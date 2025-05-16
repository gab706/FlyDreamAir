$(document).ready(async function () {
    await Component.defineFromURL('fly-navbar', 'https://gab706.github.io/FlyDreamAir/components/navbar/navbar.html');
    await Component.defineFromURL('hero-bg', 'https://gab706.github.io/FlyDreamAir/components/hero-bg/hero-bg.html');
    await Component.defineFromURL('services-section', 'https://gab706.github.io/FlyDreamAir/components/services-section/services-section.html');
    await Component.defineFromURL('fly-testimonials', 'https://gab706.github.io/FlyDreamAir/components/testimonials/testimonials.html');
    await Component.defineFromURL('fly-footer', 'https://gab706.github.io/FlyDreamAir/components/footer/footer.html');

    console.log(
        "%c✈️ Welcome to FlyDreamAir!",
        "color: #8E1616; font-size: 16px; font-weight: bold;"
    );
});