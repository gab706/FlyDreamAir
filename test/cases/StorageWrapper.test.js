/**
 * @jest-environment jsdom
 */

const StorageWrapper = require('../../src/assets/JS/StorageWrapper');

describe('StorageWrapper', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie = '';
    });

    describe('localStorage', () => {
        it('sets and gets values from localStorage', () => {
            StorageWrapper.set('key1', { hello: 'world' }, 'local');
            const result = StorageWrapper.get('key1', 'local');
            expect(result).toEqual({ hello: 'world' });
        });

        it('removes values from localStorage', () => {
            localStorage.setItem('key2', JSON.stringify('data'));
            StorageWrapper.remove('key2', 'local');
            expect(localStorage.getItem('key2')).toBeNull();
        });
    });

    describe('sessionStorage', () => {
        it('sets and gets values from sessionStorage', () => {
            StorageWrapper.set('key3', 123, 'session');
            const result = StorageWrapper.get('key3', 'session');
            expect(result).toBe(123);
        });

        it('removes values from sessionStorage', () => {
            sessionStorage.setItem('key4', JSON.stringify(true));
            StorageWrapper.remove('key4', 'session');
            expect(sessionStorage.getItem('key4')).toBeNull();
        });
    });

    describe('cookies (fallback)', () => {
        it('sets and gets cookie values when storage is unavailable', () => {
            jest.spyOn(StorageWrapper, '_canUse').mockReturnValue(false);

            StorageWrapper.set('key5', 'cookieData', 'local', { days: 1 });
            const result = StorageWrapper.get('key5', 'local');
            expect(JSON.parse(decodeURIComponent(result))).toBe('cookieData');

            StorageWrapper._canUse.mockRestore();
        });

        it('removes a cookie', () => {
            document.cookie = 'key6=value6';
            expect(document.cookie.includes('key6=')).toBe(true);
            StorageWrapper._removeCookie('key6');
            expect(document.cookie.includes('key6=')).toBe(false);
        });

        it('clears all cookies', () => {
            document.cookie = 'a=1; path=/';
            document.cookie = 'b=2; path=/';
            expect(document.cookie.includes('a=')).toBe(true);
            expect(document.cookie.includes('b=')).toBe(true);

            StorageWrapper._clearCookies();

            expect(document.cookie.includes('a=')).toBe(false);
            expect(document.cookie.includes('b=')).toBe(false);
        });
    });

    describe('clearAll', () => {
        it('clears all storages and cookies', () => {
            localStorage.setItem('k1', 'v1');
            sessionStorage.setItem('k2', 'v2');
            document.cookie = 'k3=v3; path=/';

            StorageWrapper.clearAll();

            localStorage.removeItem('__t');
            sessionStorage.removeItem('__t');

            expect(localStorage.length).toBe(0);
            expect(sessionStorage.length).toBe(0);
            expect(document.cookie.includes('k3=')).toBe(false);
        });
    });
});