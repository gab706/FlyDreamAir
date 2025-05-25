class LetterPaneAnimator {
    constructor(element, targetChar, index, charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") {
        this.el = element;
        this.char = targetChar;
        this.max = 10 + index * 2;
        this.charset = charset;
    }

    animate() {
        if (this.char === " ")
            return this.el.textContent = " ";

        let count = 0;
        const charset = this.charset;
        const el = this.el;
        const target = this.char;

        const interval = setInterval(() => {
            if (count++ >= this.max) {
                el.textContent = target;
                clearInterval(interval);
            } else
                el.textContent = charset[(Math.random() * charset.length) | 0];
        }, 40);
    }
}