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


/**
 * Display the modal when AI assistance is selected.
 *
 * @param {function} hiddenActions The callback to pass to the hidden event.
 */
export const displayModal = async(hiddenActions) => {
    const modalObject = await AssistModal.create({
        large: true,
    });
    const modalroot = await modalObject.getRoot();
    const root = modalroot[0];
    await modalObject.show();

    modalroot.on(ModalEvents.hidden, () => {
        // Execute call back actions.
        hiddenActions();
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
