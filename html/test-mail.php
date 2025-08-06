<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$to = "gk788293@gmail.com"; // <-- REPLACE THIS
$subject = "PHP Mail Test from VulnOS Server";
$message = "If you received this email, the PHP mail() function is working correctly on your server.";
$headers = "From: test@vulnos.tech";

if (mail($to, $subject, $message, $headers)) {
    echo "<h1>Success!</h1><p>Test email sent successfully to $to. Please check your inbox (and spam folder).</p>";
} else {
    echo "<h1>Error!</h1><p>The PHP mail() function failed to send the email. This indicates a server configuration issue.</p>";
}
?>