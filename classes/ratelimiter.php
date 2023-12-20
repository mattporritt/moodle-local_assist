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
 * Handle API request rate limiter.
 *
 * @package    local_assist
 * @copyright   2023 Matt Porritt <matt.porritt@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_assist;

/**
 * Handle API request rate limiter.
 *
 * @package    local_assist
 * @copyright   2023 Matt Porritt <matt.porritt@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class ratelimiter {

    private const CACHE_KEY_PREFIX = 'ratelimit_';
    private const REQUEST_LIMIT = 10; // Set your desired per-user request limit.
    private const TIME_WINDOW = 60; // Time window in seconds.

    /**
     * Check if the user is allowed to make a request.
     *
     * @param int $userid The user ID.
     * @return bool
     */
    public static function is_request_allowed(int $userid): bool {
        $cache = \cache::make('local_assist', 'user_rate');
        $userKey = self::CACHE_KEY_PREFIX . $userid;

        $rateLimitData = $cache->get($userKey);

        if ($rateLimitData === false) {
            // No rate limit data found for the user, allow the request and store the initial data.
            $rateLimitData = [
                    'count' => 1,
                    'timestamp' => time(),
            ];
            $cache->set($userKey, $rateLimitData);
            return true;
        }

        $currentTime = time();
        $timeDifference = $currentTime - $rateLimitData['timestamp'];

        if ($timeDifference >= self::TIME_WINDOW) {
            // The time window has passed, reset the request count and update the timestamp.
            $rateLimitData['count'] = 1;
            $rateLimitData['timestamp'] = $currentTime;
            $cache->set($userKey, $rateLimitData);
            return true;
        }

        if ($rateLimitData['count'] < self::REQUEST_LIMIT) {
            // The user still has remaining requests in the time window, increment the request count and allow the request.
            $rateLimitData['count'] += 1;
            $cache->set($userKey, $rateLimitData);
            return true;
        }

        // The user has reached the request limit within the time window, deny the request.
        return false;
    }
}
