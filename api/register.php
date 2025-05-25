<?php
ini_set('display_errors', 0);
error_reporting(0);

require_once 'db.php';
require_once 'rate_limit.php';
require_once 'validation.php';

// Block early if too many recent bad attempts
blockAndShowWaitTime($conn);
// Clean old attempts on each request
cleanOldAttempts($conn);

// Read raw POST JSON
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, associative: true);

if (!$data) {
    logAttempt(conn: $conn);
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
    exit;
}

// Run validation
$errors = validateInput($data);
if (!empty($errors)) {
    logAttempt($conn);
    http_response_code(400);
    echo json_encode(['status' => 'error', 'errors' => $errors]);
    exit;
}

// Extract sanitized values for DB use
$accountType = isset($data['accountType']) ? trim($data['accountType']) : '';
$username = isset($data['username']) ? trim($data['username']) : '';
$password = $data['password'] ?? '';
$fullName = isset($data['fullName']) ? trim($data['fullName']) : '';
$phoneNumber = isset($data['phoneNumber']) ? trim($data['phoneNumber']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$personTitle = isset($data['personTitle']) ? trim($data['personTitle']) : null;


// Check duplicates
$checkStmt = $conn->prepare(
    "SELECT username, email, phone_number FROM users WHERE username = ? OR email = ? OR phone_number = ?"
);

if (!$checkStmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal server error']);
    exit;
}

$checkStmt->bind_param("sss", $username, $email, $phoneNumber);
$checkStmt->execute();
$result = $checkStmt->get_result();

if ($result->num_rows > 0) {
    $existing = $result->fetch_assoc();

    $duplicates = [];
    if ($existing['username'] === $username) {
        $duplicates[] = 'username';
    }
    if ($existing['email'] === $email) {
        $duplicates[] = 'email';
    }
    if ($existing['phone_number'] === $phoneNumber) {
        $duplicates[] = 'phone number';
    }

    http_response_code(409);
    logAttempt($conn);
    echo json_encode(['status' => 'error', 'message' => 'Registered information exists: ' . implode(', ', $duplicates)]);
    exit;
}
$checkStmt->close();

// Hash password
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// Insert new user
$stmt = $conn->prepare(
    "INSERT INTO users (
        account_type, username, password, full_name,
        phone_number, email, person_title
    ) VALUES (?, ?, ?, ?, ?, ?, ?)"
);

if (!$stmt) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Internal server error']);
    exit;
}

$stmt->bind_param(
    "sssssss",
    $accountType,
    $username,
    $hashedPassword,
    $fullName,
    $phoneNumber,
    $email,
    $personTitle
);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode(['status' => 'success', 'message' => 'User registered successfully']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to register user']);
}

$stmt->close();
$conn->close();
