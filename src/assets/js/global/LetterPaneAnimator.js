class LetterPaneAnimator {
    constructor(element, targetChar, index, charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") {
        this.element = element;
        this.targetChar = targetChar;
        this.index = index;
        this.charset = charset;
        this.interval = null;
    }

    animate() {
        if (this.targetChar === " ") {
            this.element.textContent = " ";
            return;
        }

        let count = 0;
        const maxCount = 10 + this.index * 2;

        this.interval = setInterval(() => {
            if (count > maxCount) {
                this.element.textContent = this.targetChar;
                clearInterval(this.interval);
            } else {
                this.element.textContent = this.charset[Math.floor(Math.random() * this.charset.length)];
                count++;
            }
        }, 40);
    }
}