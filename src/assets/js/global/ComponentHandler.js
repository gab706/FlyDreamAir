class Component {
    static define(name, html, data = {}) {
        if (customElements.get(name)) return;

        const interpolatedHtml = html.replace(/\{\{(.*?)\}\}/g, (_, key) => {
            const trimmedKey = key.trim();
            return data.hasOwnProperty(trimmedKey) ? data[trimmedKey] : '';
        });

        class CustomElement extends HTMLElement {
            connectedCallback() {
                if (this.hasAttribute('data-rendered')) return;
                this.setAttribute('data-rendered', 'true');

                const template = document.createElement('template');
                template.innerHTML = interpolatedHtml.trim();

                const headElements = template.content.querySelectorAll('link[rel="stylesheet"], script[src]');

                headElements.forEach(el => {
                    const tag = el.cloneNode(true);
                    const exists = document.head.querySelector(
                        `${el.tagName.toLowerCase()}[src="${el.src}"], ${el.tagName.toLowerCase()}[href="${el.href}"]`
                    );
                    if (!exists) document.head.appendChild(tag);
                    el.remove();
                });

                this.appendChild(template.content.cloneNode(true));
            }
        }

        customElements.define(name, CustomElement);
    }

    static async defineFromURL(name, url, data = {}) {
        if (customElements.get(name)) return;

        try {
            const res = await fetch(url);
            if (!res.ok)
                return console.error(`Failed to load component from ${url}: ${res.status} ${res.statusText}`);

            const html = await res.text();
            const temp = document.createElement('template');
            temp.innerHTML = html;

            const scriptTags = temp.content.querySelectorAll('script[src]');
            const scriptPromises = Array.from(scriptTags).map(script => {
                const src = script.getAttribute('src');
                return new Promise(resolve => {
                    if (document.querySelector(`script[src="${src}"]`)) return resolve();
                    const s = document.createElement('script');
                    s.src = src;
                    s.onload = resolve;
                    document.head.appendChild(s);
                });
            });

            await Promise.all(scriptPromises);

            this.define(name, html, data);
        } catch (err) {
            console.error(`Component.defineFromURL() failed for ${name}:`, err);
        }
    }
}