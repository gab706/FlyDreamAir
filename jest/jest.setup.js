import { JSDOM } from 'jsdom';
import jQuery from 'jquery';
import { TextEncoder, TextDecoder } from 'util';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.$ = jQuery(dom.window);
global.jQuery = jQuery(dom.window);
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;