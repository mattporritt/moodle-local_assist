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
import ModalEvents from 'core/modal_events';

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
export const displayModal = async() => {
    const modalObject = await AssistModal.create({
        large: true,
    });

    const modalroot = await modalObject.getRoot();
    const root = modalroot[0];

    await modalObject.show();

    modalroot.on(ModalEvents.hidden, () => {
        window.console.log('Modal closed');
        // Restore the saved text selection.
        restoreSelection();

        // Show the popover again.
        Popover.showPopover(parentId);
        Popover.addPopoverListeners(handlePopoverClick);
        Popover.setIsPopoverInteraction(true);

        // Destroy the modal.
        modalObject.destroy();
    });

    // Add the event listener for the button click events.
    root.addEventListener('click', (e) => {
        const submitBtn = e.target.closest('[data-action="generate"]');
        const insertBtn = e.target.closest('[data-action="inserter"]');
        if (submitBtn) {
            e.preventDefault();
        } else if (insertBtn) {
            e.preventDefault();
            modalObject.destroy();
        }
    });
};

const modalExists = () => {
    const modal = document.getElementById('local_assist-modal');
    return modal !== null;
};

const isModalEvent = (event) => {
    let element = event.target;

    // Traverse up the DOM tree and check each parent element
    while (element) {
        if (element.classList.contains('modal')) {
            return true;
        }
        element = element.parentElement;
    }
    return false;
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
    window.console.log('restoring range', textRange);
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
    // Popover.setIsPopoverInteraction(true);
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
    window.console.log('\n mouse up event called');
    // window.console.log('Is popover interaction', Popover.getIsPopoverInteraction());
    window.console.log('is popoover visible', Popover.isPopoverVisible(parentId));
    window.console.log('current text range', textRange);
    window.console.log('event is popover link', Popover.eventIsPopoverLink(event), event.target);
    window.console.log('modal exists', modalExists());

    // First check if we have selected text.
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    window.console.log('Text has been selected: ', selectedText);

    // Only update selected text if there is text actually selected, AND;
    // Either the Popover or the modal are not shown.
    if (selectedText.length > 0 && (!Popover.isPopoverVisible(parentId) || !modalExists())) {
        // Update the saved text range, so we always have the most recent version of selected text.
        window.console.log('Setting text range', selection);
        setRange(selection.getRangeAt(0).cloneRange());
    }

    // Only show the popover if here is text actually selected OR saved, AND;
    // Either the Popover or the modal are not shown.
    if (selectedText.length > 0
        && !Popover.eventIsPopoverLink(event) && !isModalEvent(event)) {
        // Create and show popover.
        window.console.log('Creating popover');
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

    // Global click listener to manage popover hiding and stored swlection clearing.
    document.addEventListener('click', (event) => {
        window.console.log('\n Document click event called', event.target);
        window.console.log('Popover contains target', Popover.popoverContains(event.target));
        window.console.log('Modal exists', modalExists());

        // Close the popover if the popover is visible and the click target is not the popover.
        if (Popover.isPopoverVisible(parentId) && !Popover.popoverContains(event.target)) {
            window.console.log('popover is visible AND event does not contain Popover');
            //Popover.hidePopover(parentId);
        }

        // Clear the stored text if the modal is not visible and the click target is not the popover
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        if (!modalExists() && !Popover.popoverContains(event.target) && selectedText.length === 0) {
            window.console.log('modal does not exist AND event does not contain Popover AND there is no selected text');
            setRange(null);
            Popover.removePopover(parentId); // Shouldn't happen, but just in case.
        }
    });
};
