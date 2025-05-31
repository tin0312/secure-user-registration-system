<?php
define('RATE_LIMIT_MAX_ATTEMPTS', 5);
define('RATE_LIMIT_COOLDOWN', 60);
define('RATE_LIMIT_BASE_WAIT', 60);

function cleanOldAttempts($conn)
{
    $cutoff = time() - RATE_LIMIT_COOLDOWN;
    $stmt = $conn->prepare("DELETE FROM rate_limit_attempts WHERE last_attempt_time < ?");
    $stmt->bind_param('i', $cutoff);
    $stmt->execute();
    $stmt->close();
}

function getClientIP()
{
    return
        $_SERVER['HTTP_CLIENT_IP'] ??
        explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '')[0] ?:
        ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
}


function getAttempts($conn, $ip)
{
    $cutoff = time() - RATE_LIMIT_COOLDOWN;
    $stmt = $conn->prepare("
        SELECT attempt_count, last_attempt_time
        FROM rate_limit_attempts
        WHERE ip = ? AND last_attempt_time > ?
    ");
    $stmt->bind_param('si', $ip, $cutoff);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    $stmt->close();
    return $row ?: ['attempt_count' => 0, 'last_attempt_time' => 0];
}

function logAttempt($conn)
{
    $ip = getClientIP();
    $now = time();

    $stmt = $conn->prepare("
        INSERT INTO rate_limit_attempts (ip, attempt_count, last_attempt_time)
        VALUES (?, 1, ?)
        ON DUPLICATE KEY UPDATE
            attempt_count = attempt_count + 1,
            last_attempt_time = VALUES(last_attempt_time)
    ");

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Internal server error']);
        exit;
    }

    $stmt->bind_param('si', $ip, $now);
    $stmt->execute();
    $stmt->close();
}

function blockAndShowWaitTime($conn)
{
    $ip = getClientIP();
    $data = getAttempts($conn, $ip);
    $count = (int) $data['attempt_count'];
    $lastAttempt = (int) $data['last_attempt_time'];

    if ($count <= RATE_LIMIT_MAX_ATTEMPTS)
        return;

    $wait = RATE_LIMIT_BASE_WAIT * pow(2, $count - RATE_LIMIT_MAX_ATTEMPTS - 1);
    $sinceLast = time() - $lastAttempt;
    $remaining = $wait - $sinceLast;

    if ($remaining > 0) {
        http_response_code(429);
        echo json_encode(['status' => 'error', 'message' => "Too many attempts. Wait {$remaining} seconds."]);
        exit;
    }
}