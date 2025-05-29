<?php

function validateInput(array $data): array
{
    $errors = [];

    $accountType = isset($data['accountType']) ? trim($data['accountType']) : null;
    $username = isset($data['username']) ? trim($data['username']) : null;
    $password = $data['password'] ?? null;
    $fullName = isset($data['fullName']) ? trim($data['fullName']) : null;
    $phoneNumber = isset($data['phoneNumber']) ? trim($data['phoneNumber']) : null;
    $email = isset($data['email']) ? trim($data['email']) : null;
    $personTitle = isset($data['personTitle']) ? trim($data['personTitle']) : null;

    $requiredFields = ['accountType', 'username', 'password', 'fullName', 'phoneNumber', 'email'];
    foreach ($requiredFields as $field) {
        if (empty($$field)) {
            $errors[$field] = ucfirst($field) . ' is required.';
        }
    }

    if (!empty($errors)) {
        return $errors;
    }

    if (!in_array($accountType, ['individual', 'company'])) {
        $errors['accountType'] = 'Invalid account type.';
    }

    if ($accountType === 'company') {
        if (empty($personTitle)) {
            $errors['personTitle'] = 'Person title is required for company accounts.';
        } elseif (!preg_match("/^[A-Za-z\s'-]+$/", $personTitle)) {
            $errors['personTitle'] = 'Person title must contain only letters, spaces, apostrophes, or hyphens.';
        }
    }

    if (!preg_match('/^[a-zA-Z0-9_]{3,50}$/', $username)) {
        $errors['username'] = 'Username must be 3–50 characters long and contain only letters, numbers, or underscores.';
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Invalid email format.';
    }

    if (preg_match('/\D/', $phoneNumber) || strlen($phoneNumber) < 7 || strlen($phoneNumber) > 20) {
        $errors['phoneNumber'] = 'Invalid phone number format.';
    }

    if (strlen($fullName) < 2 || !preg_match("/^[A-Za-z\s'-]+$/", $fullName)) {
        $errors['fullName'] = 'Full name must be at least 2 characters and contain only letters, spaces, apostrophes, or hyphens.';
    }

    if (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/', $password)) {
        $errors['password'] = 'Password must be at least 8 characters and include uppercase, lowercase, number, and symbol.';
    }

    return $errors;
}
