/**
 * ClickHouse Migration Script
 *
 * Applies all migration files from clickhouse/migrations directory to ClickHouse database.
 * Migrations are executed in alphabetical order based on filename.
 */
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createClient } from "@clickhouse/client";
import { ENV } from "../src/config/ENV";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Get all migration files from the migrations directory
 */
async function getMigrationFiles() {
    const migrationsDir = join(__dirname, "../clickhouse/migrations");
    try {
        const files = await readdir(migrationsDir);
        return files
            .filter((file) => file.endsWith(".sql"))
            .sort() // Sort alphabetically to ensure correct order
            .map((file) => join(migrationsDir, file));
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            console.log(
                "  ℹ Migrations directory not found, skipping ClickHouse migrations"
            );
            return [];
        }
        throw error;
    }
}
/**
 * Execute a single migration file
 */
async function executeMigration(client, filePath) {
    const sql = await readFile(filePath, "utf-8");
    const fileName = filePath.split(/[/\\]/).pop() ?? "unknown";
    console.log(`  → Applying migration: ${fileName}`);
    try {
        // ClickHouse doesn't support multi-statement queries by default
        // Split by semicolon and execute each statement separately
        // Remove comments and empty lines
        const statements = sql
            .split(";")
            .map((stmt) => {
                // Remove single-line comments
                return stmt
                    .split("\n")
                    .map((line) => {
                        const commentIndex = line.indexOf("--");
                        if (commentIndex >= 0) {
                            return line.substring(0, commentIndex);
                        }
                        return line;
                    })
                    .join("\n")
                    .trim();
            })
            .filter((stmt) => stmt.length > 0);
        for (const statement of statements) {
            if (statement.trim()) {
                await client.query({
                    query: statement,
                });
            }
        }
        console.log(`  ✓ Migration applied: ${fileName}`);
    } catch (error) {
        console.error(`  ✗ Failed to apply migration: ${fileName}`);
        throw error;
    }
}
/**
 * Escape database name for SQL queries
 */
function escapeDatabaseName(name) {
    // ClickHouse uses backticks for identifiers
    return `\`${name.replace(/`/g, "``")}\``;
}
/**
 * Ensure database exists, create if it doesn't
 */
async function ensureDatabase(client) {
    const dbName = escapeDatabaseName(ENV.CLICKHOUSE_DB);
    try {
        // Check if database exists by querying system.databases
        // Escape single quotes in database name for SQL
        const escapedDbName = ENV.CLICKHOUSE_DB.replace(/'/g, "''");
        const result = await client.query({
            query: `SELECT name FROM system.databases WHERE name = '${escapedDbName}'`,
            format: "JSONEachRow",
        });
        const databases = await result.json();
        if (databases.length > 0) {
            console.log(`  ✓ Database '${ENV.CLICKHOUSE_DB}' exists`);
        } else {
            console.log(`  → Creating database '${ENV.CLICKHOUSE_DB}'...`);
            await client.exec({
                query: `CREATE DATABASE IF NOT EXISTS ${dbName}`,
            });
            console.log(`  ✓ Database '${ENV.CLICKHOUSE_DB}' created`);
        }
    } catch (error) {
        // Fallback: try to create database directly (database might not exist)
        if (error instanceof Error) {
            console.log(
                `  → Attempting to create database '${ENV.CLICKHOUSE_DB}'...`
            );
            try {
                await client.exec({
                    query: `CREATE DATABASE IF NOT EXISTS ${dbName}`,
                });
                console.log(`  ✓ Database '${ENV.CLICKHOUSE_DB}' created`);
            } catch (createError) {
                // If it still fails, the error might be permission-related
                throw createError;
            }
        } else {
            throw error;
        }
    }
}
/**
 * Main migration function
 */
async function migrate() {
    console.log("Starting ClickHouse migrations...");
    // First, connect without specifying database to create it if needed
    const adminClient = createClient({
        url: `http://${ENV.CLICKHOUSE_HOST}:${ENV.CLICKHOUSE_PORT}`,
        username: ENV.CLICKHOUSE_USER,
        password: ENV.CLICKHOUSE_PASSWORD,
    });
    try {
        // Test connection
        await adminClient.ping();
        // Ensure database exists
        await ensureDatabase(adminClient);
        // Close admin client and create client with database
        await adminClient.close();
    } catch (error) {
        await adminClient.close();
        throw error;
    }
    // Create client with database specified
    const client = createClient({
        url: `http://${ENV.CLICKHOUSE_HOST}:${ENV.CLICKHOUSE_PORT}`,
        username: ENV.CLICKHOUSE_USER,
        password: ENV.CLICKHOUSE_PASSWORD,
        database: ENV.CLICKHOUSE_DB,
    });
    try {
        const migrationFiles = await getMigrationFiles();
        if (migrationFiles.length === 0) {
            console.log("  ℹ No migration files found");
            return;
        }
        console.log(`  Found ${migrationFiles.length} migration file(s)`);
        for (const filePath of migrationFiles) {
            await executeMigration(client, filePath);
        }
        console.log("✓ ClickHouse migrations completed successfully");
    } catch (error) {
        console.error("✗ ClickHouse migrations failed:");
        if (error instanceof Error) {
            console.error(`   ${error.message}`);
        } else {
            console.error(`   ${String(error)}`);
        }
        process.exit(1);
    } finally {
        await client.close();
    }
}
// Run migrations
migrate().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
//# sourceMappingURL=clickhouse-migrate.js.map
