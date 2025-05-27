import { JSDOM } from 'jsdom';
import type { DOMWindow } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('LetterPaneAnimator', () => {
    let window: DOMWindow;
    let document: Document;

    beforeAll(() => {
        const dom = new JSDOM('<!DOCTYPE html><body></body>', { runScripts: 'dangerously' });
        window = dom.window;
        document = window.document;

        const script = fs.readFileSync(
            path.resolve(__dirname, '../../src/public/js/letter-pane-animator.js'),
            'utf-8'
        );

        window.eval(script);
    });

    it('animates and ends on the correct character', () => {
        const el = document.createElement('span');
        const Animator = window.LetterPaneAnimator;
        const animator = new Animator(el, 'Z', 0);

        jest.useFakeTimers();
        animator.animate();

        const maxDelay = (10 + 1) * 40;
        jest.advanceTimersByTime(maxDelay);

        expect(el.textContent).toBe('Z');
    });
});