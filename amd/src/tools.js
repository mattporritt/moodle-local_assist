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
import AssistModal from 'local_assist/modal';
// import ModalEvents from 'core/modal_events';


/**
 * Display the modal when AI assistance is selected.
 *
 */
export const displayModal = async() => {
    const modalObject = await AssistModal.create({
        large: true,
    });

    //const modalroot = await modalObject.getRoot();
    //const root = modalroot[0];

    await modalObject.show();
    // modalroot.on(ModalEvents.hidden, () => {
    //     modalObject.destroy();
    // });

    // Add the event listener for the button click events.
    // root.addEventListener('click', (e) => {
    //     const submitBtn = e.target.closest('[data-action="generate"]');
    //     const insertBtn = e.target.closest('[data-action="inserter"]');
    //     const cancelBtn = e.target.closest('[data-action="cancel"]');
    //     if (submitBtn) {
    //         e.preventDefault();
    //         // handleSubmit(editor, root, submitBtn);
    //     } else if (insertBtn) {
    //         e.preventDefault();
    //         // handleInsert(editor, root);
    //         modalObject.destroy();
    //     } else if (cancelBtn) {
    //         modalObject.destroy();
    //     }
    // });
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
    Popover.setIsPopoverInteraction(true);
    window.console.log('Link clicked:', linkId);
    // Add additional processing here if needed
    displayModal();
};

/**
 * Display the popover, with the selected text.
 *
 * @param {Event} event The mouseup event.
 */
const handleSelection = async(event) => {
    if (!Popover.getIsPopoverInteraction()) {
        const selectedText = window.getSelection().toString().trim();
        const parentId = 'text-selection-popover';
        if (selectedText.length > 0) {
            Popover.removePopover(parentId);

            const popoverObj = await Popover.createPopover(event, parentId);
            $(popoverObj).popover('show');

            Popover.addPopoverListeners(handlePopoverClick);
        } else {
            Popover.removePopover(parentId);
        }
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

export const init = () => {
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
            Popover.setIsPopoverInteraction(true);
        } else {
            Popover.setStartX(event.pageX);
            Popover.setIsPopoverInteraction(false);
        }
    });

    // Reset isPopoverInteraction when clicking outside the popover
    document.addEventListener('click', (event) => {
        if (!Popover.popoverContains(event.target)) {
            Popover.setIsPopoverInteraction(false);
        }
    });
};
