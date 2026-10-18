-- Esquema do banco do Trilho (MySQL 8) — gerado das migrations do Entity Framework Core.
-- Banco: trilhodb | charset utf8mb4

CREATE DATABASE IF NOT EXISTS trilhodb CHARACTER SET utf8mb4;
USE trilhodb;

CREATE TABLE `Users` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `UserId` char(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `Name` varchar(200) NOT NULL,
  `Email` varchar(256) NOT NULL,
  `Password` varchar(100) NOT NULL,
  `Role` varchar(30) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL DEFAULT '0001-01-01 00:00:00.000000',
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `FailedLoginAttempts` int NOT NULL DEFAULT '0',
  `LockoutEnd` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Users_Email` (`Email`),
  UNIQUE KEY `IX_Users_UserId` (`UserId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Teams` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Description` varchar(500) NOT NULL,
  `LeaderId` bigint NOT NULL,
  `IsArchived` tinyint(1) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Teams_Name` (`Name`),
  KEY `IX_Teams_LeaderId` (`LeaderId`),
  CONSTRAINT `FK_Teams_Users_LeaderId` FOREIGN KEY (`LeaderId`) REFERENCES `Users` (`Id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `TeamMembers` (
  `TeamId` bigint NOT NULL,
  `UserId` bigint NOT NULL,
  `JoinedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`TeamId`,`UserId`),
  KEY `IX_TeamMembers_UserId` (`UserId`),
  CONSTRAINT `FK_TeamMembers_Teams_TeamId` FOREIGN KEY (`TeamId`) REFERENCES `Teams` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_TeamMembers_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Tasks` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `Title` varchar(200) NOT NULL,
  `Description` varchar(2000) NOT NULL,
  `Status` varchar(20) NOT NULL,
  `Priority` varchar(20) NOT NULL,
  `TeamId` bigint NOT NULL,
  `AssigneeId` bigint DEFAULT NULL,
  `CreatedById` bigint DEFAULT NULL,
  `DueDate` date DEFAULT NULL,
  `CompletedAt` datetime(6) DEFAULT NULL,
  `Position` int NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `UpdatedAt` datetime(6) NOT NULL,
  `GitBranch` varchar(250) DEFAULT NULL,
  `LastCommitAt` datetime(6) DEFAULT NULL,
  `PullRequestNumber` int DEFAULT NULL,
  `PullRequestState` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Tasks_AssigneeId` (`AssigneeId`),
  KEY `IX_Tasks_CreatedById` (`CreatedById`),
  KEY `IX_Tasks_TeamId_Status_Position` (`TeamId`,`Status`,`Position`),
  CONSTRAINT `FK_Tasks_Teams_TeamId` FOREIGN KEY (`TeamId`) REFERENCES `Teams` (`Id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_Tasks_Users_AssigneeId` FOREIGN KEY (`AssigneeId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `FK_Tasks_Users_CreatedById` FOREIGN KEY (`CreatedById`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Subtasks` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `TaskId` bigint NOT NULL,
  `Title` varchar(200) NOT NULL,
  `IsDone` tinyint(1) NOT NULL,
  `AssigneeId` bigint DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_Subtasks_AssigneeId` (`AssigneeId`),
  KEY `IX_Subtasks_TaskId` (`TaskId`),
  CONSTRAINT `FK_Subtasks_Tasks_TaskId` FOREIGN KEY (`TaskId`) REFERENCES `Tasks` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Subtasks_Users_AssigneeId` FOREIGN KEY (`AssigneeId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `TaskComments` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `TaskId` bigint NOT NULL,
  `AuthorId` bigint DEFAULT NULL,
  `Body` varchar(2000) NOT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_TaskComments_AuthorId` (`AuthorId`),
  KEY `IX_TaskComments_TaskId` (`TaskId`),
  CONSTRAINT `FK_TaskComments_Tasks_TaskId` FOREIGN KEY (`TaskId`) REFERENCES `Tasks` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_TaskComments_Users_AuthorId` FOREIGN KEY (`AuthorId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `TaskActivities` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `TaskId` bigint NOT NULL,
  `ActorId` bigint DEFAULT NULL,
  `Type` varchar(40) NOT NULL,
  `FromValue` varchar(100) DEFAULT NULL,
  `ToValue` varchar(100) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_TaskActivities_ActorId` (`ActorId`),
  KEY `IX_TaskActivities_TaskId_CreatedAt` (`TaskId`,`CreatedAt`),
  CONSTRAINT `FK_TaskActivities_Tasks_TaskId` FOREIGN KEY (`TaskId`) REFERENCES `Tasks` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_TaskActivities_Users_ActorId` FOREIGN KEY (`ActorId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Invites` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `Email` varchar(256) NOT NULL,
  `FullName` varchar(200) NOT NULL,
  `TeamId` bigint NOT NULL,
  `Role` varchar(30) NOT NULL,
  `TokenHash` varchar(64) NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `AcceptedAt` datetime(6) DEFAULT NULL,
  `CancelledAt` datetime(6) DEFAULT NULL,
  `InvitedById` bigint DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Invites_TokenHash` (`TokenHash`),
  KEY `IX_Invites_Email_TeamId` (`Email`,`TeamId`),
  KEY `IX_Invites_InvitedById` (`InvitedById`),
  KEY `IX_Invites_TeamId` (`TeamId`),
  CONSTRAINT `FK_Invites_Teams_TeamId` FOREIGN KEY (`TeamId`) REFERENCES `Teams` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Invites_Users_InvitedById` FOREIGN KEY (`InvitedById`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `PasswordResetRequests` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `UserId` bigint NOT NULL,
  `CodeHash` varchar(100) NOT NULL,
  `ExpiresAt` datetime(6) NOT NULL,
  `Attempts` int NOT NULL,
  `UsedAt` datetime(6) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_PasswordResetRequests_UserId_CreatedAt` (`UserId`,`CreatedAt`),
  CONSTRAINT `FK_PasswordResetRequests_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Notifications` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `UserId` bigint NOT NULL,
  `Type` varchar(40) NOT NULL,
  `Message` varchar(300) NOT NULL,
  `TaskId` bigint DEFAULT NULL,
  `DedupKey` varchar(100) DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  `ReadAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_Notifications_UserId_DedupKey` (`UserId`,`DedupKey`),
  KEY `IX_Notifications_TaskId` (`TaskId`),
  KEY `IX_Notifications_UserId_ReadAt_CreatedAt` (`UserId`,`ReadAt`,`CreatedAt`),
  CONSTRAINT `FK_Notifications_Tasks_TaskId` FOREIGN KEY (`TaskId`) REFERENCES `Tasks` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Notifications_Users_UserId` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `GitRepositories` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `Provider` varchar(20) NOT NULL,
  `FullName` varchar(200) NOT NULL,
  `TeamId` bigint NOT NULL,
  `Status` varchar(20) NOT NULL,
  `LastSyncAt` datetime(6) DEFAULT NULL,
  `Events` varchar(100) NOT NULL,
  `WebhookSecretProtected` varchar(1000) NOT NULL,
  `ConnectedById` bigint DEFAULT NULL,
  `CreatedAt` datetime(6) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `IX_GitRepositories_Provider_FullName` (`Provider`,`FullName`),
  KEY `IX_GitRepositories_ConnectedById` (`ConnectedById`),
  KEY `IX_GitRepositories_TeamId` (`TeamId`),
  CONSTRAINT `FK_GitRepositories_Teams_TeamId` FOREIGN KEY (`TeamId`) REFERENCES `Teams` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_GitRepositories_Users_ConnectedById` FOREIGN KEY (`ConnectedById`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `PendingGitEvents` (
  `Id` bigint NOT NULL AUTO_INCREMENT,
  `RepositoryId` bigint NOT NULL,
  `EventType` varchar(60) NOT NULL,
  `Payload` longtext NOT NULL,
  `ReceivedAt` datetime(6) NOT NULL,
  `ProcessedAt` datetime(6) DEFAULT NULL,
  `Attempts` int NOT NULL,
  `LastError` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `IX_PendingGitEvents_ProcessedAt_RepositoryId` (`ProcessedAt`,`RepositoryId`),
  KEY `IX_PendingGitEvents_RepositoryId` (`RepositoryId`),
  CONSTRAINT `FK_PendingGitEvents_GitRepositories_RepositoryId` FOREIGN KEY (`RepositoryId`) REFERENCES `GitRepositories` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

