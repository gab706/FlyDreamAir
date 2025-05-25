window.ClientStorageSolutions = window.ClientStorageSolutions || {};

ClientStorageSolutions.createBooking = async function (bookingData) {
    const bookings = await ClientStorageWrapper.get('bookings', 'indexed') || [];
    const nextID = `BO${String(bookings.length + 1).padStart(3, '0')}`;

    const newBooking = {
        bookingID: nextID,
        userID: bookingData.userID,
        flightID: bookingData.flightID
    };

    bookings.push(newBooking);
    await ClientStorageWrapper.set('bookings', bookings, 'indexed');
};

ClientStorageSolutions.fetchBookings = async function ({ bookingID = null, userID = null, flightID = null } = {}) {
    if (!bookingID && !userID && !flightID)
        return null;

    const bookings = await ClientStorageWrapper.get('bookings', 'indexed') || [];

    const filtered = bookings.filter(b =>
        (!bookingID || b.bookingID === bookingID) &&
        (!userID || b.userID === userID) &&
        (!flightID || b.flightID === flightID)
    );

    return Promise.all(
        filtered.map(async booking => {
            const flight = await ClientStorageSolutions.fetchFlights(booking.flightID);
            return {...booking, flight};
        })
    );
};

ClientStorageSolutions.deleteBookings = async function ({ bookingID = null, userID = null, flightID = null } = {}) {
    if (!bookingID && !userID && !flightID)
        return;

    const bookings = await ClientStorageWrapper.get('bookings', 'indexed') || [];

    const filtered = bookings.filter(b => {
        const matchBookingID = bookingID ? b.bookingID === bookingID : true;
        const matchUserID = userID ? b.userID === userID : true;
        const matchFlightID = flightID ? b.flightID === flightID : true;
        return !(matchBookingID && matchUserID && matchFlightID);
    });

    if (filtered.length === bookings.length)
        return;

    await ClientStorageWrapper.set('bookings', filtered, 'indexed');
    await this.deleteRewardRecords({ bookingID });
};

ClientStorageSolutions.createRewardRecord = async function ({ flightID, userID, rewardID, bookingID }) {
    if (!flightID || !userID || !rewardID || !bookingID)
        return;

    const rewardRecords = await ClientStorageWrapper.get('rewardRecords', 'indexed') || [];

    const newRecord = { flightID, userID, rewardID, bookingID };
    rewardRecords.push(newRecord);

    await ClientStorageWrapper.set('rewardRecords', rewardRecords, 'indexed');
};

ClientStorageSolutions.fetchRewardRecords = async function ({ flightID = null, userID = null, rewardID = null, bookingID = null } = {}) {
    if (!flightID && !userID && !rewardID && !bookingID)
        return;

    const rewardRecords = await ClientStorageWrapper.get('rewardRecords', 'indexed') || [];

    return rewardRecords.filter(r =>
        (!flightID || r.flightID === flightID) &&
        (!userID || r.userID === userID) &&
        (!rewardID || r.rewardID === rewardID) &&
        (!bookingID || r.bookingID === bookingID)
    );
};

ClientStorageSolutions.deleteRewardRecords = async function ({ flightID = null, userID = null, rewardID = null, bookingID = null } = {}) {
    if (!flightID && !userID && !rewardID && !bookingID)
        return false;

    const rewardRecords = await ClientStorageWrapper.get('rewardRecords', 'indexed') || [];

    const filtered = rewardRecords.filter(r =>
        !(
            (!flightID || r.flightID === flightID) &&
            (!userID || r.userID === userID) &&
            (!rewardID || r.rewardID === rewardID) &&
            (!bookingID || r.bookingID === bookingID)
        )
    );

    if (filtered.length === rewardRecords.length)
        return;

    await ClientStorageWrapper.set('rewardRecords', filtered, 'indexed');
};

ClientStorageSolutions.createReward = async function (data) {
    const rewards = await ClientStorageWrapper.get('rewards', 'indexed') || [];
    const nextID = `RW${String(rewards.length + 1).padStart(3, '0')}`;

    const newReward = {
        id: nextID,
        name: data.name,
        description: data.description,
        type: data.type,
        image: data.image,
        tier: data.tier,
        purchasable: !!data.purchasable,
        price: data.purchasable ? data.price : null
    };

    rewards.push(newReward);
    await ClientStorageWrapper.set('rewards', rewards, 'indexed');
};

ClientStorageSolutions.updateReward = async function (rewardID, updates) {
    const rewards = await ClientStorageWrapper.get('rewards', 'indexed') || [];
    const index = rewards.findIndex(r => r.id === rewardID);
    if (index === -1)
        return;

    rewards[index] = {
        ...rewards[index],
        ...updates,
        id: rewardID
    };

    await ClientStorageWrapper.set('rewards', rewards, 'indexed');
};

ClientStorageSolutions.fetchRewards = async function (rewardID = null) {
    const rewards = await ClientStorageWrapper.get('rewards', 'indexed') || [];

    if (!rewardID)
        return rewards;

    return rewards.find(r => r.id === rewardID) || null;
};

ClientStorageSolutions.deleteReward = async function (rewardID) {
    if (!rewardID)
        return;

    const rewards = await ClientStorageWrapper.get('rewards', 'indexed') || [];
    const filtered = rewards.filter(r => r.id !== rewardID);

    if (filtered.length === rewards.length)
        return;

    await ClientStorageWrapper.set('rewards', filtered, 'indexed');
    await this.deleteReward({ rewardID });
};

ClientStorageSolutions.createFlight = async function (data) {
    const flights = await ClientStorageWrapper.get('flights', 'indexed') || [];
    const nextID = `FL${String(flights.length + 1).padStart(3, '0')}`;

    const newFlight = {
        flightID: nextID,
        origin: data.origin,
        destination: data.destination,
        departureTime: data.departureTime,
        arrivalTime: data.arrivalTime,
        status: data.status,
        distance: data.distance
    };

    flights.push(newFlight);
    await ClientStorageWrapper.set('flights', flights, 'indexed');
};

ClientStorageSolutions.editFlight = async function (flightID, updatedData) {
    const flights = await ClientStorageWrapper.get('flights', 'indexed') || [];

    const index = flights.findIndex(f => f.flightID === flightID);
    if (index === -1)
        return;

    flights[index] = {
        ...flights[index],
        ...updatedData,
        flightID
    };

    await ClientStorageWrapper.set('flights', flights, 'indexed');
};

ClientStorageSolutions.fetchFlights = async function (flightID) {
    const flights = await ClientStorageWrapper.get('flights', 'indexed') || [];

    if (!flightID)
        return flights;

    return flights.find(f => f.flightID === flightID) || null;
};

ClientStorageSolutions.deleteFlight = async function (flightID) {
    if (!flightID)
        return false;

    const flights = await ClientStorageWrapper.get('flights', 'indexed') || [];
    const updated = flights.filter(f => f.flightID !== flightID);

    if (updated.length === flights.length)
        return;

    await ClientStorageWrapper.set('flights', updated, 'indexed');

    await this.deleteBookings({ flightID });
    await this.deleteRewardRecords({ flightID });
};

ClientStorageSolutions.fetchNotifications = async function (userID) {
    if (!userID)
        return [];

    const notifications = await ClientStorageWrapper.get('notifications', 'indexed') || [];

    return notifications.filter(n => n.userID === userID);
}

ClientStorageSolutions.deleteNotifications = async function ({ userID = null, notificationID = null } = {}) {
    if (!userID && !notificationID)
        return;

    const notifications = await ClientStorageWrapper.get('notifications', 'indexed') || [];

    const filtered = notifications.filter(n => {
        const matchUser = userID ? n.userID === userID : true;
        const matchNotification = notificationID ? n.notificationID === notificationID : true;
        return !(matchUser && matchNotification);
    });

    if (filtered.length === notifications.length)
        return;

    await ClientStorageWrapper.set('notifications', filtered, 'indexed');
};

ClientStorageSolutions.markNotificationsRead = async function ({ userID = null, notificationID = null } = {}) {
    if (!userID && !notificationID)
        return;

    const notifications = await ClientStorageWrapper.get('notifications', 'indexed') || [];

    const updated = notifications.map(n => {
        const matchesUser = userID ? n.userID === userID : true;
        const matchesNotification = notificationID ? n.notificationID === notificationID : true;

        if (matchesUser && matchesNotification && n.read === 0)
            return { ...n, read: 1 };

        return n;
    });

    await ClientStorageWrapper.set('notifications', updated, 'indexed');
};


ClientStorageSolutions.sendNotification = async function (userIDs, message, sentFrom = {}) {
    if (!userIDs || !message)
        return;

    const idList = Array.isArray(userIDs) ? userIDs : [userIDs];
    if (idList.length === 0)
        return;

    let notifications = await ClientStorageWrapper.get('notifications', 'indexed') || [];

    const timestamp = new Date().toISOString();
    const senderName = sentFrom.senderName || 'System';
    const senderAvatar = sentFrom.senderAvatar || 'https://wallpapersok.com/images/hd/basic-default-pfp-pxi77qv5o0zuz8j3.jpg';

    idList.forEach((userID, i) => {
        const nextID = `NO${String(notifications.length + i + 1).padStart(3, '0')}`;
        notifications.push({
            notificationID: nextID,
            userID,
            message,
            timestamp,
            senderName,
            senderAvatar,
            read: 0
        });
    });

    await ClientStorageWrapper.set('notifications', notifications, 'indexed');
};

ClientStorageSolutions.setUserSession = async function (userID, adminImpersonating = null) {
    if (!userID)
        return;

    const session = {
        userID,
        loggedIn: true,
        adminImpersonating: adminImpersonating || null
    };

    await ClientStorageWrapper.set('userSession', session, 'cookie', { days: 7 });

    const currentUser = (await this.fetchUsers('userID', userID))[0] || null;
    console.log(currentUser)
    if (currentUser)
        await ClientStorageWrapper.set('currentUser', currentUser, 'cookie', { days: 7 });
};

ClientStorageSolutions.clearUserSession = async function () {
    await ClientStorageWrapper.remove('userSession', 'cookie');
    await ClientStorageWrapper.remove('currentUser', 'cookie');
};

ClientStorageSolutions.getCurrentUser = async function () {
    const session = await ClientStorageWrapper.get('userSession', 'cookie');
    const user = await ClientStorageWrapper.get('currentUser', 'cookie');

    const isValidSession =
        session &&
        typeof session === 'object' &&
        !Array.isArray(session) &&
        session.userID &&
        session.loggedIn === true;

    const isValidUser =
        user &&
        typeof user === 'object' &&
        user.userID === session?.userID;

    if (isValidSession && isValidUser) {
        return {
            ...session,
            ...user
        };
    }

    return null;
};

ClientStorageSolutions.createUser = async function (userData) {
    if (
        !userData ||
        typeof userData.name !== 'string' ||
        typeof userData.email !== 'string' ||
        typeof userData.password !== 'string'
    )
        return null;

    let users = await ClientStorageWrapper.get('users', 'indexed') || [];

    const newID = users.length ? users[users.length - 1].userID + 1 : 1;

    const newUser = {
        userID: newID,
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        role: userData.role || 0,
        points: userData.points || 0,
        pinned_pages: userData.pinned_pages || [],
        profile_pic: userData.profile_pic || 'https://wallpapersok.com/images/hd/basic-default-pfp-pxi77qv5o0zuz8j3.jpg'
    };

    users.push(newUser);
    await ClientStorageWrapper.set('users', users, 'indexed');
    return newUser;
};

ClientStorageSolutions.editUser = async function (userID, updates = {}) {
    if (!userID || typeof updates !== 'object' || Array.isArray(updates))
        return;

    let users = await ClientStorageWrapper.get('users', 'indexed') || [];

    const index = users.findIndex(u => u.userID === userID);
    if (index === -1)
        return;

    users[index] = {
        ...users[index],
        ...updates,
        userID: users[index].userID
    };

    await ClientStorageWrapper.set('users', users, 'indexed');

    const currentUser = await this.getCurrentUser();
    console.log(currentUser && currentUser.userID === userID);
    if (currentUser && currentUser.userID === userID)
        await ClientStorageWrapper.set('currentUser', users[index], 'cookie', { days: 7 });
};

ClientStorageSolutions.fetchUsers = async function (field, match) {
    if (!field || typeof match === 'undefined')
        return [];

    const users = await ClientStorageWrapper.get('users', 'indexed') || [];

    return users.filter(user => {
        const userVal = user?.[field];
        if (typeof match === 'function') return match(userVal);
        if (typeof userVal === 'string' && typeof match === 'string')
            return userVal.toLowerCase().includes(match.toLowerCase());
        return userVal === match;
    });
}

ClientStorageSolutions.deleteUser = async function (userID) {
    if (!userID)
        return;

    let users = await ClientStorageWrapper.get('users', 'indexed') || [];
    const updated = users.filter(u => u.userID !== userID);

    if (updated.length === users.length)
        return;

    await ClientStorageWrapper.set('users', updated, 'indexed');
    await this.deleteRewardRecords({ userID });
    await this.deleteUser({ userID });
};

ClientStorageSolutions.setNotifyOnReset = async function ({ type, message }) {
    if (!type || !message)
        return;

    await ClientStorageWrapper.set('notifyOnReset', { type, message }, 'cookie', { days: 1 });
};

ClientStorageSolutions.consumeNotifyOnReset = async function () {
    const data = await ClientStorageWrapper.get('notifyOnReset', 'cookie');

    if (data && typeof data === 'object' && data.message && data.type) {
        await ClientStorageWrapper.remove('notifyOnReset', 'cookie');
        return data;
    }

    return null;
};

ClientStorageSolutions.toggleDarkMode = async function () {
    const current = await ClientStorageWrapper.get('darkTheme', 'cookie')

    if (!current)
        await ClientStorageWrapper.set('darkTheme', true, 'cookie', { days: 365 });

    const newValue = !current;
    await ClientStorageWrapper.set('darkTheme', newValue, 'cookie', { days: 365 });
};