(async () => {
    const $pinBtn = $('#pinToggleBtn');

    // Get details of the current page (name, icon class, path)
    const currentPage = {
        name: $('.header-text h1').text().trim(),
        icon: $('.icon-square i').attr('class'),
        href: window.location.pathname
    };

    // Fetch the currently active user session
    const currentUser = await ClientStorageSolutions.getCurrentUser();

    // Notify if no active session is found (user not logged in)
    if (!currentUser)
        return $.notify("No Active Session Found", { className: 'error', position: 'top right' });

    // If current page is already pinned, visually mark the pin button as active
    if (currentUser.pinned_pages?.some(p => p.href === currentPage.href))
        $pinBtn.addClass('active');

    // Toggle pin/unpin on button click
    $pinBtn.on('click', async () => {
        currentUser.pinned_pages = currentUser.pinned_pages || [];

        const isPinned = currentUser.pinned_pages.some(p => p.href === currentPage.href);

        let message;

        if (!isPinned) {
            // Limit user to 3 pinned pages
            if (currentUser.pinned_pages.length >= 3)
                return $.notify("You can only pin up to 3 pages.", { className: 'error', position: 'top right' });

            // Pin the current page
            currentUser.pinned_pages.push(currentPage);
            $pinBtn.addClass('active');
            message = `Page "${currentPage.name}" has been pinned to your dashboard.`;
        } else {
            // Unpin the current page
            currentUser.pinned_pages = currentUser.pinned_pages.filter(p => p.href !== currentPage.href);
            $pinBtn.removeClass('active');
            message = `Page "${currentPage.name}" has been unpinned from your dashboard.`;
        }

        // Persist changes and show a notification on page reload
        await ClientStorageSolutions.editUser(currentUser.userID, { pinned_pages: currentUser.pinned_pages });
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message
        });

        // Reload to reflect the change immediately
        location.reload();
    });
})();