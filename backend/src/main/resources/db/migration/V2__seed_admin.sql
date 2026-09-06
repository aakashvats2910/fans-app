-- Seed a default admin account for the demo. Password is "Admin@123" (BCrypt hash below).
INSERT INTO users (username, email, password_hash, display_name, role, bio)
VALUES ('admin', 'admin@velvra.dev', '$2b$10$UsVHC/TucT8KQOP8HRXjB./d/Mm3VgP2uMD6NGSlt.ho017ht6ae6', 'Velvra Admin', 'ADMIN', 'Platform administrator');
