<?php
$host = 'localhost';
$user = 'root'; // default user for localhost
$pass = '';     // default password is empty
$db   = 'registration_db';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}