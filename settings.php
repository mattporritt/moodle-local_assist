<?php
// This file is part of Moodle - https://moodle.org/
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
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Plugin administration pages are defined here.
 *
 * @package     local_assist
 * @category    admin
 * @copyright   2023 Matt Porritt <matt.porritt@moodle.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_assist_settings', new lang_string('pluginname', 'local_assist'));

    if ($ADMIN->fulltree) {
        // Setting to store OpenAI API key.
        $settings->add(new admin_setting_configpasswordunmask('local_assist/apikey',
            new lang_string('apikey', 'local_assist'),
            new lang_string('apikey_desc', 'local_assist'),
            ''));

        // Setting to store OpenAI organization ID.
        $settings->add(new admin_setting_configtext('local_assist/orgid',
            new lang_string('orgid', 'local_assist'),
            new lang_string('orgid_desc', 'local_assist'),
            '',
            PARAM_TEXT));

        // Array of personality options.
        $personalityoptions = array(
            0 => new lang_string('organisation_university', 'local_assist'),
            1 => new lang_string('organisation_postgrad', 'local_assist'),
            2 => new lang_string('organisation_highschool', 'local_assist'),
            3 => new lang_string('organisation_primaryschool', 'local_assist'),
            4 => new lang_string('organisation_industry', 'local_assist'),
        );

        // Setting to store personality.
        $settings->add(new admin_setting_configselect('local_assist/organisation',
            new lang_string('organisation', 'local_assist'),
            new lang_string('organisation_desc', 'local_assist'),
            0,
            $personalityoptions));
    }
    $ADMIN->add('localplugins', $settings);
}
