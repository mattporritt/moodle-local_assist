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
 * This is the cache info for the plugin.
 *
 * @package    local_assist
 * @copyright   2023 Matt Porritt <matt.porritt@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$definitions = array(
    'user_rate' => array(
        'mode' => cache_store::MODE_APPLICATION,
        'simplekeys' => true, // We use user ID as a simple key.
        'simpledata' => true, // Integer values can be treated as simple data.
        'ttl' => 3600, // Time to live in seconds.
    ),
    'request_temperature' => array(
        'mode' => cache_store::MODE_APPLICATION,
        'simplekeys' => true, // Hash can be used as a simple key.
        'simpledata' => true, // Integer values can be treated as simple data.
        'ttl' => 3600, // Time to live in seconds.
    ),
);
