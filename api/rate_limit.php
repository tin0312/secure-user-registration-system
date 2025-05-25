<?php
define('RATE_LIMIT_MAX_ATTEMPTS', 5);
define('RATE_LIMIT_COOLDOWN', 60);
define('RATE_LIMIT_BASE_WAIT', 60);

function cleanOldAttempts($conn)
{
    $cutoff = time() - RATE_LIMIT_COOLDOWN;
    $stmt = $conn->prepare("DELETE FROM rate_limit_attempts WHERE attempt_time < ?");
    $stmt->bind_param('i', $cutoff);
    $stmt->execute();
    $stmt->close();
}

function getClientIP()
{
    if (!empty($_SERVER['HTTP_CLIENT_IP']))
        return $_SERVER['HTTP_CLIENT_IP'];
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR']))
        return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function getAttempts($conn, $ip)
{
    $cutoff = time() - RATE_LIMIT_COOLDOWN;
    $stmt = $conn->prepare("SELECT attempt_time FROM rate_limit_attempts WHERE ip = ? AND attempt_time > ? ORDER BY attempt_time ASC");
    $stmt->bind_param('si', $ip, $cutoff);
    $stmt->execute();
    $res = $stmt->get_result();
    $times = [];
    while ($row = $res->fetch_assoc())
        $times[] = (int) $row['attempt_time'];
    $stmt->close();
    return $times;
}

function logAttempt($conn)
{
    $ip = getClientIP();
    $stmt = $conn->prepare("INSERT INTO rate_limit_attempts (ip, attempt_time) VALUES (?, ?)");
    $now = time();
    $stmt->bind_param('si', $ip, $now);
    $stmt->execute();
    $stmt->close();
}

function blockAndShowWaitTime($conn)
{
    $ip = getClientIP();
    $attempts = getAttempts($conn, $ip);
    $count = count($attempts);

    if ($count <= RATE_LIMIT_MAX_ATTEMPTS)
        return;

    $wait = RATE_LIMIT_BASE_WAIT * pow(2, $count - RATE_LIMIT_MAX_ATTEMPTS - 1);
    $sinceLast = time() - max($attempts);
    $remaining = $wait - $sinceLast;

    if ($remaining > 0) {
        http_response_code(429);
        echo json_encode(['status' => 'error', 'message' => "Too many attempts. Wait {$remaining} seconds."]);
        exit;
    }
}