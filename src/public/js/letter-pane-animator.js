/**
 * @license
 * FlyDreamAir License Version 1.0 – May 2025
 * This source code is licensed under a custom license.
 * See the LICENSE.md file in the root directory of this source tree for full details.
 */

/**
 * LetterPaneAnimator
 *
 * Purpose:
 * - Animates a text element to simulate a "scrambling" character transition
 * - Useful for futuristic UI effects (e.g., terminal text, loading screens)
 */
class LetterPaneAnimator {
    /**
     * @param {HTMLElement} element - The DOM element to animate
     * @param {string} targetChar - The final character to resolve to
     * @param {number} index - The index position of this character (used for delay)
     * @param {string} charset - Optional: the characters used in the animation
     */
    constructor(element, targetChar, index, charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") {
        this.el = element;
        this.char = targetChar;
        this.max = 10 + index * 2; // Number of frames until targetChar is locked in
        this.charset = charset;
    }

    /**
     * Runs the character animation
     */
    animate() {
        if (this.char === " ")
            return this.el.textContent = " ";

        let count = 0;
        const charset = this.charset;
        const el = this.el;
        const target = this.char;

        const interval = setInterval(() => {
            if (count++ >= this.max) {
                el.textContent = target; // Final character
                clearInterval(interval);
            } else {
                // Pick a random character from charset
                el.textContent = charset[(Math.random() * charset.length) | 0];
            }
        }, 40);
    }
}

// Expose to global scope in browser
if (typeof window !== "undefined") {
    window.LetterPaneAnimator = LetterPaneAnimator;
}