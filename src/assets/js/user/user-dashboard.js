$(document).ready(function () {
    const session = StorageWrapper.get('userSession', 'local');
    if (!session?.loggedIn) return location.replace('../public/login.html');

    const users = StorageWrapper.get('users', 'local') || [];
    const currentUser = users.find(u => u.userID === session.userID);
    if (!currentUser) return location.replace('../user/logout.html');

    const now = new Date();
    const allFlights = StorageWrapper.get('flights', 'local') || [];
    const rewardClaims = StorageWrapper.get('rewardClaims', 'local') || [];

    const allNotifications = StorageWrapper.get('notifications', 'local') || [];
    const userNotifications = allNotifications.filter(n => n.userID === session?.userID);
    const unreadCount = userNotifications.filter(n => n.read === '0').length;

    const $header = $('[data-header]');
    const $taskList = $('.tasks-list');
    const $rewardsList = $('#rewards-list');
    const $impersonatingButton = $('.impersonate-btn');
    const $notificationToggle = $('#notification-toggle');
    const $notificationBadge = $('#notification-badge');
    const $notificationDropdown = $('#notification-dropdown');
    const $profile = $('.header-profile');
    const $dropdown = $('.profile-dropdown-menu');
    const isImpersonating = !!session.adminImpersonating;

    const showModal = (id, show = true) => $(`#${id}`)[show ? 'fadeIn' : 'fadeOut']();

    $('[data-menu-toggle-btn]').on('click', () => $header.toggleClass('active'));
    $('[data-menu-btn]').on('click', function () { $(this).next().toggleClass('active'); });

    const points = +currentUser.points;
    const tiers = [
        { name: 'Silver', min: 0, max: 14999, color: '#a6a5a5' },
        { name: 'Gold', min: 15000, max: 29999, color: '#a28a03' },
        { name: 'Platinum', min: 30000, max: Infinity, color: '#b2b2b2' }
    ];
    const tier = tiers.find(t => points >= t.min && points <= t.max);
    const progressPercent = tier.max === Infinity ? 100 : Math.floor(((points - tier.min) / (tier.max - tier.min)) * 100);

    const renderUserDetails = () => {
        $('.profile-avatar, .card-avatar').html(`<img src="${currentUser.profile_pic}" alt="${currentUser.name}" width="32">`);
        $('.user-name').text(currentUser.name);
        $('.user-email').text(currentUser.email);
        $('.user-points').text(`${currentUser.points} Point${currentUser.points === '1' ? '' : 's'}`);
        let roleLabel = '';
        let roleColor = '';

        switch (currentUser.role) {
            case '1':
                roleLabel = 'Staff';
                roleColor = 'cyan';
                break;
            case '2':
                roleLabel = 'Manager';
                roleColor = 'orange';
                break;
            case '3':
                roleLabel = 'Admin';
                roleColor = 'red';
                break;
        }

        $('.user-role').html(roleLabel ? `<div class="card-badge ${roleColor}">${roleLabel}</div>` : '');
        $('#tier-progression-number').text(`${progressPercent}%`);
        $('#tier-progression-bar').css({ width: `${progressPercent}%`, backgroundColor: tier.color });
        $('#user-point-level').css({ color: tier.color, fontWeight: 'bold' }).html(tier.name === 'Platinum' ? '<i class="far fa-crown"></i> Platinum' : tier.name);

        const miles = points >= 30000 ? Math.floor(points / 1.5) : points >= 15000 ? Math.floor(points / 1.25) : points;
        $('#miles-travelled').val(miles).text(miles);
    };

    const completedFlights = allFlights.filter(f => f.userWhoBooked === session.userID && new Date(f.date) < now);
    const upcomingFlights = allFlights.filter(f => f.userWhoBooked === session.userID && new Date(f.date) > now).sort((a, b) => new Date(a.date) - new Date(b.date));

    const getBadgeColor = s => ({ Booked: 'green', Cancelled: 'red', Postponed: 'orange' }[s] || 'gray');
    const categoryColor = cat => ({ Comfort: 'green', Luggage: 'cyan', Accommodation: 'orange', Upgrade: 'red', Boarding: 'blue', 'Partner Offer': 'darkgray' }[cat] || 'gray');

    const buildTripHTML = f => `<li class="tasks-item"><div class="card task-card"><div class="card-input"><label class="task-label">${f.origin} → ${f.destination}</label></div><div class="card-badge cyan radius-pill">${new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${new Date(f.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div><ul class="card-meta-list"><li><div class="meta-box icon-box"><span class="material-symbols-rounded icon">flight</span><span>${f.flightID}</span></div></li><li><div class="card-badge ${getBadgeColor(f.status)}">${f.status}</div></li></ul></div></li>`;

    const buildRewardHTML = c => {
        const flight = allFlights.find(f => f.flightID === c.flightID);
        return `<li class="project-item reward-claim-card"><div class="card project-card"><time class="card-date">${new Date(flight?.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}</time><h3 class="card-title"><a href="#">${c.rewardName}</a></h3><div class="card-badge ${categoryColor(c.rewardCategory)}">${c.rewardCategory}</div><p class="card-text">${c.description}</p><div class="card-progress-box"><div class="progress-label"><span class="progress-title">Flight</span><a href="../user/user-bookings.html?id=${c.flightID}" style="text-decoration: underline" class="progress-data ${categoryColor(c.rewardCategory)}">${c.flightID}</a></div></div></div></li>`;
    };

    const renderFlightInsight = () => {
        const $count = $('#scheduled-flight-count'), $status = $('#scheduled-flight-status'), $list = $('#flight-insight-list');
        if (upcomingFlights.length) {
            const next = upcomingFlights[0];
            const formattedDate = new Date(next.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            $('#next-flight-date').text(formattedDate);
            $('#next-flight-destination').text(next.destination);
            $count.text(upcomingFlights.length).val(upcomingFlights.length);
            $status.text(`Next: ${next.destination} on ${formattedDate}`);
            $list.show();
        } else {
            $count.text('0').val(0);
            $status.text('No Flights Booked');
            $list.hide();
        }
        $('#flights-completed').val(completedFlights.length).text(completedFlights.length);
    };

    const renderTrips = (() => {
        const $emptyMsg = $('.empty-trips-message');
        const $loadMore = $('#load-more-upcoming-trips');
        const $toggleView = $('#load-all-upcoming-trips');
        let limit = 3;

        const update = () => {
            $taskList.empty();
            if (!upcomingFlights.length) return $emptyMsg.show(), $loadMore.hide(), $toggleView.hide();
            $emptyMsg.hide();
            $taskList.append(upcomingFlights.slice(0, limit).map(buildTripHTML));
            $loadMore.toggle(limit < upcomingFlights.length);
            $toggleView.toggle(upcomingFlights.length > 3).text(limit < upcomingFlights.length ? 'View All' : 'View Less');
        };

        $loadMore.on('click', () => { limit += 3; update(); });
        $toggleView.on('click', () => { limit = limit >= upcomingFlights.length ? 3 : upcomingFlights.length; update(); });
        return update;
    })();

    const renderRewards = (() => {
        const $toggleRewards = $('#toggle-rewards-view');
        const $emptyRewardsMsg = $('.empty-rewards-message');
        const userRewards = rewardClaims.filter(c => c.userWhoClaimed === session.userID);
        let visible = 3;

        const update = () => {
            $rewardsList.empty();
            if (!userRewards.length) return $rewardsList.hide(), $emptyRewardsMsg.show(), $toggleRewards.hide();
            $emptyRewardsMsg.hide();
            $rewardsList.show().append(userRewards.slice(0, visible).map(buildRewardHTML));
            $toggleRewards.toggle(userRewards.length > 3).find('span:first').text(visible >= userRewards.length ? 'View Less' : 'Show More');
        };

        $toggleRewards.on('click', () => { visible = visible >= userRewards.length ? 3 : visible + 3; update(); });
        return update;
    })();

    renderUserDetails();
    renderFlightInsight();
    renderTrips();
    renderRewards();

    const handleLogout = () => {
        if (isImpersonating) {
            StorageWrapper.set('userSession', {
                userID: session.adminImpersonating,
                loggedIn: true
            }, 'local');
            return location.reload();
        }
        StorageWrapper.set('userSession', {}, 'local');
        location.href = '../public/login.html';
    };

    $('.logout-btn').text(isImpersonating ? 'End Impersonation' : 'Logout').on('click', handleLogout);
    $('.profile-dropdown-menu .user-name').css('font-style', isImpersonating ? 'italic' : 'normal').text(currentUser.name);

    $profile.on('click', e => { e.preventDefault(); $dropdown.toggle(); });
    $(document).on('click', e => {
        if (!$profile.is(e.target) && $profile.has(e.target).length === 0 && !$dropdown.is(e.target) && $dropdown.has(e.target).length === 0) {
            $dropdown.hide();
        }
    });

    $('#dropdown-avatar-img').html(`<img src="${currentUser.profile_pic}" alt="${currentUser.name}" width="32">`);

    if (unreadCount > 0)
        $notificationBadge.text(unreadCount).show();
    else
        $notificationBadge.hide();

    $notificationDropdown.empty();

    if (userNotifications.length === 0) {
        $notificationDropdown.append(`<li class="notification-title">Notifications</li><li class="notification-item">No Notifications</li>`);
    } else {
        $notificationDropdown.append(`<li class="notification-title">Notifications</li>`);
        userNotifications.forEach(n => {
            $notificationDropdown.append(`<li class="notification-item${n.read === '0' ? ' unread' : ''}">${n.notification}</li>`);
        });
    }

    $notificationToggle.on('click', function (e) {
        e.preventDefault();
        $notificationDropdown.toggleClass('active');

        const updated = allNotifications.map(n =>
            n.userID === session?.userID ? { ...n, read: '1' } : n
        );
        StorageWrapper.set('notifications', updated, 'local');
        $notificationBadge.hide();
    });

    $(document).on('click', function (e) {
        if (!$notificationToggle.is(e.target) && $notificationToggle.has(e.target).length === 0 &&
            !$notificationDropdown.is(e.target) && $notificationDropdown.has(e.target).length === 0) {
            $notificationDropdown.removeClass('active');
        }
    });

    const userRole = parseInt(currentUser.role || '0', 10);
    const isManager = userRole === 2;
    const isAdmin = userRole === 3;


    if (isAdmin) {
        $impersonatingButton.show();

        $impersonatingButton.on('click', () => {
            const allUsers = StorageWrapper.get('users', 'local') || [];
            console.log(allUsers);
            const nonAdmins = allUsers.filter(u => u.role !== '3');

            const $select = $('#impersonate-user-select').empty().append('<option disabled selected>Select User</option>');
            nonAdmins.forEach(user => {
                $select.append(`<option value="${user.userID}">${user.name} (${user.email})</option>`);
            });

            showModal('impersonate-modal');
        });

        $('#impersonate-modal .btn-close').on('click', () => showModal('impersonate-modal', false));

        $('#start-impersonation').on('click', () => {
            const selectedID = $('#impersonate-user-select').val();
            if (!selectedID) {
                return $.notify("Please select a User to Impersonate", {
                    className: "warn",
                    position: "top right"
                });
            }

            const newSession = {
                userID: selectedID,
                loggedIn: true,
                adminImpersonating: session.userID
            };

            StorageWrapper.set('userSession', newSession, 'local');
            location.reload();
        });
    }

    if (isAdmin || isManager) {
        $('.contact-link:has(.user-points)').on('click', e => {
            e.preventDefault();
            $('#points-input').val(+currentUser.points || 0);
            showModal('points-modal');
        });
        $('#points-modal .btn-close').on('click', () => showModal('points-modal', false));
        $('#submit-points').on('click', () => {
            const val = parseInt($('#points-input').val(), 10);
            if (isNaN(val) || val < 0) return $.notify('Enter a valid non-negative number', { className: 'error', position: 'top right' });
            const index = users.findIndex(u => u.userID === currentUser.userID);
            if (~index) users[index].points = val.toString();
            StorageWrapper.set('users', users, 'local');
            showModal('points-modal', false);
            location.reload();
        });
        let selectedTripID = null;

        $('#flights-completed').closest('.card.task-card').on('click', () => showModal('create-flight-modal'));
        $('#create-flight-modal .btn-close').on('click', () => showModal('create-flight-modal', false));

        $('#submit-flight').on('click', () => {
            const origin = $('#flight-origin').val().trim();
            const destination = $('#flight-destination').val().trim();
            const date = $('#flight-date').val();
            const status = $('#flight-status').val();

            if (!origin || !destination || !date || !status)
                return $.notify("Please fill out all Flight Fields", { className: 'error', position: 'top right' });

            const flights = StorageWrapper.get('flights', 'local') || [];
            const flightID = `FL${(flights.length + 1).toString().padStart(3, '0')}`;
            flights.push({ flightID, userWhoBooked: currentUser.userID, status, date, origin, destination });
            StorageWrapper.set('flights', flights, 'local');
            showModal('create-flight-modal', false);
            location.reload();
        });

        $taskList.on('click', '.tasks-item', function () {
            selectedTripID = $(this).find('.meta-box span:last-child').text()?.trim();
            showModal('trip-options-modal');
        });

        $('#trip-options-modal .btn-close').on('click', () => showModal('trip-options-modal', false));

        $('#edit-trip-btn').on('click', () => {
            showModal('trip-options-modal', false);
            const flight = allFlights.find(f => f.flightID === selectedTripID);
            if (!flight) return $.notify("Trip not Found", { className: 'error', position: 'top right' });

            $('#edit-flight-origin').val(flight.origin);
            $('#edit-flight-destination').val(flight.destination);
            $('#edit-flight-date').val(flight.date);
            $('#edit-flight-status').val(flight.status);
            showModal('edit-trip-modal');
        });

        $('#edit-trip-modal .btn-close').on('click', () => showModal('edit-trip-modal', false));

        $('#save-trip-btn').on('click', () => {
            const origin = $('#edit-flight-origin').val().trim();
            const destination = $('#edit-flight-destination').val().trim();
            const date = $('#edit-flight-date').val();
            const status = $('#edit-flight-status').val();
            if (!origin || !destination || !date || !status)
                return $.notify("Please fill out all Fields", { className: 'error', position: 'top right' });

            const flights = StorageWrapper.get('flights', 'local') || [];
            const index = flights.findIndex(f => f.flightID === selectedTripID);
            if (~index) flights[index] = { ...flights[index], origin, destination, date, status };
            StorageWrapper.set('flights', flights, 'local');
            showModal('edit-trip-modal', false);
            location.reload();
        });

        $('#delete-trip-btn').on('click', () => {
            const updatedFlights = allFlights.filter(f => f.flightID !== selectedTripID);
            const updatedRewards = rewardClaims.filter(r => r.flightID !== selectedTripID);
            StorageWrapper.set('flights', updatedFlights, 'local');
            StorageWrapper.set('rewardClaims', updatedRewards, 'local');
            showModal('edit-trip-modal', false);
            location.reload();
        });
        let selectedReward = null;

        $('#create-reward-btn').on('click', () => {
            showModal('trip-options-modal', false);
            showModal('create-reward-modal');
        });

        $('#create-reward-modal .btn-close').on('click', () => showModal('create-reward-modal', false));

        $('#submit-reward').on('click', () => {
            const name = $('#reward-name').val().trim();
            const cat = $('#reward-category').val();
            const desc = $('#reward-description').val().trim();

            if (!name || !cat || cat === 'Select Category' || !desc)
                return $.notify("Please fill out all Reward Fields", { className: 'error', position: 'top right' });

            const rewards = StorageWrapper.get('rewardClaims', 'local') || [];
            rewards.push({ userWhoClaimed: currentUser.userID, rewardName: name, rewardCategory: cat, description: desc, flightID: selectedTripID });
            StorageWrapper.set('rewardClaims', rewards, 'local');
            showModal('create-reward-modal', false);
            location.reload();
        });

        $rewardsList.on('click', '.reward-claim-card', function () {
            const index = $(this).index();
            selectedReward = rewardClaims[index];
            if (!selectedReward) return;

            $('#edit-reward-name').val(selectedReward.rewardName);
            $('#edit-reward-category').val(selectedReward.rewardCategory);
            $('#edit-reward-description').val(selectedReward.description);

            const userFlights = allFlights.filter(f => f.userWhoBooked === currentUser.userID);
            const $select = $('#edit-reward-flight').empty().append('<option disabled>Select Associated Flight</option>');
            userFlights.forEach(f => {
                const selected = f.flightID === selectedReward.flightID ? 'selected' : '';
                $select.append(`<option value="${f.flightID}" ${selected}>${f.origin} → ${f.destination} (${f.flightID})</option>`);
            });

            showModal('edit-reward-modal');
        });

        $('#edit-reward-modal .btn-close').on('click', () => showModal('edit-reward-modal', false));

        $('#save-reward-btn').on('click', () => {
            const name = $('#edit-reward-name').val().trim();
            const cat = $('#edit-reward-category').val();
            const desc = $('#edit-reward-description').val().trim();
            const fid = $('#edit-reward-flight').val();

            if (!name || !cat || !desc || !fid || cat === 'Select Category')
                return $.notify("Please fill out all Fields", { className: 'error', position: 'top right' });

            const rewards = StorageWrapper.get('rewardClaims', 'local') || [];
            const index = rewards.findIndex(r =>
                r.flightID === selectedReward.flightID &&
                r.rewardName === selectedReward.rewardName &&
                r.userWhoClaimed === selectedReward.userWhoClaimed
            );
            if (~index) rewards[index] = { ...selectedReward, rewardName: name, rewardCategory: cat, description: desc, flightID: fid };
            StorageWrapper.set('rewardClaims', rewards, 'local');
            showModal('edit-reward-modal', false);
            location.reload();
        });

        $('#delete-reward-btn').on('click', () => {
            const updated = rewardClaims.filter(r =>
                !(r.flightID === selectedReward.flightID &&
                    r.rewardName === selectedReward.rewardName &&
                    r.userWhoClaimed === selectedReward.userWhoClaimed));
            StorageWrapper.set('rewardClaims', updated, 'local');
            showModal('edit-reward-modal', false);
            location.reload();
        });
    }
});