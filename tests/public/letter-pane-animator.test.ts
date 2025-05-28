/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

import { JSDOM } from 'jsdom';
import type { DOMWindow } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jest } from '@jest/globals';

// Path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test Suite: LetterPaneAnimator
 * Purpose: Ensure animation logic ends on the correct character and works reliably with timers
 */
describe('LetterPaneAnimator', () => {
    let window: DOMWindow;
    let document: Document;

    /**
     * Setup: Create a JSDOM window and inject the animation script
     */
    beforeAll(() => {
        const dom = new JSDOM('<!DOCTYPE html><body></body>', { runScripts: 'dangerously' });
        window = dom.window;
        document = window.document;

        // Inject animation script into the virtual DOM
        const script = fs.readFileSync(
            path.resolve(__dirname, '../../src/public/js/letter-pane-animator.js'),
            'utf-8'
        );
        window.eval(script); // Defines `window.LetterPaneAnimator`
    });

    /**
     * Test: Ensure that animation ends on the correct final character
     * Simulates timer-driven character transitions and verifies end state
     */
    it('animates and ends on the correct character', () => {
        const el = document.createElement('span'); // Target element to animate into
        const Animator = window.LetterPaneAnimator;
        const animator = new Animator(el, 'Z', 0); // Animate to final character 'Z'

        // Use fake timers to control animation progression
        jest.useFakeTimers();
        animator.animate();

        const maxDelay = (10 + 1) * 40; // 10 iterations + buffer, 40ms per frame
        jest.advanceTimersByTime(maxDelay); // Fast-forward the animation

        expect(el.textContent).toBe('Z'); // Final result should match target
    });
});