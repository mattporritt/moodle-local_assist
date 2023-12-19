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
 * This is the external API for this component.
 *
 * @package    local_assist
 * @copyright   2023 Matt Porritt <matt.porritt@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_assist;

use core_external\external_api;
use core_external\external_function_parameters;
use core_external\external_value;

/**
 * This is the external API for this component.
 *
 * @copyright   2023 Matt Porritt <matt.porritt@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class external extends external_api {

    /**
     * Generate content parameters.
     *
     * @since  Moodle 4.4
     * @return external_function_parameters
     */
    public static function ai_generate_parameters(): external_function_parameters {
        return new external_function_parameters(
            [
                'contextid' => new external_value(
                    PARAM_INT,
                    'The context ID',
                    VALUE_REQUIRED),
                'selectedtext' => new external_value(
                    PARAM_NOTAGS,
                    'The selected text to provide to the AI service',
                    VALUE_REQUIRED),
                'action' => new external_value(
                    PARAM_ALPHAEXT,
                    'The action to perform with the selected text',
                    VALUE_REQUIRED)
            ]
        );
    }

    /**
     * Generate content from the AI service.
     *
     * @since  Moodle 4.4
     * @param int $contextid The context ID.
     * @param string $prompttext The data encoded as a json array.
     * @param string $action The action for the AI to perform on the supplied text.
     *
     * @return array The generated content.
     */
    public static function ai_generate(int $contextid, string $prompttext, string $action): array {
        \core\session\manager::write_close(); // Close session early this is a read op.
        // Parameter validation.
        [
            'contextid' => $contextid,
            'prompttext' => $prompttext,
            'action' => $action,
        ] = self::validate_parameters(self::ai_generate_parameters(), [
            'contextid' => $contextid,
            'prompttext' => $prompttext,
            'action' => $action,
        ]);
        // Context validation and permission check.
        // Get the context from the passed in ID.
        $context = \context::instance_by_id($contextid);

        // Check the user has permission to use the AI service.
        self::validate_context($context);
        require_capability('local/assist:use', $context);

        // Execute API call.
        //$ai = new \local_assist\ai();
        //return $ai->ai_generate($prompttext, $contextid);
        return [];
    }

    /**
     * Generate content return value.
     *
     * @since  Moodle 4.4
     * @return external_function_parameters
     */
    public static function ai_generate_returns(): external_function_parameters {
        return new external_function_parameters([
                'selectedtext' => new external_value(
                        PARAM_NOTAGS,
                        'Original prompt text',
                        VALUE_OPTIONAL),
                'model' => new external_value(
                        PARAM_ALPHANUMEXT,
                        'AI model used',
                        VALUE_OPTIONAL),
                'personality' => new external_value(
                        PARAM_TEXT,
                        'AI personality used',
                        VALUE_OPTIONAL),
                'generateddate' => new external_value(
                        PARAM_INT,
                        'Date AI content was generated',
                        VALUE_OPTIONAL),
                'generatedcontent' => new external_value(
                        PARAM_RAW,
                        'AI generated content',
                        VALUE_OPTIONAL),
                'errorcode' => new external_value(
                        PARAM_INT,
                        'Error code if any',
                        VALUE_OPTIONAL),
                'error' => new external_value(
                        PARAM_TEXT,
                        'Error message if any',
                        VALUE_OPTIONAL)
        ]);
    }
}
