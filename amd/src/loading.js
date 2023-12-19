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
 * Local assist loading screen handling.
 *
 * @module      local_assist/loading
 * @copyright   2023 Matt Porritt <matt.porritt@moodle.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import * as coreStr from 'core/str';

/**
 * Display a series of messages one by one with a specified delay between each message.
 * Returns a promise that resolves when the final message is displayed.
 *
 * @param {HTMLElement} element The element to display the messages in.
 * @param {number} delay The delay between each message in milliseconds.
 * @returns {Promise<function(): void>} A function to stop the message cycling.
 */
export const loadingMessages = async(element, delay = 6000) => {
    let stop = false;

    /**
     * Stop the message cycling.
     */
    const stopMessages = () => {
        stop = true;
    };

    const messages = await coreStr.get_strings([
        { key: 'loading_processing', component: 'local_assist' },
        { key: 'loading_generating', component: 'local_assist' },
        { key: 'loading_applying', component: 'local_assist' },
        { key: 'loading_almostdone', component: 'local_assist' }
    ]);

    return new Promise((resolve) => {
        const displayMessages = async() => {
            for (let i = 0; i < messages.length; i++) {
                if (stop) {
                    break;
                }
                element.textContent = messages[i];
                await new Promise((r) => setTimeout(r, delay));
            }
            resolve(stopMessages);
        };

        displayMessages();
    });
};
