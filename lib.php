<?php
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
 * Moodle AI Assist plugin lib
 *
 * @package     local_assist
 * @copyright   2023 Matt Porritt <matt.porritt@moodle.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Hook that is called on every page in Moodle LMS.
 * This will load the initial JS for the plugin tools, allowing access to the
 * functionality from anywhere in Moodle. For users with the correct capability.
 * @return void
 */
function local_assist_before_standard_html_head() {
    global $PAGE;
    $context = $PAGE->context;
    // TODO: Add capability check here.

    $PAGE->requires->js_call_amd('local_assist/tools', 'init', [$context->id]);
}
