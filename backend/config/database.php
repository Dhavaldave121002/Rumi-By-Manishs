<?php
/**
 * Database Connection Class
 * RUMI by Manisha - E-commerce Platform
 */

require_once __DIR__ . '/../config/config.php';

class Database
{
    private static $instance = null;
    private $connection;

    private function __construct()
    {
        $this->connect();
    }

    private function connect() 
    {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET,
                // Critical for stability:
                PDO::ATTR_PERSISTENT => true, 
                PDO::ATTR_TIMEOUT => 10, // Wait 10s before giving up
            ];

            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
            
            // Verify connection is actually alive
            $this->connection->query('SELECT 1');
            
        } catch (PDOException $e) {
            error_log("Database Initial Connection Error: " . $e->getMessage());
            $this->connection = null;
        }
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection()
    {
        // Active check: Try to ping the server
        try {
            if ($this->connection) {
                // Lightweight ping
                $this->connection->query('SELECT 1');
            } else {
                // Force reconnect logic
                throw new Exception("Connection is null");
            }
        } catch (Exception $e) {
            // Reconnect
            error_log("Database connection lost (" . $e->getMessage() . "). Attempting Reconnect...");
            $this->connect();
            
            if ($this->connection === null) {
                 // Return null or throw custom error for the API to catch
                 // We will throw specifically so the API layer knows its a 500
                 error_log("FATAL: Could not reconnect to database.");
                 throw new Exception("Database connection lost and could not be re-established.");
            }
        }

        return $this->connection;
    }

    // Prevent cloning
    private function __clone()
    {
    }

    // Prevent unserialization
    public function __wakeup()
    {
        throw new Exception("Cannot unserialize singleton");
    }
}

/**
 * Base Model Class
 */
class BaseModel
{
    protected $db;
    protected $table;

    public function __construct()
    {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Get all records with optional filters
     */
    public function getAll($filters = [], $limit = null, $offset = 0)
    {
        $sql = "SELECT * FROM {$this->table}";
        $params = [];

        if (!empty($filters)) {
            $conditions = [];
            foreach ($filters as $key => $value) {
                $conditions[] = "$key = :$key";
                $params[":$key"] = $value;
            }
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }

        $sql .= " ORDER BY id DESC";

        if ($limit) {
            $sql .= " LIMIT :limit OFFSET :offset";
        }

        $stmt = $this->db->prepare($sql);

        if ($limit) {
            $stmt->bindValue(':limit', (int) $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', (int) $offset, PDO::PARAM_INT);
        }

        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }

        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Get single record by ID
     */
    public function getById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Insert new record
     */
    public function create($data)
    {
        $fields = array_keys($data);
        $placeholders = array_map(function ($field) {
            return ":$field";
        }, $fields);

        $sql = "INSERT INTO {$this->table} (" . implode(", ", $fields) . ") 
                VALUES (" . implode(", ", $placeholders) . ")";

        $stmt = $this->db->prepare($sql);

        foreach ($data as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }

        $stmt->execute();
        return $this->db->lastInsertId();
    }

    /**
     * Update record
     */
    public function update($id, $data)
    {
        $fields = [];
        foreach (array_keys($data) as $field) {
            $fields[] = "$field = :$field";
        }

        $sql = "UPDATE {$this->table} SET " . implode(", ", $fields) . " WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $stmt->bindValue(':id', $id);

        foreach ($data as $key => $value) {
            $stmt->bindValue(":$key", $value);
        }

        return $stmt->execute();
    }

    /**
     * Delete record
     */
    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = :id");
        return $stmt->execute([':id' => $id]);
    }

    /**
     * Count records
     */
    public function count($filters = [])
    {
        $sql = "SELECT COUNT(*) as total FROM {$this->table}";
        $params = [];

        if (!empty($filters)) {
            $conditions = [];
            foreach ($filters as $key => $value) {
                $conditions[] = "$key = :$key";
                $params[":$key"] = $value;
            }
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch();
        return $result['total'];
    }

    /**
     * Execute custom query
     */
    public function query($sql, $params = [])
    {
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Begin transaction
     */
    public function beginTransaction()
    {
        return $this->db->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public function commit()
    {
        return $this->db->commit();
    }

    /**
     * Rollback transaction
     */
    public function rollback()
    {
        return $this->db->rollBack();
    }
}
