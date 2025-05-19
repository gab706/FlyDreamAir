class Component {
    /**
     * Defines a new custom element with the given tag name and HTML content.
     * Injects <link> and <script> elements into <head>, and places the remaining
     * content directly into the element (light DOM, no Shadow DOM).
     *
     * @param {string} name - Custom element tag name (e.g. 'fly-navbar').
     * @param {string} html - HTML string loaded from file or inline.
     */
    static define(name, html) {
        // Skip if the element has already been defined
        if (customElements.get(name)) return;

        // Define a new class extending HTMLElement
        class CustomElement extends HTMLElement {
            connectedCallback() {
                // Prevent double-rendering if already processed
                if (this.hasAttribute('data-rendered')) return;
                this.setAttribute('data-rendered', 'true');

                // Parse the HTML string into a template element
                const template = document.createElement('template');
                template.innerHTML = html.trim();

                // Extract all <link rel="stylesheet"> and <script src="..."> tags
                const headElements = template.content.querySelectorAll('link[rel="stylesheet"], script[src]');

                headElements.forEach(el => {
                    const tag = el.cloneNode(true); // Clone to keep original in component content

                    // Prevent duplicate loading of the same script/style
                    const exists = document.head.querySelector(
                        `${el.tagName.toLowerCase()}[src="${el.src}"], ${el.tagName.toLowerCase()}[href="${el.href}"]`
                    );

                    if (!exists) {
                        document.head.appendChild(tag); // Inject into <head>
                    }

                    el.remove(); // Remove from component content to avoid duplicate rendering
                });

                // Append the remaining HTML into the component instance
                this.appendChild(template.content.cloneNode(true));
            }
        }

        // Register the new custom element globally
        customElements.define(name, CustomElement);
    }

    /**
     * Loads an external HTML file and defines a custom element from it.
     * Ensures all <script src="..."> files in the HTML are loaded and executed
     * before the component is inserted and activated.
     *
     * @param {string} name - Custom element tag name.
     * @param {string} url - URL of the external .html file for the component.
     */
    static async defineFromURL(name, url) {
        // Avoid redefining an element
        if (customElements.get(name)) return;

        try {
            // Fetch the raw HTML from the provided URL
            const res = await fetch(url);

            if (!res.ok)
                return console.error(`Failed to load component from ${url}: ${res.status} ${res.statusText}`);

            const html = await res.text();

            // Parse the fetched HTML temporarily to extract <script src="..."> tags
            const temp = document.createElement('template');
            temp.innerHTML = html;

            const scriptTags = temp.content.querySelectorAll('script[src]');

            // Create a promise for each external script to load it before defining
            const scriptPromises = Array.from(scriptTags).map(script => {
                const src = script.getAttribute('src');

                return new Promise(resolve => {
                    // Avoid injecting duplicate <script> tags
                    if (document.querySelector(`script[src="${src}"]`)) return resolve();

                    const s = document.createElement('script');
                    s.src = src;
                    s.onload = resolve; // Resolve promise when script is loaded
                    document.head.appendChild(s);
                });
            });

            // Wait for all scripts to load before defining the component
            await Promise.all(scriptPromises);

            // Now that required scripts are loaded, define the component
            this.define(name, html);
        } catch (err) {
            console.error(`Component.defineFromURL() failed for ${name}:`, err);
        }
    }
}