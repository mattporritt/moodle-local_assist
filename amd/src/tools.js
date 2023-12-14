// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Module to load and render the tools for the AI assist plugin.
 *
 * @module     local_assist/tools
 * @copyright  2023 Matt Porritt <matt.porritt@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import $ from 'jquery'; // Jquery is required for Bootstrap 4 poppers.
import Templates from 'core/templates';
import * as coreStr from 'core/str';

let startX = 0; // Global variable to store the start X position of the mouse.

/**
 * Display the mini toolbar. With the selected text.
 *
 * @param {Event} event The mouseup event.
 */
const handleSelection = async(event) => {
    const selectedText = window.getSelection().toString().trim();
    const endX = event.clientX; // X position at the end of selection.
    window.console.log(selectedText);

    if (selectedText.length > 0) {
        // Remove existing toolbar if any.
        $('#text-selection-popover').popover('hide').remove();

        // Get popover content.
        const popperContent = await Templates.render('local_assist/popover', {});

        // Get popover title.
        const popoverTitle = await coreStr.get_string('popover_title', 'local_assist');

        // Calculate the position of the popover.
        const x = startX < endX ? endX : startX; // Use the smaller X position.
        const y = event.clientY;

        // Create the popover using vanilla JavaScript.
        const popover = document.createElement('div');
        popover.id = 'text-selection-popover';
        popover.style.position = 'absolute';
        popover.style.top = `${y}px`;
        popover.style.left = `${x}px`;
        document.body.appendChild(popover);

        // Initialize the popover using Bootstrap (which still uses jQuery).
        $(popover).popover({
            placement: 'right',
            content: popperContent,
            title: popoverTitle,
            html: true,
            trigger: 'manual',
            offset: '15, 0' // Adjusts the popover position.
        });

        $(popover).popover('show');
    } else {
        $('#text-selection-popover').popover('hide').remove();
    }
};

/**
 * Add listener to Shadow DOM.
 *
 * @param {HTMLElement} root The root element of the Shadow DOM.
 */
const addListenerToShadowDOM = (root)=> {
    root.addEventListener('mouseup', handleSelection);
};

/**
 * Add listener to iFrame.
 *
 * @param {HTMLIFrameElement} iframe The iFrame element.
 */
const addListenerToIframe = (iframe) => {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    iframeDocument.addEventListener('mouseup', handleSelection);
};

export const init = () => {
    window.console.log('loaded');

    // Add listener to  Shadow DOM.
    const shadowElements = document.querySelectorAll('*');
    shadowElements.forEach(el => {
        if (el.shadowRoot) {
            addListenerToShadowDOM(el.shadowRoot);
        }
    });

    // Add listener to  iFrames.
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(addListenerToIframe);

    // Add listener to  main document.
    document.addEventListener('mouseup', handleSelection);

    // Track the start of text selection.
    document.addEventListener('mousedown', (event) => {
        startX = event.clientX; // Update startX on mousedown.
    });
};
