$(document).ready(async function () {
    try {
        await Component.defineFromURL('fly-navbar', '../../components/navbar/navbar.html');
    } catch (_) {}

    try {
        await Component.defineFromURL('fly-footer', '../../components/footer/footer.html');
    } catch (_) {}

    try {
        await Component.defineFromURL('rewards-hero', '../../components/secondary-hero/secondary-hero.html',
            {
                title: 'FlyDreamAir Rewards',
                description: 'Earn points, enjoy perks, and travel better every time you fly.',
                backgroundImage: '../../assets/images/backgrounds/hero-rewards.jpg'
            });
    } catch (_) {}

    try {
        await Component.defineFromURL('locations-hero', '../../components/secondary-hero/secondary-hero.html',
            {
                title: 'Locations',
                description: 'From bustling cities to tropical escapes, explore our global destinations and plan your perfect journey.',
                backgroundImage: '../../assets/images/backgrounds/hero-where-we-go.jpg'
            });
    } catch (_) {}

    console.log(
        "%c✈️ Welcome to FlyDreamAir!",
        "color: #8E1616; font-size: 16px; font-weight: bold;"
    );
});