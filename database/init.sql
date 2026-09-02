-- ==============================================================================
-- SkillSwap Database Initialization & Schema Definition
-- Engine: MySQL 8.0+ / MariaDB
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `SkillSwapDb` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `SkillSwapDb`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `Users` (
    `UserId` INT AUTO_INCREMENT PRIMARY KEY,
    `FullName` VARCHAR(100) NOT NULL,
    `EmailAddress` VARCHAR(255) NOT NULL UNIQUE,
    `PasswordHash` LONGTEXT NOT NULL,
    `BioDetails` VARCHAR(1000) NULL,
    `ProfilePicture` VARCHAR(500) NULL,
    `PortfolioLinks` VARCHAR(2000) NULL,
    `TrustRating` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    `IsAdmin` TINYINT(1) NOT NULL DEFAULT 0,
    `RefreshToken` VARCHAR(200) NULL,
    `RefreshTokenExpiryTime` DATETIME(6) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. UserSkills Table (Skills Offered & Wanted)
CREATE TABLE IF NOT EXISTS `UserSkills` (
    `UserSkillId` INT AUTO_INCREMENT PRIMARY KEY,
    `UserId` INT NOT NULL,
    `SkillName` VARCHAR(150) NOT NULL,
    `TypeTag` VARCHAR(10) NOT NULL, -- 'Offered' | 'Wanted'
    `ProficiencyLevel` VARCHAR(20) NOT NULL, -- 'Beginner' | 'Intermediate' | 'Expert'
    CONSTRAINT `FK_UserSkills_Users` FOREIGN KEY (`UserId`) REFERENCES `Users` (`UserId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `IX_UserSkills_UserId` ON `UserSkills` (`UserId`);

-- 3. ExchangeRequests Table
CREATE TABLE IF NOT EXISTS `ExchangeRequests` (
    `RequestId` INT AUTO_INCREMENT PRIMARY KEY,
    `SenderId` INT NOT NULL,
    `ReceiverId` INT NOT NULL,
    `LearningGoals` LONGTEXT NOT NULL,
    `EstimatedDuration` VARCHAR(100) NOT NULL,
    `Status` VARCHAR(20) NOT NULL DEFAULT 'Pending', -- 'Pending' | 'Accepted' | 'Rejected' | 'Completed' | 'Cancelled'
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT `FK_ExchangeRequests_Sender` FOREIGN KEY (`SenderId`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT,
    CONSTRAINT `FK_ExchangeRequests_Receiver` FOREIGN KEY (`ReceiverId`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `IX_ExchangeRequests_SenderId` ON `ExchangeRequests` (`SenderId`);
CREATE INDEX `IX_ExchangeRequests_ReceiverId` ON `ExchangeRequests` (`ReceiverId`);

-- 4. Sessions Table
CREATE TABLE IF NOT EXISTS `Sessions` (
    `SessionId` INT AUTO_INCREMENT PRIMARY KEY,
    `RequestId` INT NOT NULL,
    `ScheduledDateTime` DATETIME(6) NOT NULL,
    `MeetingLink` VARCHAR(500) NULL,
    `Status` VARCHAR(15) NOT NULL DEFAULT 'Scheduled', -- 'Scheduled' | 'Completed' | 'Cancelled'
    CONSTRAINT `FK_Sessions_ExchangeRequests` FOREIGN KEY (`RequestId`) REFERENCES `ExchangeRequests` (`RequestId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `IX_Sessions_RequestId` ON `Sessions` (`RequestId`);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS `Reviews` (
    `ReviewId` INT AUTO_INCREMENT PRIMARY KEY,
    `SessionId` INT NOT NULL,
    `ReviewerId` INT NOT NULL,
    `RevieweeId` INT NOT NULL,
    `RatingValue` INT NOT NULL,
    `WrittenFeedback` VARCHAR(2000) NULL,
    CONSTRAINT `FK_Reviews_Sessions` FOREIGN KEY (`SessionId`) REFERENCES `Sessions` (`SessionId`) ON DELETE CASCADE,
    CONSTRAINT `FK_Reviews_Reviewer` FOREIGN KEY (`ReviewerId`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Reviews_Reviewee` FOREIGN KEY (`RevieweeId`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `IX_Reviews_SessionId` ON `Reviews` (`SessionId`);
CREATE INDEX `IX_Reviews_ReviewerId` ON `Reviews` (`ReviewerId`);
CREATE INDEX `IX_Reviews_RevieweeId` ON `Reviews` (`RevieweeId`);

-- 6. Messages Table (Real-Time Chat & Persistence)
CREATE TABLE IF NOT EXISTS `Messages` (
    `MessageId` INT AUTO_INCREMENT PRIMARY KEY,
    `SenderId` INT NOT NULL,
    `ReceiverId` INT NOT NULL,
    `MessageBody` VARCHAR(4000) NOT NULL,
    `SentTimestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `IsRead` TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT `FK_Messages_Sender` FOREIGN KEY (`SenderId`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT,
    CONSTRAINT `FK_Messages_Receiver` FOREIGN KEY (`ReceiverId`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `IX_Messages_SenderId` ON `Messages` (`SenderId`);
CREATE INDEX `IX_Messages_ReceiverId` ON `Messages` (`ReceiverId`);

-- 7. Bootcamps Table (Group Sessions & LMS Masterclasses)
CREATE TABLE IF NOT EXISTS `Bootcamps` (
    `BootcampId` INT AUTO_INCREMENT PRIMARY KEY,
    `OrganizerId` INT NOT NULL,
    `TopicTitle` VARCHAR(200) NOT NULL,
    `Slug` VARCHAR(150) NULL UNIQUE,
    `Category` VARCHAR(100) NOT NULL DEFAULT 'General',
    `Difficulty` VARCHAR(30) NOT NULL DEFAULT 'Beginner',
    `Duration` VARCHAR(50) NOT NULL DEFAULT '4 weeks',
    `Instructor` VARCHAR(100) NOT NULL DEFAULT 'SkillSwap Faculty',
    `InstructorAvatar` VARCHAR(255) NULL,
    `Thumbnail` VARCHAR(100) NOT NULL DEFAULT '🚀',
    `Description` LONGTEXT NULL,
    `ContentPath` VARCHAR(255) NULL,
    `Rating` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    `EnrolledCount` INT NOT NULL DEFAULT 0,
    `CurriculumJson` LONGTEXT NULL,
    `ScheduledTime` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `MaxParticipantCap` INT NOT NULL DEFAULT 50,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `UpdatedAt` DATETIME(6) NULL ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT `FK_Bootcamps_Organizer` FOREIGN KEY (`OrganizerId`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `IX_Bootcamps_OrganizerId` ON `Bootcamps` (`OrganizerId`);
CREATE INDEX `IX_Bootcamps_Slug` ON `Bootcamps` (`Slug`);

-- 8. BootcampEnrollments Table
CREATE TABLE IF NOT EXISTS `BootcampEnrollments` (
    `EnrollmentId` INT AUTO_INCREMENT PRIMARY KEY,
    `BootcampId` INT NOT NULL,
    `ParticipantId` INT NOT NULL,
    `EnrolledAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT `FK_BootcampEnrollments_Bootcamp` FOREIGN KEY (`BootcampId`) REFERENCES `Bootcamps` (`BootcampId`) ON DELETE CASCADE,
    CONSTRAINT `FK_BootcampEnrollments_Participant` FOREIGN KEY (`ParticipantId`) REFERENCES `Users` (`UserId`) ON DELETE RESTRICT,
    CONSTRAINT `UQ_Bootcamp_Participant` UNIQUE (`BootcampId`, `ParticipantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Admins Table (Administrative Portal Accounts)
CREATE TABLE IF NOT EXISTS `Admins` (
    `AdminId` INT AUTO_INCREMENT PRIMARY KEY,
    `FullName` VARCHAR(100) NOT NULL,
    `EmailAddress` VARCHAR(255) NOT NULL UNIQUE,
    `PasswordHash` LONGTEXT NOT NULL,
    `Role` VARCHAR(50) NOT NULL DEFAULT 'Admin',
    `RefreshToken` VARCHAR(200) NULL,
    `RefreshTokenExpiryTime` DATETIME(6) NULL,
    `CreatedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX `IX_Admins_EmailAddress` ON `Admins` (`EmailAddress`);

-- ==============================================================================
-- Seed Initial Data (Admin & Demo Accounts)
-- Default Password for accounts: AdminSkillSwap2026! / UserSkillSwap2026!
-- BCrypt Hash format: $2a$11$...
-- ==============================================================================

-- Seed Admin into Admins table
INSERT IGNORE INTO `Admins` (`AdminId`, `FullName`, `EmailAddress`, `PasswordHash`, `Role`)
VALUES (
    1,
    'System Administrator',
    'admin@skillswap.app',
    '$2a$12$jQcfcjyF4En13gAKC3sYNewRVkKslQaScR6loEa7SEEIKPnZbeCm6', -- 'AdminSkillSwap2026!'
    'SuperAdmin'
);

-- Admin User: admin@skillswap.app
INSERT IGNORE INTO `Users` (`UserId`, `FullName`, `EmailAddress`, `PasswordHash`, `BioDetails`, `TrustRating`, `IsAdmin`)
VALUES (
    1,
    'System Admin',
    'admin@skillswap.app',
    '$2a$12$jQcfcjyF4En13gAKC3sYNewRVkKslQaScR6loEa7SEEIKPnZbeCm6', -- 'AdminSkillSwap2026!'
    'Platform Administrator and Community Manager',
    5.00,
    1
);

-- Demo User 1: Sarah Jenkins (React & UI/UX Expert)
INSERT IGNORE INTO `Users` (`UserId`, `FullName`, `EmailAddress`, `PasswordHash`, `BioDetails`, `TrustRating`, `IsAdmin`)
VALUES (
    2,
    'Sarah Jenkins',
    'sarah.jenkins@example.com',
    '$2a$11$q9FmH1a6RkgDvhXj1U37..3uW8pB9JqZom02J0.t23aTjG0tNnJae',
    'Senior Frontend Architect with 7+ years of experience in React, TypeScript, and Design Systems. Passionate about learning Machine Learning.',
    4.95,
    0
);

-- Demo User 2: Alex Rivera (Python & AI/ML Specialist)
INSERT IGNORE INTO `Users` (`UserId`, `FullName`, `EmailAddress`, `PasswordHash`, `BioDetails`, `TrustRating`, `IsAdmin`)
VALUES (
    3,
    'Alex Rivera',
    'alex.rivera@example.com',
    '$2a$11$q9FmH1a6RkgDvhXj1U37..3uW8pB9JqZom02J0.t23aTjG0tNnJae',
    'Data Scientist & ML Engineer. Looking to master frontend design and Tailwind CSS in exchange for Python and Deep Learning tutoring.',
    4.88,
    0
);

-- Demo Skills for Sarah
INSERT IGNORE INTO `UserSkills` (`UserSkillId`, `UserId`, `SkillName`, `TypeTag`, `ProficiencyLevel`)
VALUES
    (1, 2, 'React.js', 'Offered', 'Expert'),
    (2, 2, 'TypeScript', 'Offered', 'Expert'),
    (3, 2, 'UI/UX Design', 'Offered', 'Intermediate'),
    (4, 2, 'Python', 'Wanted', 'Beginner'),
    (5, 2, 'Machine Learning', 'Wanted', 'Beginner');

-- Demo Skills for Alex
INSERT IGNORE INTO `UserSkills` (`UserSkillId`, `UserId`, `SkillName`, `TypeTag`, `ProficiencyLevel`)
VALUES
    (6, 3, 'Python', 'Offered', 'Expert'),
    (7, 3, 'Machine Learning', 'Offered', 'Expert'),
    (8, 3, 'PyTorch', 'Offered', 'Intermediate'),
    (9, 3, 'React.js', 'Wanted', 'Beginner'),
    (10, 3, 'CSS & Tailwind', 'Wanted', 'Beginner');
