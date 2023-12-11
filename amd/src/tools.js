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

/**
 * Display the mini toolbar. With the selected text.
 *
 * @param {Event} event The mouseup event.
 */
const handleSelection = (event) => {
    const selectedText = window.getSelection().toString().trim();

    if (selectedText.length > 0) {
        // Remove existing toolbar if any
        const existingToolbar = document.getElementById('mini-toolbar');
        if (existingToolbar) {
            existingToolbar.remove();
        }

        // Create mini toolbar
        const toolbar = document.createElement('div');
        toolbar.id = 'mini-toolbar';
        toolbar.innerHTML = `<button onclick="doSomething()">Action 1</button>
                         <button onclick="doSomethingElse()">Action 2</button>`;
        toolbar.style.position = 'absolute';
        toolbar.style.top = `${event.clientY}px`;
        toolbar.style.left = `${event.clientX}px`;
        toolbar.classList.add('btn-group'); // Bootstrap class

        document.body.appendChild(toolbar);
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
};
