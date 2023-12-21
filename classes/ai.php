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

use core\http_client;

/**
 * Process AI API calls and generate content responses.
 *
 * @copyright   2023 Matt Porritt <matt.porritt@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class ai {
    /**
     * The AI API key.
     *
     * @var string
     */
    private string $apikey;

    /**
     * The AI organisation id.
     *
     * @var string
     */
    private string $orgid;

    /**
     * The AI API endpoint.
     *
     * @var string
     */
    private string $aiendpoint = 'https://api.openai.com/v1/chat/completions';

    /**
     * The http client.
     *
     * @var http_client
     */
    private http_client $client;

    /**
     * The AI model.
     *
     * @var string
     */
    private string $model = 'gpt-4';

    /**
     * The AI temperature. Between 0 and 2.
     *
     * @var float
     */
    private float $temperature = 0.3;


    /**
     * Array to define supported AI personalities.
     *
     * @var array
     */
    private array $personalityoptions = [
        0 => 'You are a lecturer at a higher education university',
        1 => 'You are a postgraduate lecturer at a university',
        3 => 'You are a high school teacher',
        4 => 'You are a primary school teacher',
        5 => 'You are a topic matter expert in an organisation or business',
    ];

    /**
     * The AI personality.
     *
     * @var string
     */
    private string $personality;

    /**
     * Array to define supported AI operations.
     *
     * @var array
     */
    private static array $supportedoperations = [
        'summarise' => true,
        'explain' => true,
        'questionsask' => false,
        'questionsanswer' => true,
        'translate' => true,
        'images' => false,
    ];

    /**
     * Array to define supported AI actions.
     *
     * @var array
     */
    private array $aiactions = [
        'explain' => 'Explain the provided text. Clarify complex concepts or terms.',
        'summarise' => 'Summarise the provided text. Condense long text into key points.',
        'translate' => 'Translate the provided text into another language.',
        'questionanswer' => 'Answer questions about the provided text.',
    ];

    /**
     * Class constructor.
     */
    public function __construct() {
        // Get api key from config.
        $this->apikey = get_config('local_assist', 'apikey');
        // Get api org id from config.
        $this->orgid = get_config('local_assist', 'orgid');
        // Get personality from config.
        $this->personality = $this->personalityoptions[get_config('local_assist', 'organisation')];
        // Create http client.
        $this->client = new http_client([
            'base_uri' => $this->aiendpoint,
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->apikey,
                'OpenAI-Organization' => $this->orgid,
            ]
        ]);
    }

    /**
     * Get the supported AI operations.
     *
     * @return array The supported operations.
     */
    public static function get_supported_operations(): array {
        return self::$supportedoperations;
    }

    /**
     * Generate content from the AI service.
     *
     * @param string $prompttext The prompt text.
     * @param string $action The action for the AI to perform on the supplied text.
     * @param int $contextid The context id.
     * @return array The generated content.
     */
    public function generate_content(string $prompttext, string $action, int $contextid): array {
        global $USER;

        // Check rate limiting for user before continuing.
        // If rate limit is exceeded, return an error response.
        if (!ratelimiter::is_request_allowed($USER->id)){
            return [
                'errorcode' => 429,
                'error' => 'User rate limit exceeded.',
            ];
        }

        // Update temperature.
        $this->update_temperature($prompttext, $action, $contextid, $USER->id);

        // Get request object.
        $requestobj = $this->generate_request_object($prompttext, $action);

        // Get response from AI service.
        $responsearr = $this->query_ai_api($requestobj);
        if (!isset($responsearr['errorcode'])) {
            $responsearr['prompttext'] = $prompttext;
        }

        return $responsearr;
    }

    /**
     * Generate request object ready to send to the AI service.
     *
     * @param string $prompttext The prompt text.
     * @param string $action The action for the AI to perform on the supplied text.
     * @return \stdClass The request object.
     */
    private function generate_request_object(string $prompttext, string $action): \stdClass {
        // Create the AI request object.
        $personalityobj = new \stdClass();
        $personalityobj->role = 'system';
        $personalityobj->content = $this->personality;

        $actionobj = new \stdClass();
        $actionobj->role = 'system';
        $actionobj->content = $this->aiactions[$action];

        $userobj = new \stdClass();
        $userobj->role = 'user';
        $userobj->content = $prompttext;

        $requestobj = new \stdClass();
        $requestobj->model = $this->model;
        $requestobj->temperature = $this->temperature;
        $requestobj->messages = [$personalityobj, $actionobj, $userobj];

        return $requestobj;
    }

    /**
     * Get the current temperature for the AI service.
     *
     * @param string $prompttext The prompt text.
     * @param string $action The action for the AI to perform on the supplied text.
     * @param int $contextid The context id.
     * @param int $userid The user id.
     * @return void
     */
    private function update_temperature(string $prompttext, string $action, int $contextid, int $userid): void {
        // Set up the cache API for the Tiny AI Plugin.
        $cache = \cache::make('local_assist', 'request_temperature');
        $cachekeystr = $prompttext . $action . (string)$contextid . (string)$userid;
        $cachekey = hash_pbkdf2('sha3-256', $cachekeystr, 'local_assist', 1);

        // Check cache for existing response.
        // If response is a hit then a response has already been generated for this prompt,
        // and we increase the temperature to generate a new response.
        if ($cache->get($cachekey)) {
            $this->temperature = $cache->get($cachekey) + 0.1;
        }

        // Max allowed temperature is 2.
        if ($this->temperature > 2) {
            $this->temperature = 2;
        }

        // Update the cache.
        $cache->set($cachekey, $this->temperature);
    }

    /**
     * Query the AI service.
     *
     * @param \stdClass $requestobj The request object.
     * @return array The response from the AI service.
     * @param ?http_client $client The http client.
     */
    private function query_ai_api(\stdClass $requestobj, ?http_client $client = null): array {
        // Allow for dependency injection of http client.
        if ($client) {
            $this->client = $client;
        }

        // Create the AI request object.
        $requestjson = json_encode($requestobj);

        // Call the external AI service.
        $response = $this->client->request('POST', '', [
                'body' => $requestjson,
        ]);

        // Handle the various response codes.
        $status = $response->getStatusCode();
        if ($status == 200) {
            return $this->handle_api_success($response);
        } else {
            return $this->handle_api_error($status, $response);
        }
    }

    /**
     * Handle an error from the external AI api.
     *
     * @param int $status The status code.
     * @param \GuzzleHttp\Psr7\Response $response The response object.
     * @return array The error response.
     */
    private function handle_api_error(int $status, \GuzzleHttp\Psr7\Response $response): array {

        if ($status == 500) {
            $responsearr = [
                'errorcode' => $status,
                'error' => 'Internal server error.',
            ];
        } else if ($status == 503) {
            $responsearr = [
                'errorcode' => $status,
                'error' => 'Service unavailable.',
            ];
        } else {
            $responsebody = $response->getBody();
            $bodyobj = json_decode($responsebody->getContents());
            $responsearr =[
                'errorcode' => $status,
                'error' => $bodyobj->error->message,
            ];
        }

        return $responsearr;
    }

    /**
     * Handle a successful response from the external AI api.
     *
     * @param \GuzzleHttp\Psr7\Response $response The response object.
     * @return array The response.
     */
    private function handle_api_success(\GuzzleHttp\Psr7\Response $response): array {
        $responsebody = $response->getBody();
        $bodyobj = json_decode($responsebody->getContents());

        return [
            'model' => $this->model,
            'personality' => $this->personality,
            'generateddate' => time(),
            'generatedcontent' => $bodyobj->choices[0]->message->content,
        ];
    }
}
