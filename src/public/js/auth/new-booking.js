(async () => {
    const $form = $('#search-flight-form');
    const $results = $('#flight-search-results');
    const currentUser = await ClientStorageSolutions.getCurrentUser();

    $form.on('submit', async function (e) {
        e.preventDefault();
        $results.empty();

        const from = this.from.value.trim().toLowerCase();
        const to = this.to.value.trim().toLowerCase();
        const when = new Date(this.when.value);

        if (!from || !to || isNaN(when)) {
            return $.notify("Please fill out all fields correctly", { className: 'error', position: 'top right' });
        }

        const flights = await ClientStorageSolutions.fetchFlights();
        const bookings = await ClientStorageSolutions.fetchBookings({ userID: currentUser.userID }) || [];
        const bookedFlightIDs = bookings.map(b => b.flightID);
        const now = new Date();

        const matches = flights.filter(flight => {
            const dep = new Date(flight.departureTime);
            const originMatch = flight.origin.toLowerCase().includes(from);
            const destMatch = flight.destination.toLowerCase().includes(to);
            return (
                dep >= now &&
                flight.status.toLowerCase() !== 'cancelled' &&
                originMatch &&
                destMatch &&
                !bookedFlightIDs.includes(flight.flightID)
            );
        });

        if (!matches.length) {
            return $.notify("No matching flights found.", { className: 'info', position: 'top right' });
        }

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

    $(document).on('click', '.book-now-btn', async function () {
        const flightID = $(this).data('flight-id');

        if (!currentUser || !flightID) {
            return $.notify("Unable to book flight. Please try again.", { className: 'error', position: 'top right' });
        }

        const flight = await ClientStorageSolutions.fetchFlights(flightID);
        if (!flight || isNaN(flight.distance)) {
            return $.notify("Flight data is missing or invalid.", { className: 'error', position: 'top right' });
        }

        let multiplier = 1;
        if (currentUser.points >= 30000) multiplier = 1.5;
        else if (currentUser.points >= 15000) multiplier = 1.25;

        const earnedPoints = Math.floor(flight.distance * multiplier);
        const newPoints = currentUser.points + earnedPoints;

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

        location.replace('/my-bookings');
    });
})();