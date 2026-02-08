<?php
/**
 * Authentication API Endpoint
 * RUMI by Manisha - E-commerce Platform
 * 
 * Endpoints:
 * POST /api/auth.php?action=register - Register new user
 * POST /api/auth.php?action=login    - Login user
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../models/UserModel.php';

$userModel = new UserModel();
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

try {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed. Use POST for authentication.']);
        exit();
    }

    $data = json_decode(file_get_contents('php://input'), true);

    switch ($action) {
        case 'register':
            handleRegister($userModel, $data);
            break;

        case 'login':
            handleLogin($userModel, $data);
            break;

        default:
            http_response_code(400);
            echo json_encode(['error' => 'Invalid action specified.']);
            break;
    }
} catch (Throwable $e) {
    error_log("AUTH API ERROR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
}

function handleRegister($userModel, $data)
{
    // Validate required fields
    if (empty($data['email']) || empty($data['password']) || empty($data['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Name, email, and password are required']);
        return;
    }

    // Check if user already exists
    if ($userModel->getByEmail($data['email'])) {
        http_response_code(409);
        echo json_encode(['error' => 'An account with this email already exists']);
        return;
    }

    // --- PERMANENT BACKUP LOGGING ---
    try {
        $logDir = __DIR__ . '/../logs';
        if (!is_dir($logDir)) {
            mkdir($logDir, 0777, true);
        }
        $logFile = $logDir . '/users_backup.log';
        $logEntry = "[" . date('Y-m-d H:i:s') . "] NEW REGISTRATION: " . json_encode($data) . PHP_EOL;
        file_put_contents($logFile, $logEntry, FILE_APPEND);
    } catch (Exception $e) {
        error_log("Failed to write to user backup log: " . $e->getMessage());
    }
    // --------------------------------

    // Prepare data for DB
    $userData = [
        'name' => trim($data['name']),
        'email' => trim($data['email']),
        'password' => $data['password'],
        'phone' => isset($data['phone']) ? trim($data['phone']) : null,
        'address' => isset($data['address']) ? trim($data['address']) : null,
        'city' => isset($data['city']) ? trim($data['city']) : null,
        'pincode' => isset($data['pincode']) ? trim($data['pincode']) : null,
        'role' => 'customer',
        'status' => 'active'
    ];

    $id = $userModel->register($userData);

    if ($id) {
        $user = $userModel->getById($id);
        unset($user['password']); // Safety first
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Account created successfully',
            'data' => $user
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create account']);
    }
}

function handleLogin($userModel, $data)
{
    if (empty($data['email']) || empty($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email/Phone and password are required']);
        return;
    }

    $user = $userModel->authenticate($data['email'], $data['password']);

    if ($user) {
        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'data' => $user
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
}
?>
