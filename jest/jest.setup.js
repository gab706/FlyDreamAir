import { JSDOM } from 'jsdom';
import jQuery from 'jquery';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.$ = jQuery(dom.window);
global.jQuery = jQuery(dom.window);