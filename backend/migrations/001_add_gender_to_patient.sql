ALTER TABLE `patient`
  ADD COLUMN `gender` ENUM('Male', 'Female', 'Other') DEFAULT NULL
  AFTER `dateOfBirth`;
