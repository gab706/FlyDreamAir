$(async () => {
    // Ensure there's a logged-in user
    const currentUser = await ClientStorageSolutions.getCurrentUser();
    if (!currentUser) {
        return $.notify("No Active Session Found", { className: 'error', position: 'top right' });
    }

    let selectedRewardID = null;
    const PAGE_LIMIT = 4;

    const $modal = $('#apply-reward-modal');
    const $form = $('#apply-reward-form');
    const $select = $form.find('select[name="bookingID"]');

    // Fetch all user-related data
    const userBookings = await ClientStorageSolutions.fetchBookings({ userID: currentUser.userID }) || [];
    const allRewards = await ClientStorageSolutions.fetchRewards();
    const rewardRecords = await ClientStorageSolutions.fetchRewardRecords({ userID: currentUser.userID }) || [];

    // Track claimed rewards
    const claimedIDs = rewardRecords.map(r => r.rewardID);
    const claimedMap = new Map(rewardRecords.map(r => [r.rewardID, r]));

    // Helper: Determine user's tier
    function getTier(points) {
        if (points >= 30000) return 'platinum';
        if (points >= 15000) return 'gold';
        return 'silver';
    }

    const tierPriority = { silver: 1, gold: 2, platinum: 3 };
    const userTier = getTier(currentUser.points);

    // Filter rewards eligible for claiming or purchase
    const availableRewards = allRewards.filter(r => {
        const rewardTier = r.tier.toLowerCase();
        const tierEligible = tierPriority[userTier] >= tierPriority[rewardTier];
        const purchasableEligible = r.purchasable && r.price && currentUser.points >= r.price;
        const notClaimed = !claimedIDs.includes(r.id);
        return notClaimed && (tierEligible || purchasableEligible);
    });

    const claimedRewards = allRewards.filter(r => claimedIDs.includes(r.id));

    // Paginate helper
    function paginate(items, page) {
        const offset = (page - 1) * PAGE_LIMIT;
        return items.slice(offset, offset + PAGE_LIMIT);
    }

    // Render pagination and hook events
    function renderPagination(containerID, items, currentPage, callback) {
        const totalPages = Math.ceil(items.length / PAGE_LIMIT);
        const $pagination = $(`#${containerID}`).empty();

        for (let i = 1; i <= totalPages; i++) {
            $pagination.append(`<a href="#" class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`);
        }

        $pagination.find('a').on('click', function (e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            callback(page);
        });
    }

    // Render available rewards
    function renderAvailable(page = 1) {
        const $container = $('#available-rewards').empty();
        const items = paginate(availableRewards, page);

        items.forEach(reward => {
            $container.append(`
                <div class="dashboard-reward-card reward-click" data-reward-id="${reward.id}">
                    <div class="dashboard-reward-image">
                        <img src="${reward.image}" alt="${reward.name}">
                    </div>
                    <div class="dashboard-reward-body">
                        <h4>${reward.name}</h4>
                        <p class="dashboard-reward-desc">${reward.description}</p>
                        <p class="dashboard-reward-type">Type: ${reward.type}</p>
                        <div class="dashboard-reward-meta">
                            ${reward.price != null ? `<span class="dashboard-reward-price">${reward.price} pts</span>` : ''}
                            <span class="tier-pill ${reward.tier.toLowerCase()}">${reward.tier}</span>
                        </div>
                    </div>
                </div>
            `);
        });

        renderPagination('available-pagination', availableRewards, page, renderAvailable);
    }

    // Render claimed rewards
    function renderClaimed(page = 1) {
        const $container = $('#claimed-rewards').empty();
        const items = paginate(claimedRewards, page);

        items.forEach(reward => {
            const record = claimedMap.get(reward.id);

            $container.append(`
                <div class="dashboard-reward-card disabled">
                    <div class="dashboard-reward-image">
                        <img src="${reward.image}" alt="${reward.name}">
                    </div>
                    <div class="dashboard-reward-body">
                        <h4>${reward.name}</h4>
                        <p class="dashboard-reward-desc">${reward.description}</p>
                        <p class="dashboard-reward-type">Type: ${reward.type}</p>
                        <div class="dashboard-reward-meta">
                            <span class="dashboard-reward-price">Claimed</span>
                            <span class="tier-pill ${reward.tier.toLowerCase()}">${reward.tier}</span>
                        </div>
                        <div class="dashboard-reward-locked">
                            <i class="fas fa-plane-departure"></i>
                            Claimed on Flight: <strong>${record?.flightID || '—'}</strong>
                        </div>
                    </div>
                </div>
            `);
        });

        renderPagination('claimed-pagination', claimedRewards, page, renderClaimed);
    }

    // Open reward modal and populate booking options
    function openRewardModal(rewardID) {
        const eligibleBookings = userBookings.filter(b => b?.flight);

        if (eligibleBookings.length === 0) {
            $.notify("You have no eligible bookings to apply this reward to.", {
                className: 'error',
                position: 'top right'
            });
            return;
        }

        selectedRewardID = rewardID;
        $select.empty().prop('disabled', false);

        eligibleBookings.forEach(b => {
            const flight = b.flight;
            $select.append(`<option value="${b.bookingID}">
                Flight ${flight.flightID}: ${flight.origin} → ${flight.destination} (${new Date(flight.departureTime).toLocaleDateString()})
            </option>`);
        });

        $modal.removeClass('hidden');
    }

    // Modal close button
    $('#close-reward-modal').on('click', () => {
        $modal.addClass('hidden');
        selectedRewardID = null;
    });

    // Handle reward application
    $form.on('submit', async function (e) {
        e.preventDefault();

        const bookingID = $select.val();
        const booking = userBookings.find(b => b.bookingID === bookingID);
        if (!booking || !selectedRewardID)
            return;

        const reward = availableRewards.find(r => r.id === selectedRewardID);
        if (!reward)
            return;

        const userTier = (function getTier(points) {
            if (points >= 30000) return 'platinum';
            if (points >= 15000) return 'gold';
            return 'silver';
        })(currentUser.points);

        const tierPriority = { silver: 1, gold: 2, platinum: 3 };
        const rewardTierPriority = tierPriority[reward.tier.toLowerCase()] || 0;
        const userTierPriority = tierPriority[userTier] || 0;

        // Deduct points if not eligible by tier
        if (reward.purchasable && reward.price && userTierPriority < rewardTierPriority) {
            currentUser.points = Math.max(0, currentUser.points - reward.price);
            await ClientStorageSolutions.editUser(currentUser.userID, { points: currentUser.points });
        }

        // Create reward record
        await ClientStorageSolutions.createRewardRecord({
            rewardID: selectedRewardID,
            bookingID,
            flightID: booking.flightID,
            userID: currentUser.userID
        });

        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: 'Successfully applied reward!'
        });
        $modal.addClass('hidden');
        selectedRewardID = null;
        location.reload();
    });

    // Hook reward card clicks
    $('#available-rewards').on('click', '.reward-click', function () {
        const rewardID = $(this).data('reward-id');
        openRewardModal(rewardID);
    });

    // Initial render
    renderAvailable();
    renderClaimed();
});