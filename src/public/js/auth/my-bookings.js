(async () => {
    const $container = $('#booking-card-container');
    $container.empty(); // Clear existing content

    // Get the current logged-in user
    const currentUser = await ClientStorageSolutions.getCurrentUser();
    if (!currentUser)
        return $.notify("No Active Session Found", { className: 'error', position: 'top right' });

    // Fetch all bookings for the user
    const bookings = await ClientStorageSolutions.fetchBookings({ userID: currentUser.userID }) || [];
    if (bookings.length === 0)
        return $container.append(`<p class="text-center">No Bookings Yet</p>`);

    // Loop through each booking
    for (const booking of bookings) {
        const flight = booking.flight;
        if (!flight) continue; // Skip if flight data is missing

        const departed = new Date(flight.departureTime) <= new Date(); // Check if flight has departed
        const cancelled = flight.status === 'Cancelled'; // Check if flight is cancelled

        // Construct booking card HTML
        const card = `
            <div class="booking-card-large">
                <div class="booking-card-header">
                    <h3><i class="fas fa-plane"></i> ${flight.origin} → ${flight.destination}</h3>
                    <span class="booking-status ${flight.status.toLowerCase().replace(/\s+/g, '-')}">
                        <i class="fas fa-info-circle"></i> ${flight.status}
                    </span>
                </div>

                <div class="booking-card-body">
                    <p><strong>Departure:</strong> ${new Date(flight.departureTime).toLocaleString()}</p>
                    <p><strong>Arrival:</strong> ${new Date(flight.arrivalTime).toLocaleString()}</p>
                </div>

                ${!departed && !cancelled ? `
                    <button class="cancel-btn cancel-flight" data-booking-id="${booking.bookingID}" data-flight-id="${flight.flightID}">
                        <i class="fas fa-times-circle"></i> Cancel Booking
                    </button>
                ` : `
                    <div class="booking-locked">
                        <i class="fas fa-lock"></i> ${cancelled ? 'Flight Cancelled' : 'Flight Departed'}
                    </div>
                `}
            </div>
        `;

        // Append booking card to the container
        $container.append(card);
    }

    // Handle cancellation click
    $(document).on('click', '.cancel-flight', async function (e) {
        e.preventDefault();

        const $btn = $(this);
        const flightID = $btn.data('flight-id');
        const bookingID = $btn.data('booking-id');

        // Re-check session and data validity
        const currentUser = await ClientStorageSolutions.getCurrentUser();
        if (!currentUser || !bookingID || !flightID)
            return $.notify("Cancellation failed", { className: 'error', position: 'top right' });

        // Refetch flight info to get distance
        const flight = await ClientStorageSolutions.fetchFlights(flightID);
        if (!flight || isNaN(flight.distance))
            return $.notify("Flight info invalid", { className: 'error', position: 'top right' });

        // Delete booking
        await ClientStorageSolutions.deleteBookings({ bookingID });

        // Calculate points to deduct based on user tier
        let multiplier = 1;
        if (currentUser.points >= 30000) multiplier = 1.5;
        else if (currentUser.points >= 15000) multiplier = 1.25;

        const pointCost = Math.floor(flight.distance * multiplier);
        await ClientStorageSolutions.editUser(currentUser.userID, { points: Math.max(0, currentUser.points - pointCost) });

        // Set notification and reload page
        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: `Booking cancelled. ${pointCost} points deducted.`
        });

        location.reload();
    });
})();