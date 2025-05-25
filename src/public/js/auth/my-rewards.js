$(async () => {
    const currentUser = await ClientStorageSolutions.getCurrentUser();
    if (!currentUser) {
        return $.notify("No Active Session Found", { className: 'error', position: 'top right' });
    }

    let selectedRewardID = null;
    const PAGE_LIMIT = 4;

    const $modal = $('#apply-reward-modal');
    const $form = $('#apply-reward-form');
    const $select = $form.find('select[name="bookingID"]');

    const allRewards = await ClientStorageSolutions.fetchRewards();
    const rewardRecords = await ClientStorageSolutions.fetchRewardRecords({ userID: currentUser.userID }) || [];
    const userBookings = await ClientStorageSolutions.fetchBookings({ userID: currentUser.userID }) || [];

    const claimedIDs = rewardRecords.map(r => r.rewardID);
    const claimedMap = new Map(rewardRecords.map(r => [r.rewardID, r]));

    const availableRewards = allRewards.filter(r => !claimedIDs.includes(r.id));
    const claimedRewards = allRewards.filter(r => claimedIDs.includes(r.id));

    function paginate(items, page) {
        const offset = (page - 1) * PAGE_LIMIT;
        return items.slice(offset, offset + PAGE_LIMIT);
    }

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

    $('#close-reward-modal').on('click', () => {
        $modal.addClass('hidden');
        selectedRewardID = null;
    });

    $form.on('submit', async function (e) {
        e.preventDefault();

        const bookingID = $select.val();
        const booking = userBookings.find(b => b.bookingID === bookingID);
        if (!booking || !selectedRewardID) return;

        await ClientStorageSolutions.createRewardRecord({
            rewardID: selectedRewardID,
            bookingID,
            flightID: booking.flightID,
            userID: currentUser.userID
        });

        $.notify("Reward applied successfully!", { className: 'success', position: 'top right' });
        $modal.addClass('hidden');
        selectedRewardID = null;
        location.reload();
    });

    $('#available-rewards').on('click', '.reward-click', function () {
        const rewardID = $(this).data('reward-id');
        openRewardModal(rewardID);
    });

    renderAvailable();
    renderClaimed();
});