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
 * Plugin strings are defined here.
 *
 * @package     local_assist
 * @category    string
 * @copyright   2023 Matt Porritt <matt.porritt@moodle.com>
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$string['pluginname'] = 'Learner Assist';
$string['assist:use'] = 'Use AI content generator';
$string['apikey'] = 'OpenAI API key';
$string['apikey_desc'] = 'Enter your OpenAI API key. You can get one from https://platform.openai.com/account/api-keys';
$string['buttontitle'] = 'Add AI content';
$string['cachedef_user_rate'] = 'Cache to Learner Assist Plugin rate limiting information.';
$string['cachedef_request_temperature']= 'Cache to Learner Assist Plugin request temperature.';
$string['generate'] = 'Generate';
$string['generating'] = 'Generating...';
$string['insert'] = 'Insert';
$string['loading_almostdone'] = 'Almost done...';
$string['loading_applying'] = 'Applying the finishing touches...';
$string['loading_generating'] = 'Generating the text...';
$string['loading_processing'] = 'Processing your request...';
$string['orgid'] = 'OpenAI organization ID';
$string['orgid_desc'] = 'Enter your OpenAI organization ID. You can get one from https://platform.openai.com/account/org-settings';
$string['organisation_university'] = 'University';
$string['organisation_postgrad'] = 'University postgraduate only';
$string['organisation_highschool'] = 'High School';
$string['organisation_primaryschool'] = 'Primary School';
$string['organisation_industry'] = 'Professional organisation or business';
$string['organisation'] = 'Organisation type';
$string['organisation_desc'] = 'Select the type the best describes your organisation.';
$string['popover_title'] = 'Get AI assistance on this selection';
$string['prompttext_label'] = 'Enter prompt text';
$string['prompttext_placeholder'] = 'Example: write a short introduction for an undergraduate course on cloud computing';
$string['responsetext_label'] = 'Generated response';
$string['responsetext_placeholder'] = 'Generated response will appear here. First enter prompt text and press generate.';
$string['selector_explain'] = 'Explain: Clarify complex concepts or terms.';
$string['selector_questions'] = 'Answer Questions: Respond to specific queries about the text.';
$string['selector_summarise'] = 'Summarize: Condense long texts into key points.';
$string['selector_translate'] = 'Translate: Offer translations for non-native language texts.';
$string['title_explain'] = 'AI Assist - Explaining Content';
$string['title_questionanswer'] = 'AI Assist - Ask Questions About Content';
$string['title_summarise'] = 'AI Assist - Summarising Content';
$string['title_translate'] = 'AI Assist - Translating Content';
