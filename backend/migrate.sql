USE eventsphere;

-- Add event_code if missing
SET @exists = (SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_schema = 'eventsphere' AND table_name = 'events' AND column_name = 'event_code');
SET @sql = IF(@exists = 0, 
    "ALTER TABLE events ADD COLUMN event_code VARCHAR(50) NOT NULL DEFAULT '' AFTER organizer_id",
    "SELECT 'event_code already exists'");
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Add unique index on event_code if missing
SET @idx = (SELECT COUNT(*) FROM information_schema.statistics 
            WHERE table_schema = 'eventsphere' AND table_name = 'events' AND index_name = 'idx_event_code');
SET @sql2 = IF(@idx = 0,
    "ALTER TABLE events ADD UNIQUE INDEX idx_event_code (event_code)",
    "SELECT 'idx_event_code already exists'");
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- Add registration_start if missing
SET @rs = (SELECT COUNT(*) FROM information_schema.columns 
           WHERE table_schema = 'eventsphere' AND table_name = 'events' AND column_name = 'registration_start');
SET @sql3 = IF(@rs = 0,
    "ALTER TABLE events ADD COLUMN registration_start DATETIME NOT NULL DEFAULT '2024-01-01 00:00:00' AFTER event_code",
    "SELECT 'registration_start already exists'");
PREPARE stmt3 FROM @sql3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

-- Add registration_end if missing
SET @re = (SELECT COUNT(*) FROM information_schema.columns 
           WHERE table_schema = 'eventsphere' AND table_name = 'events' AND column_name = 'registration_end');
SET @sql4 = IF(@re = 0,
    "ALTER TABLE events ADD COLUMN registration_end DATETIME NOT NULL DEFAULT '2099-12-31 23:59:59' AFTER registration_start",
    "SELECT 'registration_end already exists'");
PREPARE stmt4 FROM @sql4; EXECUTE stmt4; DEALLOCATE PREPARE stmt4;

-- Verify final schema
DESCRIBE events;
