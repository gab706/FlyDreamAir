(async () => {
    const pageHeader = document.querySelector('.page-header');

    if (pageHeader?.dataset.mobileRestricted === 'true' && window.innerWidth < 800) {
        document.body.replaceChildren();
        document.body.classList.add('mobile-restricted');

        const overlay = document.createElement('div');
        overlay.className = 'mobile-restriction-overlay';

        const content = document.createElement('div');
        content.className = 'mobile-restriction-overlay__content';

        const title = document.createElement('p');
        title.className = 'mobile-restriction-overlay__title';
        title.textContent = 'This page is not available on small screens at the moment.';

        const message = document.createElement('p');
        message.className = 'mobile-restriction-overlay__message';
        message.textContent = 'Please access it on a desktop or device with a screen width of at least 800 pixels.';

        content.append(title, message);
        overlay.append(content);
        document.body.append(overlay);
        return;
    }

    const $pinBtn = $('#pinToggleBtn');

    const currentPage = {
        name: $('.header-text h1').text().trim(),
        icon: $('.icon-square i').attr('class'),
        href: window.location.pathname
    };

    const currentUser = await ClientStorageSolutions.getCurrentUser();

    if (!currentUser)
        return $.notify("No Active Session Found", { className: 'error', position: 'top right' });

    if (currentUser.pinned_pages?.some(p => p.href === currentPage.href))
        $pinBtn.addClass('active');

    $pinBtn.on('click', async () => {
        currentUser.pinned_pages = currentUser.pinned_pages || [];

        const isPinned = currentUser.pinned_pages.some(p => p.href === currentPage.href);

        let message;

        if (!isPinned) {
            if (currentUser.pinned_pages.length >= 3)
                return $.notify("You can only pin up to 3 pages.", { className: 'error', position: 'top right' });

            currentUser.pinned_pages.push(currentPage);
            $pinBtn.addClass('active');
            message = `Page "${currentPage.name}" has been pinned to your dashboard.`;
        } else {
            currentUser.pinned_pages = currentUser.pinned_pages.filter(p => p.href !== currentPage.href);
            $pinBtn.removeClass('active');
            message = `Page "${currentPage.name}" has been unpinned from your dashboard.`;
        }

        await ClientStorageSolutions.editUser(currentUser.userID, { pinned_pages: currentUser.pinned_pages });
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message
        });

        location.reload();
    });
})();
