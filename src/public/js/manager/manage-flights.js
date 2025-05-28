(async () => {
    // Cache selectors for performance
    const $tableBody = $('#flight-table-body');
    const $pagination = $('#flight-pagination');

    // Fetch all flights and determine current pagination state
    const flights = await ClientStorageSolutions.fetchFlights() || [];
    const page = parseInt(new URLSearchParams(window.location.search).get('page')) || 1;
    const flightsPerPage = 10;
    const totalPages = Math.ceil(flights.length / flightsPerPage);
    const paginatedFlights = flights.slice((page - 1) * flightsPerPage, page * flightsPerPage);

    // Clear table before rendering
    $tableBody.empty();

    // Render table or show empty message
    if (paginatedFlights.length === 0) {
        $tableBody.append(`
            <tr>
                <td colspan="8" class="text-center">
                    <div class="loading-placeholder">No Flights Yet</div>
                </td>
            </tr>
        `);
    } else {
        paginatedFlights.forEach(flight => {
            $tableBody.append(`
                <tr>
                    <td>${flight.flightID}</td>
                    <td>${flight.origin}</td>
                    <td>${flight.destination}</td>
                    <td>${new Date(flight.departureTime).toLocaleString()}</td>
                    <td>${new Date(flight.arrivalTime).toLocaleString()}</td>
                    <td>${flight.distance}</td>
                    <td>${flight.status}</td>
                    <td>
                        <div class="table-actions">
                            <i class="fas fa-edit action-edit-flight" data-flight-id="${flight.flightID}" title="Edit"></i>
                            <i class="fas fa-trash action-delete-flight" data-flight-id="${flight.flightID}" title="Delete"></i>
                        </div>
                    </td>
                </tr>
            `);
        });
    }

    // Generate pagination controls
    $pagination.empty();
    if (totalPages > 1) {
        if (page > 1)
            $pagination.append(`<a href="?page=${page - 1}">&laquo; Prev</a>`);

        for (let i = 1; i <= totalPages; i++) {
            const active = (i === page) ? 'active' : '';
            $pagination.append(`<a href="?page=${i}" class="${active}">${i}</a>`);
        }

        if (page < totalPages)
            $pagination.append(`<a href="?page=${page + 1}">Next &raquo;</a>`);
    }

    // Show flight creation modal
    $('#open-create-flight-modal').on('click', () => {
        $('#create-flight-modal').removeClass('hidden');
    });

    // Hide creation modal
    $('#close-create-flight-modal').on('click', () => {
        $('#create-flight-modal').addClass('hidden');
    });

    // Show edit modal with populated fields
    $(document).on('click', '.action-edit-flight', async function () {
        const flightID = $(this).data('flight-id');
        const flight = await ClientStorageSolutions.fetchFlights(flightID);
        if (!flight) return;

        const $form = $('#edit-flight-form');
        $form.find('[name="flightID"]').val(flight.flightID);
        $form.find('[name="origin"]').val(flight.origin);
        $form.find('[name="destination"]').val(flight.destination);
        $form.find('[name="departureTime"]').val(flight.departureTime);
        $form.find('[name="arrivalTime"]').val(flight.arrivalTime);
        $form.find('[name="distance"]').val(flight.distance);
        $form.find('[name="status"]').val(flight.status);

        $('#edit-flight-modal').removeClass('hidden');
    });

    // Hide edit modal
    $('#close-edit-flight-modal').on('click', () => {
        $('#edit-flight-modal').addClass('hidden');
    });

    // Handle flight creation
    $('#create-flight-form').on('submit', async function (e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this).entries());
        data.distance = parseInt(data.distance);

        await ClientStorageSolutions.createFlight(data);
        await ClientStorageSolutions.setNotifyOnReset({ type: 'success', message: 'Flight created successfully.' });
        location.reload();
    });

    // Handle flight update
    $('#edit-flight-form').on('submit', async function (e) {
        e.preventDefault();

        const form = $(this);
        const flightID = form.find('[name="flightID"]').val();
        const updates = Object.fromEntries(new FormData(this).entries());
        delete updates.flightID;
        updates.distance = parseInt(updates.distance);

        // Retrieve original data
        const oldFlight = await ClientStorageSolutions.fetchFlights(flightID);
        await ClientStorageSolutions.editFlight(flightID, updates);

        // Detect changed fields
        const fieldLabels = {
            origin: 'Origin',
            destination: 'Destination',
            departureTime: 'Departure Time',
            arrivalTime: 'Arrival Time',
            status: 'Status',
            distance: 'Distance'
        };

        const changedFields = [];
        for (const key of Object.keys(fieldLabels)) {
            const oldVal = (oldFlight?.[key] || '').toString();
            const newVal = (updates?.[key] || '').toString();
            if (oldVal !== newVal) {
                changedFields.push(fieldLabels[key]);
            }
        }

        // Notify affected users and adjust points if needed
        const affectedBookings = await ClientStorageSolutions.fetchBookings({ flightID });
        const affectedUserIDs = [...new Set((affectedBookings || []).map(b => b.userID))];

        for (const userID of affectedUserIDs) {
            const user = (await ClientStorageSolutions.fetchUsers('userID', userID))[0];
            if (!user) continue;

            // Calculate point difference if distance changed
            let multiplier = 1;
            if (user.points >= 30000) multiplier = 1.5;
            else if (user.points >= 15000) multiplier = 1.25;

            const oldPoints = Math.round(oldFlight.distance * multiplier);
            const newPoints = Math.round(updates.distance * multiplier);
            const pointDifference = newPoints - oldPoints;

            if (pointDifference !== 0) {
                const updatedPoints = Math.max(0, user.points + pointDifference);

                await ClientStorageSolutions.editUser(userID, { points: updatedPoints });

                const correctionMsg = pointDifference > 0
                    ? `A mistake on our end has been made and we have credited +${pointDifference} points to your account.`
                    : `We apologise but we made a mistake on our end, we have deducted ${Math.abs(pointDifference)} points from your account.`;

                await ClientStorageSolutions.sendNotification(userID, correctionMsg, {
                    senderName: "Flight Manager",
                    senderAvatar: "https://i0.wp.com/aerocadet.com/blog/wp-content/uploads/2024/03/Good-Airline-Pilot.jpg?fit=826%2C551&ssl=1"
                });
            }

            // Notify about flight updates if relevant
            if (changedFields.length > 1 || (changedFields.length === 1 && changedFields[0] !== 'Distance')) {
                const updateMsg = `Your flight to ${updates.destination} has been updated: ${changedFields.filter(f => f !== 'Distance').join(', ')}.`;
                await ClientStorageSolutions.sendNotification(userID, updateMsg, {
                    senderName: "Flight Manager",
                    senderAvatar: "https://i0.wp.com/aerocadet.com/blog/wp-content/uploads/2024/03/Good-Airline-Pilot.jpg"
                });
            }
        }

        await ClientStorageSolutions.setNotifyOnReset({
            type: 'success',
            message: 'Flight updated. Users notified and points adjusted if required.'
        });

        location.reload();
    });

    // Handle flight deletion
    $(document).on('click', '.action-delete-flight', async function () {
        const flightID = $(this).data('flight-id');
        if (!confirm(`Are you sure you want to delete flight ${flightID}?`)) return;

        await ClientStorageSolutions.deleteFlight(flightID);
        await ClientStorageSolutions.setNotifyOnReset({ type: 'success', message: 'Flight deleted successfully.' });
        location.reload();
    });
})();