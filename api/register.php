<?php
ini_set('display_errors', 0);
error_reporting(0);

require_once 'db.php';
require_once 'rate_limit.php';
require_once 'validation.php';

// Block early if too many recent bad attempts
blockAndShowWaitTime($conn);
cleanOldAttempts($conn);

// Read raw POST JSON
$inputJSON = file_get_contents('php://input');
$data = json_decode($inputJSON, associative: true);

// Validate JSON input
if (!$data) {
    logAttempt($conn);
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON input']);
    exit;
}

// Validate input data
$errors = validateInput($data);
if (!empty($errors)) {
    logAttempt($conn);
    http_response_code(400);
    echo json_encode(['status' => 'error', 'errors' => $errors]);
    exit;
}

// Extract sanitized values
$accountType = isset($data['accountType']) ? trim($data['accountType']) : '';
$username = isset($data['username']) ? trim($data['username']) : '';
$password = $data['password'] ?? '';
$fullName = isset($data['fullName']) ? trim($data['fullName']) : '';
$phoneNumber = isset($data['phoneNumber']) ? trim($data['phoneNumber']) : '';
$email = isset($data['email']) ? trim($data['email']) : '';
$personTitle = isset($data['personTitle']) ? trim($data['personTitle']) : null;

$transactionStarted = false;
try {
    // Check for duplicates
    $checkStmt = $conn->prepare("
        SELECT username, email, phone_number 
        FROM users 
        WHERE username = ? OR email = ? OR phone_number = ?
    ");
    if (!$checkStmt) {
        throw new Exception('Failed to prepare duplicate check statement.');
    }
    $checkStmt->bind_param("sss", $username, $email, $phoneNumber);
    $checkStmt->execute();
    $result = $checkStmt->get_result();
    if ($result->num_rows > 0) {
        $existing = $result->fetch_assoc();
        $duplicates = [];
        if ($existing['username'] === $username)
            $duplicates[] = 'username';
        if ($existing['email'] === $email)
            $duplicates[] = 'email';
        if ($existing['phone_number'] === $phoneNumber)
            $duplicates[] = 'phone number';

        logAttempt($conn);
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Registered information exists: ' . implode(', ', $duplicates)]);
        exit;
    }
    $checkStmt->close();

    // Lookup account type ID
    $typeStmt = $conn->prepare("SELECT account_type_id FROM account_types WHERE type_name = ?");
    if (!$typeStmt) {
        throw new Exception('Failed to prepare account type lookup statement.');
    }
    $typeStmt->bind_param("s", $accountType);
    $typeStmt->execute();
    $typeResult = $typeStmt->get_result();
    if ($typeResult->num_rows === 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid account type']);
        exit;
    }
    $typeRow = $typeResult->fetch_assoc();
    $accountTypeId = $typeRow['account_type_id'];
    $typeStmt->close();

    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Start transaction
    $conn->begin_transaction();
    $transactionStarted = true;

    // Insert user
    $stmt = $conn->prepare("
        INSERT INTO users (account_type_id, username, password, full_name, phone_number, email)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    if (!$stmt) {
        throw new Exception('Failed to prepare user insert statement.');
    }
    $stmt->bind_param("isssss", $accountTypeId, $username, $hashedPassword, $fullName, $phoneNumber, $email);
    if (!$stmt->execute()) {
        throw new Exception('Failed to insert user.');
    }
    $userId = $stmt->insert_id;
    $stmt->close();

    // Insert person title if needed
    if (strtolower($accountType) === 'company' && !empty($personTitle)) {
        $titleStmt = $conn->prepare("
            INSERT INTO person_titles (user_id, person_title)
            VALUES (?, ?)
        ");
        if (!$titleStmt) {
            throw new Exception('Failed to prepare person title insert statement.');
        }
        $titleStmt->bind_param("is", $userId, $personTitle);
        if (!$titleStmt->execute()) {
            throw new Exception('Failed to insert person title.');
        }
        $titleStmt->close();
    }

    // Commit transaction
    $conn->commit();

    http_response_code(201);
    echo json_encode(['status' => 'success', 'message' => 'User registered successfully']);
} catch (Exception $e) {
    // Roll back transaction on error
    if ($transactionStarted) {
        $conn->rollback();
    }
    error_log('Error in registration: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'An internal server error occurred.']);
} finally {
    $conn->close();
}
?>