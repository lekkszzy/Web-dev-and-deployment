-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mydb` DEFAULT CHARACTER SET utf8 ;
USE `mydb` ;

-- -----------------------------------------------------
-- Table `mydb`.`authors`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`authors` ;

CREATE TABLE IF NOT EXISTS `mydb`.`authors` (
  `idAuthor` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NULL,
  `dob` DATETIME NULL,
  PRIMARY KEY (`idAuthor`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`books`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`books` ;

CREATE TABLE IF NOT EXISTS `mydb`.`books` (
  `idBook` INT NOT NULL,
  `ISBN` VARCHAR(45) NULL,
  `title` VARCHAR(45) NULL,
  PRIMARY KEY (`idBook`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `mydb`.`book_author`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `mydb`.`book_author` ;

CREATE TABLE IF NOT EXISTS `mydb`.`book_author` (
  `idBook` INT NOT NULL,
  `idAuthor` INT NOT NULL,
  `advance` INT NULL,
  PRIMARY KEY (`idBook`, `idAuthor`),
  INDEX `fk_book_author_authors_idx` (`idAuthor` ASC) VISIBLE,
  CONSTRAINT `fk_book_author_authors`
    FOREIGN KEY (`idAuthor`)
    REFERENCES `mydb`.`authors` (`idAuthor`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_book_author_books`
    FOREIGN KEY (`idBook`)
    REFERENCES `mydb`.`books` (`idBook`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
