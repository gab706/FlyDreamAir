$(document).ready(async function () {
    await Component.defineFromURL('fly-navbar', `${window.location.origin}/src/components/navbar/navbar.html`);
    await Component.defineFromURL('hero-bg', `${window.location.origin}/src/components/hero-bg//hero-bg.html`);
    await Component.defineFromURL('services-section', `${window.location.origin}/src/components/services-section/services-section.html`);
    await Component.defineFromURL('fly-testimonials', `${window.location.origin}/src/components/testimonials/testimonials.html`);
    await Component.defineFromURL('fly-footer', `${window.location.origin}/src/components/footer/footer.html`);

    console.log(
        "%c✈️ Welcome to FlyDreamAir!",
        "color: #8E1616; font-size: 16px; font-weight: bold;"
    );
});