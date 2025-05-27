import $ from 'jquery';

describe('jQuery basic DOM manipulation (TypeScript)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <button id="btn">Click me</button>
            <div id="output"></div>
        `;
    });

    it('should update #output text on button click', () => {
        $('#btn').on('click', () => {
            $('#output').text('Button clicked!');
        });

        $('#btn').trigger('click');

        expect($('#output').text()).toBe('Button clicked!');
    });
});