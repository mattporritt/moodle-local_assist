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
 * Modal display used for accessing AI assistance tools.
 *
 * @module      local_assist/modal
 * @copyright   2023 Matt Porritt <matt.porritt@moodle.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import Modal from 'core/modal';
import ModalEvents from 'core/modal_events';
import {loadingMessages} from 'local_assist/loading';

/**
 * Class for custom AI assist modal type.
 */
class AssistModal extends Modal {
    static TYPE = 'local_assist/modal';
    static TEMPLATE = 'local_assist/modal';

    registerEventListeners() {
        // Call the parent registration.
        super.registerEventListeners();

        // Register to close on save/cancel.
        this.registerCloseOnSave();
        this.registerCloseOnCancel();
    }
}

let root = null;

/**
 * Display the modal when AI assistance is selected.
 *
 * @param {function} hiddenCallback The callback to pass to the hidden event.
 * @param {string} title The title for the modal.
 * @param {boolean} showLoading Whether to show the loading spinner.
 */
export const displayModal = async(hiddenCallback, title, showLoading) => {
    const modalObject = await AssistModal.create({
        large: true,
        templateContext: {classes: 'local-assist-modal-dimensions'}
    });
    modalObject.setTitle(title);
    const modalroot = await modalObject.getRoot();
    root = modalroot[0];
    await modalObject.show();

    if (showLoading) {
        // Display the loading spinner.
        displayLoading();
    }

    modalroot.on(ModalEvents.hidden, () => {
        // Execute call back actions.
        hiddenCallback();
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

export const modalExists = () => {
    const modal = document.getElementById('local_assist-modal');
    return modal !== null;
};

export const isModalEvent = (event) => {
    let element = event.target;
    // Traverse up the DOM tree and check each parent element.
    while (element) {
        if (element.classList.contains('modal')) {
            return true;
        }
        element = element.parentElement;
    }
    return false;
};

/**
 * Display the loading action in the modal.
 *
 */
export const displayLoading = () => {
    const loadingSpinnerDiv = root.querySelector('#local_assist_spinner');
    const overlayDiv = root.querySelector('#local_assist_overlay');
    const blurDiv = root.querySelector('#local_assist_blur');
    const loadingTextDiv = root.querySelector('#local_assist_loading_text');

    loadingMessages(loadingTextDiv);
    loadingSpinnerDiv.classList.remove('hidden');
    overlayDiv.classList.remove('hidden');
    blurDiv.classList.add('local-assist-blur');
};

/**
 * Hide the loading action in the modal.
 *
 */
export const hideLoading = () => {
    const loadingSpinnerDiv = root.querySelector('#local_assist_spinner');
    const overlayDiv = root.querySelector('#local_assist_overlay');
    const blurDiv = root.querySelector('#local_assist_blur');

    loadingSpinnerDiv.classList.add('hidden');
    overlayDiv.classList.add('hidden');
    blurDiv.classList.remove('local-assist-blur');

};

/**
 * Update the modal content.
 * Can take any HTML content without javascript.
 * @param {string} bodyContent The HTML content to display in the modal.
 */
export const updateModalContent = (bodyContent) => {
    // Don't use the set body function on the modal as we don't want to replace the entire body markup.
    const modalBody = root.querySelector('#local_assist_response_content');
    modalBody.innerHTML = bodyContent;
};
