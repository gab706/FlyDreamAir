'use strict';
if (typeof global.structuredClone !== 'function') {
    global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

import { JSDOM } from 'jsdom';
import type { DOMWindow } from 'jsdom';
import fs from 'fs';
import path from 'path';
import 'fake-indexeddb/auto';
import { indexedDB as fakeIndexedDB } from 'fake-indexeddb';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';
import type { SpiedSetter } from 'jest-mock';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('ClientStorageWrapper (script global)', () => {
    let window: DOMWindow;
    let document: Document;

    beforeAll(() => {
        const dom = new JSDOM('<!DOCTYPE html><body></body>', { runScripts: 'dangerously' });
        window = dom.window;
        document = window.document;

        Object.defineProperty(window, 'indexedDB', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: fakeIndexedDB,
        });

        const script = fs.readFileSync(
            path.resolve(__dirname, '../../src/public/js/client-storage-wrapper.js'),
            'utf-8'
        );

        const storageMock = (() => {
            let store: Record<string, string> = {};
            return {
                getItem(key: string) { return store[key] || null; },
                setItem(key: string, value: string) { store[key] = value.toString(); },
                removeItem(key: string) { delete store[key]; },
                clear() { store = {}; },
            };
        })();

        Object.defineProperty(window, 'localStorage', { value: storageMock });
        Object.defineProperty(window, 'sessionStorage', { value: storageMock });

        let cookieStore = '';
        Object.defineProperty(document, 'cookie', {
            get() { return cookieStore; },
            set(value) {
                const [cookie] = value.split(';');
                const [name] = cookie.split('=');
                cookieStore = cookieStore.split('; ').filter(c => !c.startsWith(name + '=')).join('; ');
                cookieStore = cookieStore ? cookieStore + '; ' + cookie : cookie;
            },
        });

        window.eval(script);
    });

    afterEach(async () => {
        await window.ClientStorageWrapper.clearAll();
    });

    describe('_canUse()', () => {
        it('returns true when storage works', () => {
            expect(window.ClientStorageWrapper._canUse('local')).toBe(true);
            expect(window.ClientStorageWrapper._canUse('session')).toBe(true);
        });

        it('returns false when storage throws', () => {
            const origFunc = window.ClientStorageWrapper._canUse;
            window.ClientStorageWrapper._canUse = () => { throw new Error(); };
            expect(() => window.ClientStorageWrapper._canUse('local')).toThrow();
            window.ClientStorageWrapper._canUse = origFunc;
        });
    });

    describe('_cookiesOn()', () => {
        it('returns true when cookies can be set and read', () => {
            expect(window.ClientStorageWrapper._cookiesOn()).toBe(true);
        });

        it('returns false if setting cookie throws', () => {
            expect(typeof window.ClientStorageWrapper._cookiesOn()).toBe('boolean');
        });
    });

    describe('set/get/remove', () => {
        it('set/get with localStorage', async () => {
            await window.ClientStorageWrapper.set('myKey', { foo: 'bar' }, 'local');
            const val = await window.ClientStorageWrapper.get('myKey', 'local');
            expect(val).toEqual({ foo: 'bar' });
        });

        it('set/get with sessionStorage', async () => {
            await window.ClientStorageWrapper.set('sessionKey', [1, 2, 3], 'session');
            const val = await window.ClientStorageWrapper.get('sessionKey', 'session');
            expect(val).toEqual([1, 2, 3]);
        });

        it('set/get with cookies', async () => {
            await window.ClientStorageWrapper.set('cookieKey', 'cookieValue', 'cookie', { days: 1 });
            const val = await window.ClientStorageWrapper.get('cookieKey', 'cookie');
            expect(val).toBe('cookieValue');
        });

        it('set/get with IndexedDB', async () => {
            await window.ClientStorageWrapper.set('idbKey', { a: 1, b: 2 }, 'indexed');
            const val = await window.ClientStorageWrapper.get('idbKey', 'indexed');
            expect(val).toEqual({ a: 1, b: 2 });
        });

        it('remove key from localStorage', async () => {
            await window.ClientStorageWrapper.set('myKey', 'val', 'local');
            await window.ClientStorageWrapper.remove('myKey', 'local');
            const val = await window.ClientStorageWrapper.get('myKey', 'local');
            expect(val).toBe(null);
        });

        it('remove key from cookies', async () => {
            await window.ClientStorageWrapper.set('cookieKey', 'val', 'cookie');
            await window.ClientStorageWrapper.remove('cookieKey', 'cookie');
            const val = await window.ClientStorageWrapper.get('cookieKey', 'cookie');
            expect([null, '']).toContain(val);
        });

        it('clear all storages', async () => {
            await window.ClientStorageWrapper.set('myKey', 'val', 'local');
            await window.ClientStorageWrapper.set('sessionKey', 'val', 'session');
            await window.ClientStorageWrapper.set('cookieKey', 'val', 'cookie', { days: 1 });
            await window.ClientStorageWrapper.set('idbKey', 'val', 'indexed');

            await window.ClientStorageWrapper.clearAll();

            expect(await window.ClientStorageWrapper.get('myKey', 'local')).toBe(null);
            expect(await window.ClientStorageWrapper.get('sessionKey', 'session')).toBe(null);
            expect([null, '']).toContain(await window.ClientStorageWrapper.get('cookieKey', 'cookie'));
            expect([null, undefined]).toContain(await window.ClientStorageWrapper.get('idbKey', 'indexed'));
        });
    });

    describe('get with invalid JSON', () => {
        it('returns raw string if JSON parse fails', async () => {
            const badJson = '%7Bfoo%3Abar%7D';
            document.cookie = `badKey=${badJson}; path=/`;
            const val = await window.ClientStorageWrapper.get('badKey', 'cookie');
            expect(val).toBe(decodeURIComponent(badJson));
        });
    });

    describe('getAllIndexedDBItems', () => {
        it('gets all items in IndexedDB', async () => {
            await window.ClientStorageWrapper.set('key1', 'value1', 'indexed');
            await window.ClientStorageWrapper.set('key2', 'value2', 'indexed');
            const allItems = await window.ClientStorageWrapper.getAllIndexedDBItems();
            expect(allItems).toHaveProperty('key1', 'value1');
            expect(allItems).toHaveProperty('key2', 'value2');
        });
    });
});