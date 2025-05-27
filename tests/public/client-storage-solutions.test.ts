if (typeof global.structuredClone !== 'function') {
    global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

import {type DOMWindow, JSDOM} from 'jsdom';
import fs from 'fs';
import path from 'path';
import 'fake-indexeddb/auto';
import { indexedDB as fakeIndexedDB } from 'fake-indexeddb';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ClientStorageSolutions', () => {
    let window: DOMWindow
    let document: Document;

    beforeAll(() => {
        const dom = new JSDOM('<!DOCTYPE html><body></body>', { runScripts: 'dangerously' });
        window = dom.window as any;
        document = window.document;

        Object.defineProperty(window, 'indexedDB', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: fakeIndexedDB,
        });

        const script = fs.readFileSync(path.resolve(__dirname, '../../src/public/js/client-storage-wrapper.js'), 'utf-8');
        window.eval(script);

        const solutionsScript = fs.readFileSync(path.resolve(__dirname, '../../src/public/js/client-storage-solutions.js'), 'utf-8');
        window.eval(solutionsScript);

        const storageMock = (() => {
            let store: Record<string, string> = {};
            return {
                getItem(key: string) {
                    return store[key] || null;
                },
                setItem(key: string, value: string) {
                    store[key] = value.toString();
                },
                removeItem(key: string) {
                    delete store[key];
                },
                clear() {
                    store = {};
                },
            };
        })();

        Object.defineProperty(window, 'localStorage', { value: storageMock });
        Object.defineProperty(window, 'sessionStorage', { value: storageMock });

        let cookieStore = '';
        Object.defineProperty(document, 'cookie', {
            get() {
                return cookieStore;
            },
            set(value) {
                const [cookie] = value.split(';');
                const [name] = cookie.split('=');
                cookieStore = cookieStore
                    .split('; ')
                    .filter(c => !c.startsWith(name + '='))
                    .join('; ');
                cookieStore = cookieStore ? cookieStore + '; ' + cookie : cookie;
            },
            configurable: true,
        });
    });

    afterEach(async () => {
        await window.ClientStorageWrapper.clearAll();
    });

    const createDummyFlight = () => ({
        origin: 'SYD',
        destination: 'MEL',
        departureTime: new Date().toISOString(),
        arrivalTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'On Time',
        distance: 713,
    });

    it('should create, fetch, and delete bookings', async () => {
        const bookingData = { userID: 1, flightID: 'FL001' };
        await window.ClientStorageSolutions.createBooking(bookingData);
        let bookings = await window.ClientStorageSolutions.fetchBookings({ userID: 1 });
        expect(bookings.length).toBe(1);
        expect(bookings[0].userID).toBe(1);
        expect(bookings[0].flightID).toBe('FL001');

        await window.ClientStorageSolutions.deleteBookings({ bookingID: bookings[0].bookingID });
        bookings = await window.ClientStorageSolutions.fetchBookings({ userID: 1 });
        expect(bookings.length).toBe(0);
    });

    it('should create, fetch, and delete reward records', async () => {
        const record = { flightID: 'FL001', userID: 1, rewardID: 'RW001', bookingID: 'BO001' };
        await window.ClientStorageSolutions.createRewardRecord(record);
        let recs = await window.ClientStorageSolutions.fetchRewardRecords({ userID: 1 });
        expect(recs.length).toBe(1);
        expect(recs[0].rewardID).toBe('RW001');

        await window.ClientStorageSolutions.deleteRewardRecords({ bookingID: 'BO001' });
        recs = await window.ClientStorageSolutions.fetchRewardRecords({ userID: 1 });
        expect(recs.length).toBe(0);
    });

    it('should create, fetch, update, and delete rewards', async () => {
        const data = {
            name: 'Free Coffee',
            description: 'Get a free coffee',
            type: 'Discount',
            image: 'img.png',
            tier: 'Silver',
            purchasable: true,
            price: 500,
        };
        await window.ClientStorageSolutions.createReward(data);

        let rewards = await window.ClientStorageSolutions.fetchRewards();
        expect(rewards.length).toBe(1);
        expect(rewards[0].name).toBe('Free Coffee');

        await window.ClientStorageSolutions.updateReward(rewards[0].id, { price: 450 });
        const updated = await window.ClientStorageSolutions.fetchRewards(rewards[0].id);
        expect(updated.price).toBe(450);

        await window.ClientStorageSolutions.deleteReward(rewards[0].id);
        rewards = await window.ClientStorageSolutions.fetchRewards();
        expect(rewards.length).toBe(0);
    });

    it('should create, fetch, edit, and delete flights', async () => {
        const flight = createDummyFlight();
        await window.ClientStorageSolutions.createFlight(flight);
        let flights = await window.ClientStorageSolutions.fetchFlights();
        expect(flights.length).toBe(1);

        await window.ClientStorageSolutions.editFlight(flights[0].flightID, { status: 'Delayed' });
        let updatedFlight = await window.ClientStorageSolutions.fetchFlights(flights[0].flightID);
        expect(updatedFlight.status).toBe('Delayed');

        await window.ClientStorageSolutions.deleteFlight(flights[0].flightID);
        flights = await window.ClientStorageSolutions.fetchFlights();
        expect(flights.length).toBe(0);
    });

    it('should fetch, delete, mark read, and send notifications', async () => {
        await window.ClientStorageSolutions.sendNotification([1, 2], 'Hello world', { senderName: 'Test', senderAvatar: 'avatar.png' });
        let notes1 = await window.ClientStorageSolutions.fetchNotifications(1);
        expect(notes1.length).toBeGreaterThan(0);

        await window.ClientStorageSolutions.markNotificationsRead({ userID: 1 });
        notes1 = await window.ClientStorageSolutions.fetchNotifications(1);
        expect(notes1.every((n: { read: number; }) => n.read === 1)).toBe(true);

        const notificationID = notes1[0].notificationID;
        await window.ClientStorageSolutions.deleteNotifications({ notificationID });
        const notesAfterDelete = await window.ClientStorageSolutions.fetchNotifications(1);
        expect(notesAfterDelete.length).toBe(0);
    });

    it('should set, get, clear user session and current user', async () => {
        const users = [
            { userID: 1, name: 'Alice', email: 'a@example.com', password: '123', role: 0 },
            { userID: 2, name: 'Bob', email: 'b@example.com', password: '123', role: 0 },
        ];
        await window.ClientStorageWrapper.set('users', users, 'indexed');

        await window.ClientStorageSolutions.setUserSession(1);
        let currentUser = await window.ClientStorageSolutions.getCurrentUser();
        expect(currentUser).toHaveProperty('userID', 1);

        await window.ClientStorageSolutions.clearUserSession();
        currentUser = await window.ClientStorageSolutions.getCurrentUser();
        expect(currentUser).toBeNull();
    });

    it('should create, fetch, edit, and delete users', async () => {
        const newUser = await window.ClientStorageSolutions.createUser({ name: 'Test', email: 'test@example.com', password: 'pass' });
        expect(newUser).toHaveProperty('userID');

        let users = await window.ClientStorageSolutions.fetchUsers('name', 'test');
        expect(users.length).toBeGreaterThan(0);

        await window.ClientStorageSolutions.editUser(newUser.userID, { role: 2 });
        users = await window.ClientStorageSolutions.fetchUsers('userID', newUser.userID);
        expect(users[0].role).toBe(2);

        await window.ClientStorageSolutions.deleteUser(newUser.userID);
        users = await window.ClientStorageSolutions.fetchUsers('userID', newUser.userID);
        expect(users.length).toBe(0);
    });

    it('should toggle dark mode', async () => {
        await window.ClientStorageWrapper.set('darkTheme', false, 'cookie');
        await window.ClientStorageSolutions.toggleDarkMode();
        let val = await window.ClientStorageWrapper.get('darkTheme', 'cookie');
        expect(val).toBe(true);

        await window.ClientStorageSolutions.toggleDarkMode();
        val = await window.ClientStorageWrapper.get('darkTheme', 'cookie');
        expect(val).toBe(false);
    });

    it('should set and consume notifyOnReset', async () => {
        await window.ClientStorageSolutions.setNotifyOnReset({ type: 'info', message: 'Reset done' });
        let data = await window.ClientStorageSolutions.consumeNotifyOnReset();
        expect(data).toMatchObject({ type: 'info', message: 'Reset done' });

        data = await window.ClientStorageSolutions.consumeNotifyOnReset();
        expect(data).toBeNull();
    });
});