-- ArtMind — MySQL schema (raw DDL)
-- This mirrors prisma/schema.prisma. Prefer `prisma migrate` in real use;
-- this file is provided for DBAs who want the DDL directly.

CREATE DATABASE IF NOT EXISTS artmind
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE artmind;

CREATE TABLE users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  email           VARCHAR(191) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  name            VARCHAR(191) NOT NULL,
  avatar_url      VARCHAR(512),
  bio             TEXT,
  role            ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  refresh_token   TEXT,
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE artists (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(191) NOT NULL,
  slug         VARCHAR(191) NOT NULL UNIQUE,
  nationality  VARCHAR(100),
  born_year    INT,
  died_year    INT,
  bio          TEXT,
  portrait_url VARCHAR(512),
  created_at   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(191) NOT NULL UNIQUE,
  slug  VARCHAR(191) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE styles (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(191) NOT NULL UNIQUE,
  slug  VARCHAR(191) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE paintings (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL UNIQUE,
  description     TEXT NOT NULL,
  image_url       VARCHAR(512) NOT NULL,
  thumbnail_url   VARCHAR(512),
  medium          VARCHAR(100),
  surface         VARCHAR(100),
  dominant_colors JSON,
  width_cm        DOUBLE,
  height_cm       DOUBLE,
  year            INT,
  price           DECIMAL(12,2),
  view_count      INT NOT NULL DEFAULT 0,
  trending_score  DOUBLE NOT NULL DEFAULT 0,
  ai_summary      TEXT,
  featured        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  artist_id       INT NOT NULL,
  category_id     INT NOT NULL,
  style_id        INT,
  CONSTRAINT fk_paint_artist   FOREIGN KEY (artist_id)   REFERENCES artists(id),
  CONSTRAINT fk_paint_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_paint_style    FOREIGN KEY (style_id)    REFERENCES styles(id),
  INDEX idx_paint_category (category_id),
  INDEX idx_paint_style (style_id),
  INDEX idx_paint_artist (artist_id),
  INDEX idx_paint_trending (trending_score)
) ENGINE=InnoDB;

CREATE TABLE favorites (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  painting_id INT NOT NULL,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_fav (user_id, painting_id),
  CONSTRAINT fk_fav_user     FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_painting FOREIGN KEY (painting_id) REFERENCES paintings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE view_history (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  painting_id INT NOT NULL,
  viewed_at   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_vh_user (user_id, viewed_at),
  CONSTRAINT fk_vh_user     FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_vh_painting FOREIGN KEY (painting_id) REFERENCES paintings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE recommendations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  painting_id INT NOT NULL,
  score       DOUBLE NOT NULL,
  reason      VARCHAR(255),
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_rec (user_id, painting_id),
  CONSTRAINT fk_rec_user     FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_rec_painting FOREIGN KEY (painting_id) REFERENCES paintings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE collections (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  name        VARCHAR(191) NOT NULL,
  description TEXT,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_col_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE collection_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  collection_id INT NOT NULL,
  painting_id   INT NOT NULL,
  UNIQUE KEY uq_col_item (collection_id, painting_id),
  CONSTRAINT fk_ci_col      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  CONSTRAINT fk_ci_painting FOREIGN KEY (painting_id)   REFERENCES paintings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE chat_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  prompt      TEXT NOT NULL,
  response    TEXT NOT NULL,
  tokens_used INT,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE uploaded_images (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT,
  image_url         VARCHAR(512) NOT NULL,
  detected_style    VARCHAR(100),
  detected_category VARCHAR(100),
  dominant_colors   JSON,
  confidence        DOUBLE,
  created_at        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_ui_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE analytics (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  metric      VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id   INT,
  value       DOUBLE NOT NULL DEFAULT 1,
  metadata    JSON,
  recorded_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX idx_an_metric (metric, recorded_at)
) ENGINE=InnoDB;
