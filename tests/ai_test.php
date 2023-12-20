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

use core\http_client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use local_assist\ai;

/**
 * Unit tests for the ai class in the local_assist plugin.
 *
 * @package    local_assist
 * @category   test
 * @copyright   2023 Matt Porritt <matt.porritt@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 *
 * @coversDefaultClass \local_assist\ai
 */
class ai_test extends \advanced_testcase {

    /**
     * Test the generate content function.
     *
     * @since  Moodle 4.2
     * @return void
     */
    public function test_generate_content() {
        $this->resetAfterTest(true);
        $prompttext = 'Provide a brief introduction to a cloud computing course.';
        set_config('apikey', 'abc123', 'local_assist');
        set_config('orgid', 'abc123', 'local_assist');

        $mock = new MockHandler([
                new Response(200,),
                new Response()
        ]);
        $client = new \core\http_client(['mock' => $mock]);

        $ai = new ai();
        //$result = $ai->generate_content($prompttext);
    }

    /**
     * Test the API success response handler method.
     *
     * @since  Moodle 4.2
     * @return void
     * @covers local_assist\ai::handle_api_success
     */
    public function test_handle_api_success() {
        $responsebodyjson = <<<EOD
{
   "id":"chatcmpl-7AwwHl4wmVXd0FaBn1fgWs3MSeIiV",
   "object":"chat.completion",
   "created":1682844197,
   "model":"gpt-4-0314",
   "usage":{
      "prompt_tokens":9,
      "completion_tokens":9,
      "total_tokens":18
   },
   "choices":[
      {
         "message":{
            "role":"assistant",
            "content":"Hello! How can I help you today?"
         },
         "finish_reason":"stop",
         "index":0
      }
   ]
}
EOD;
        $response = new Response(
                200,
                ['Content-Type' => 'application/json'],
                $responsebodyjson
        );

        // We're testing a private method, so we need to setup reflector magic.
        $ai = new ai();
        $method = new ReflectionMethod('\local_assist\ai', 'handle_api_success');
        $method->setAccessible(true); // Allow accessing of private method.

        $result = $method->invoke($ai, $response);

        $this->assertEquals('Hello! How can I help you today?', $result['generatedcontent']);
        $this->assertEquals('gpt-4', $result['model']);
        $this->assertEquals('You are an undergraduate Lecturer at a university', $result['personality']);
    }

    /**
     * Test the API error response handler method.
     *
     * @since  Moodle 4.2
     * @return void
     * @covers local_assist\ai::handle_api_error
     */
    public function test_handle_api_error() {
        $responses = [
                500 => new Response(500, ['Content-Type' => 'application/json']),
                503 => new Response(503, ['Content-Type' => 'application/json']),
                401 => new Response(401, ['Content-Type' => 'application/json'],
                        '{"error": {"message": "Invalid Authentication"}}'),
                404 => new Response(404, ['Content-Type' => 'application/json'],
                        '{"error": {"message": "You must be a member of an organization to use the API"}}'),
                429 => new Response(429, ['Content-Type' => 'application/json'],
                        '{"error": {"message": "Rate limit reached for requests"}}'),
        ];

        $ai = new ai();
        $method = new ReflectionMethod('\local_assist\ai', 'handle_api_error');
        $method->setAccessible(true); // Allow accessing of private method.

        foreach($responses as $status => $response) {
            $result = $method->invoke($ai, $status, $response);
            $this->assertEquals($status, $result['errorcode']);
            if ($status == 500) {
                $this->assertEquals('Internal server error.', $result['error']);
            } else if ($status == 503) {
                $this->assertEquals('Service unavailable.', $result['error']);
            } else {
                $this->assertStringContainsString($response->getBody()->getContents(), $result['error']);
            }
        }
    }
}
