(async () => {
    // Get the current logged-in user
    const currentUser = await ClientStorageSolutions.getCurrentUser();

    // If no session found, notify and exit
    if (!currentUser)
        return $.notify("No Active Session Found", { className: 'error', position: 'top right' });

    // Fetch bookings and rewards in parallel
    const [bookings, rewards] = await Promise.all([
        ClientStorageSolutions.fetchBookings({ userID: currentUser.userID }),
        ClientStorageSolutions.fetchRewards()
    ]);

    const points = currentUser.points || 0;

    // --- Upcoming Flight Section ---
    const $flightCard = $('#upcoming-flight-card');
    const $flightLoading = $('#upcoming-flight-loading');
    $flightLoading.remove();

    // Find the nearest upcoming booking
    const upcomingBooking = (bookings || [])
        .filter(b => b.flight && new Date(b.flight.departureTime) > new Date())
        .sort((a, b) => new Date(a.flight.departureTime) - new Date(b.flight.departureTime))[0];

    // Display appropriate message or upcoming flight info
    if (!upcomingBooking || !upcomingBooking.flight) {
        $flightCard.append(`<p class="text-center"><i class="fas fa-ban"></i> No Upcoming Flights</p>`);
    } else {
        const flight = upcomingBooking.flight;
        const distance = flight.distance || 0;

        // Calculate point multiplier by tier
        let multiplier = 1;
        if (points >= 30000) multiplier = 1.5;
        else if (points >= 15000) multiplier = 1.25;

        const potentialPoints = Math.round(distance * multiplier);

        // Construct and insert flight details
        const html = `
            <div class="flight-details">
                <div class="flight-route">
                    <i class="fas fa-plane"></i>
                    <span><strong>${flight.origin}</strong> → <strong>${flight.destination}</strong></span>
                </div>
                <div class="flight-info-pair">
                    <div class="flight-time">
                        <i class="fas fa-clock"></i>
                        <span>Departure: ${new Date(flight.departureTime).toLocaleString()}</span>
                    </div>
                    <div class="flight-time">
                        <i class="fas fa-clock"></i>
                        <span>Arrival: ${new Date(flight.arrivalTime).toLocaleString()}</span>
                    </div>
                </div>
                <div class="flight-meta-row">
                    <div class="flight-meta">
                        <i class="fas fa-info-circle"></i>
                        <span>Status: ${flight.status}</span>
                    </div>
                    <div class="flight-meta">
                        <i class="fas fa-star"></i>
                        <span>Points: ${potentialPoints}</span>
                    </div>
                </div>
            </div>
        `;
        $flightCard.append(html);
    }

    // --- Reward Grid Section ---
    const $rewardGrid = $('#reward-grid');
    const $pagination = $('#reward-pagination');

    const rewardsPerPage = 4;
    let currentPage = 1;

    // Renders the rewards for the current page
    function renderRewardsPage(page = 1) {
        $rewardGrid.empty();
        $pagination.empty();

        const start = (page - 1) * rewardsPerPage;
        const end = start + rewardsPerPage;
        const pageRewards = rewards.slice(start, end);

        // No rewards to show
        if (!pageRewards.length) {
            $rewardGrid.append(`<p class="text-center dashboard-reward-empty"><i class="fas fa-ban"></i> No rewards available at the moment.</p>`);
            return;
        }

        // Build each reward card
        pageRewards.forEach(r => {
            const tierEligible = (r.tier === 'Silver') ||
                (r.tier === 'Gold' && points >= 15000) ||
                (r.tier === 'Platinum' && points >= 30000);

            const purchaseEligible = r.purchasable && r.price && points >= r.price;

            const eligible = tierEligible || purchaseEligible;

            const card = `
            <div class="dashboard-reward-card ${eligible ? '' : 'disabled'}">
                <div class="dashboard-reward-image">
                    <img src="${r.image}" alt="${r.name}" />
                </div>
                <div class="dashboard-reward-body">
                    <h4>${r.name}</h4>
                    <p class="dashboard-reward-desc">${r.description}</p>
                    <p class="dashboard-reward-type"><strong>Type:</strong> ${r.type}</p>
                    <div class="dashboard-reward-meta">
                        <span class="tier-pill ${r.tier.toLowerCase()}">${r.tier}</span>
                        ${r.purchasable ? `<span class="dashboard-reward-price">${r.price} pts</span>` : ''}
                    </div>
                    ${!eligible ? `
                        <div class="dashboard-reward-locked">
                            <i class="fas fa-lock"></i> Not eligible
                        </div>` : ''}
                    </div>
                </div>
            `;
            $rewardGrid.append(card);
        });

        // Render pagination
        const totalPages = Math.ceil(rewards.length / rewardsPerPage);
        if (totalPages > 1) {
            for (let i = 1; i <= totalPages; i++) {
                const active = i === page ? 'style="font-weight:bold; text-decoration:underline;"' : '';
                $pagination.append(`<a href="#" class="reward-page-btn" data-page="${i}" ${active}>${i}</a> `);
            }
        }
    }

    renderRewardsPage(currentPage);

    // Pagination button click
    $pagination.on('click', '.reward-page-btn', function (e) {
        e.preventDefault();
        const page = parseInt($(this).data('page'));
        if (page !== currentPage) {
            currentPage = page;
            renderRewardsPage(currentPage);
        }
    });
})();