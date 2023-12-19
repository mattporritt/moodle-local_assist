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

import * as Popover from 'local_assist/popover';
import $ from 'jquery'; // Jquery is required for Bootstrap 4 poppers.
import * as AssistModal from 'local_assist/modal';

/**
 *  The context id for the current page.
 * @type {integer}
 */
let contextId;

/**
 * The parent id for the popover, used to identify the popover.
 * @type {string}
 */
const parentId = 'text-selection-popover';

/**
 * The saved text selection range.
 * @type {range}
 */
let textRange = null;

/**
 * Display the modal when AI assistance is selected.
 *
 */
const displayModal = async() => {
    // Create and display the modal.
    await AssistModal.displayModal(() => {
        // Restore the saved text selection.
        restoreSelection();

        // Show the popover again.
        Popover.showPopover(parentId);
        Popover.addPopoverListeners(handlePopoverClick);
    }, true);
};

const setRange = (value) => {
    textRange = value;
};

/**
 * Restore the saved text selection.
 * Will restore the saved highlighted text range.
 */
const restoreSelection = () => {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(textRange);
};


/**
 * Handle the popover link click.
 * Receives the click event and the link id from the popover.
 *
 * @param {Event} event The click event.
 * @param {string} linkId The link id.
 */
const handlePopoverClick = (event, linkId) => {
    event.preventDefault();
    event.stopImmediatePropagation(); // Prevents the event from propagating up to the document level.

    window.console.log('Link clicked:', linkId);
    // Hide the popover.
    Popover.hidePopover(parentId);

    // Display the modal.
    displayModal();
};

/**
 * Handle text selection actions.
 * Triggered by document mouseup event.
 *
 * @param {Event} event The mouseup event.
 */
const handleSelection = async(event) => {
    // First check if we have selected text.
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    // Only update selected text if there is text actually selected, AND;
    // Either the Popover or the modal are not shown.
    if (selectedText.length > 0 && (!Popover.isPopoverVisible(parentId) || !AssistModal.modalExists())) {
        // Update the saved text range, so we always have the most recent version of selected text.
        setRange(selection.getRangeAt(0).cloneRange());
    }

    // Check conditions and show the popover.
    if (selectedText.length > 0 && !Popover.eventIsPopoverLink(event) && !AssistModal.isModalEvent(event)) {
        // Create and show popover.
        const popoverObj = await Popover.createPopover(event, parentId);
        $(popoverObj).popover('show');
        // Add event listeners to the popover links.
        Popover.addPopoverListeners(handlePopoverClick);
    }
};

/**
 * Add listener to Shadow DOM.
 *
 * @param {HTMLElement} root The root element of the Shadow DOM.
 */
const addListenerToShadowDOM = (root) => {
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

export const init = (context) => {
    contextId = context;
    window.console.log('Init tools for context:', contextId);

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
        if (Popover.popoverContains(event.target)) {
        } else {
            Popover.setStartX(event.pageX);
        }
    });

    // Global click listener to manage popover removing and stored selection clearing.
    document.addEventListener('click', (event) => {
        // Clear the stored text and kill the modal if the modal is not visible and the click target is not the popover.
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (!AssistModal.modalExists() && !Popover.popoverContains(event.target) && selectedText.length === 0) {
            setRange(null);
            Popover.removePopover(parentId); // Shouldn't happen, but just in case.
        }
    });
};
