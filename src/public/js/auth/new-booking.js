(async () => {
    const $form = $('#search-flight-form');
    const $results = $('#flight-search-results');
    const currentUser = await ClientStorageSolutions.getCurrentUser();

    // Handle flight search form submission
    $form.on('submit', async function (e) {
        e.preventDefault();
        $results.empty();

        const from = this.from.value.trim().toLowerCase();
        const to = this.to.value.trim().toLowerCase();
        const when = new Date(this.when.value);

        // Basic form validation
        const isWhenValid = !isNaN(when);
        if (!from && !to && !isWhenValid) {
            return $.notify("Please enter at least one search criteria (From, To, or When).", {
                className: 'error',
                position: 'top right'
            });
        }

        const flights = await ClientStorageSolutions.fetchFlights();
        const bookings = await ClientStorageSolutions.fetchBookings({ userID: currentUser.userID }) || [];
        const bookedFlightIDs = bookings.map(b => b.flightID);
        const now = new Date();

        // Filter matching flights
        const matches = flights.filter(flight => {
            const dep = new Date(flight.departureTime);
            const originMatch = from ? flight.origin.toLowerCase().includes(from) : true;
            const destMatch = to ? flight.destination.toLowerCase().includes(to) : true;
            const dateMatch = isWhenValid
                ? Math.abs(new Date(dep.toDateString()) - new Date(when.toDateString())) <= 86400000
                : true;

            return (
                dep >= now &&
                flight.status.toLowerCase() !== 'cancelled' &&
                originMatch &&
                destMatch &&
                dateMatch &&
                !bookedFlightIDs.includes(flight.flightID)
            );
        });

        // Notify if no matches
        if (!matches.length) {
            return $.notify("No matching flights found.", { className: 'info', position: 'top right' });
        }

        // Render results
        matches.forEach(flight => {
            const PRICE_PER_MILE = 0.75;
            const price = (flight.distance * PRICE_PER_MILE).toFixed(2);
            $results.append(`
                <div class="booking-card-large">
                    <div class="booking-card-header">
                        <h3><i class="fas fa-plane"></i> ${flight.origin} → ${flight.destination}</h3>
                        <span class="booking-status ${flight.status.toLowerCase().replace(/\s+/g, '-')}">
                            <i class="fas fa-dollar-sign"></i>${price}
                        </span>
                    </div>
                    <div class="booking-card-body">
                        <p><strong>Departure:</strong> ${new Date(flight.departureTime).toLocaleString()}</p>
                        <p><strong>Arrival:</strong> ${new Date(flight.arrivalTime).toLocaleString()}</p>
                    </div>
                    <button class="cancel-btn book-now-btn" data-flight-id="${flight.flightID}">
                        <i class="fas fa-check-circle"></i> Book Now
                    </button>
                </div>
            `);
        });
    });

    // Handle booking confirmation
    $(document).on('click', '.book-now-btn', async function () {
        const flightID = $(this).data('flight-id');

        // Basic validation
        if (!currentUser || !flightID) {
            return $.notify("Unable to book flight. Please try again.", { className: 'error', position: 'top right' });
        }

        const flight = await ClientStorageSolutions.fetchFlights(flightID);
        if (!flight || isNaN(flight.distance)) {
            return $.notify("Flight data is missing or invalid.", { className: 'error', position: 'top right' });
        }

        // Calculate points earned based on user's tier
        let multiplier = 1;
        if (currentUser.points >= 30000) multiplier = 1.5;
        else if (currentUser.points >= 15000) multiplier = 1.25;

        const earnedPoints = Math.floor(flight.distance * multiplier);
        const newPoints = currentUser.points + earnedPoints;

        // Save booking and update user points
        await ClientStorageSolutions.createBooking({
            userID: currentUser.userID,
            flightID
        });

        await ClientStorageSolutions.editUser(currentUser.userID, {
            points: newPoints
        });

        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: `Flight booked successfully! You've earned ${earnedPoints} points.`
        });

        // Redirect to bookings page
        location.replace('/my-bookings');
    });
})();