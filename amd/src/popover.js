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
 * @module     local_assist/popover
 * @copyright  2023 Matt Porritt <matt.porritt@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import $ from 'jquery'; // Jquery is required for Bootstrap 4 poppers.
import Templates from 'core/templates';
import * as coreStr from 'core/str';

// Track if the popover is being interacted with.
let isPopoverInteraction = false;

// Track the X position of the mouse at the start of the text selection.
let startX = 0;

/**
 * Set the popover interaction state.
 *
 * @param {boolean} value The value to set.
 */
export const setIsPopoverInteraction = (value) => {
    isPopoverInteraction = value;
};

/**
 * Get the popover interaction state.
 *
 * @returns {boolean} The popover interaction state.
 */
export const getIsPopoverInteraction = () => {
    return isPopoverInteraction;
};

/**
 * Set the X position of the mouse at the start of the text selection.
 *
 * @param {boolean} value The value to set.
 */
export const setStartX = (value) => {
    startX = value;
};

/**
 * Check if the popover contains the target element.
 *
 * @param {HTMLElement} target The target element.
 */
export const popoverContains = (target) => {
    const popoverParent = document.getElementById('text-selection-popover');
    if (popoverParent && popoverParent.nextElementSibling) {
        const popoverElem = popoverParent.nextElementSibling;
        return popoverElem && popoverElem.contains(target);
    } else {
        return false;
    }
};

/**
 * Create the popover and load its content.
 *
 * @param {Event} event The mouseup event.
 * @param {string} parentId The ID of the element to be used as the parent of the popover.
 */
export const createPopover = async(event, parentId) => {
    const popperContent = await Templates.render('local_assist/popover', {});
    const popoverTitle = await coreStr.get_string('popover_title', 'local_assist');

    const endX = event.clientX;
    const x = startX < endX ? endX : startX;
    const y = event.clientY;

    const popover = document.createElement('div');
    popover.id = parentId;
    popover.style.position = 'absolute';
    popover.style.top = `${y}px`;
    popover.style.left = `${x}px`;
    document.body.appendChild(popover);

    $(popover).popover({
        placement: 'right',
        content: popperContent,
        title: popoverTitle,
        html: true,
        trigger: 'manual',
        offset: '15, 0'
    });

    return popover;
};

/**
 * Add event listeners to the popover.
 *
 * @param {function} clickHandler The function to call when a link is clicked.
 */
export const addPopoverListeners = (clickHandler) => {
    document.querySelectorAll('.tool-assist-options a').forEach((link) => {
        link.addEventListener('click', (event) => {
            clickHandler(event, link.id); // Use the callback function
        });
    });
};

export const eventIsPopoverLink = (event) => {
    const validIds = [
        "tool-assist-popover-summarise",
        "tool-assist-popover-translate",
        "tool-assist-popover-explain",
        "tool-assist-popover-question"
    ];
    let targetElement = event.target;

    // Traverse up to 3 levels up from the target element
    for (let i = 0; i < 3; i++) {
        if (validIds.includes(targetElement.id)) {
            return true;
        }
        // Move up to the parent element
        targetElement = targetElement.parentElement;
        if (!targetElement) {
            break;
        }
    }
    return false;
};

/**
 * Remove existing popover and its parent element.
 *
 * @param {string} parentId The ID of the element used as the parent of the popover.
 */
export const removePopover = (parentId) => {
    $('#' + parentId).popover('hide').remove();
};

/**
 * Hide existing popover.
 *
 * @param {string} parentId The ID of the element used as the parent of the popover.
 */
export const hidePopover = (parentId) => {
    $('#' + parentId).popover('hide');
};

/**
 * Show existing popover.
 *
 * @param {string} parentId The ID of the element used as the parent of the popover.
 */
export const showPopover = (parentId) => {
    $('#' + parentId).popover('show');
};

/**
 * Checks if the popover is visible.
 *
 * @param {string} parentId The ID of the element used as the parent of the popover.
 * @returns {boolean} True if the popover is visible.
 */
export const isPopoverVisible = (parentId) => {
    // Check if the popover element exists and is visible
    const popover = $('#' + parentId).data('bs.popover');
    return popover ? $(popover.getTipElement()).is(':visible') : false;
};
