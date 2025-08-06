<?php
// contact-handler.php

// --- START: Essential for Debugging ---
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');
// --- END: Essential for Debugging ---


// --- CONFIGURATION ---
$recipient_email = "contact@vulnos.tech"; // <-- IMPORTANT: REPLACE THIS with your receiving email
$email_subject = "New Contact Form Submission from VulnOS Website";
$from_address = "no-reply@vulnos.tech"; // This can be a no-reply address on your domain


// --- SCRIPT LOGIC ---

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);

    // --- Data Validation and Sanitization (Using modern filters) ---
    $name = isset($data['name']) ? trim(filter_var($data['name'], FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : '';
    $email = isset($data['email']) ? trim(filter_var($data['email'], FILTER_VALIDATE_EMAIL)) : '';
    $subject = isset($data['subject']) ? trim(filter_var($data['subject'], FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : '';
    $message = isset($data['message']) ? trim(filter_var($data['message'], FILTER_SANITIZE_FULL_SPECIAL_CHARS)) : '';

    if (empty($name) || !$email || empty($subject) || empty($message)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid input. Please fill out all fields correctly.']);
        exit;
    }

    // --- Email Composition ---
    $email_body = "You have received a new message from your website contact form.\n\n";
    $email_body .= "Name: $name\n";
    $email_body .= "Email: $email\n";
    $email_body .= "Subject: $subject\n\n";
    $email_body .= "Message:\n$message\n";
    $headers = "From: $from_address\r\n" . "Reply-To: $email\r\n" . "X-Mailer: PHP/" . phpversion();

    // --- Send the Email ---
    if (mail($recipient_email, $email_subject, $email_body, $headers)) {
        http_response_code(200);
        $ticketNumber = rand(10000, 99999);
        echo json_encode([
            'message' => 'Your message has been sent successfully!',
            'ticketNumber' => $ticketNumber
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Server configuration error: The mail() function failed. Please contact the site administrator.']);
    }

} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method Not Allowed']);
}
?>
