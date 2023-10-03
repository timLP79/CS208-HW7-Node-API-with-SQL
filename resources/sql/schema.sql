-- TODO: enable the enforcement of FOREIGN KEY constraints by
--       following the instructions from section 9 in the HW2 description:
--       https://docs.google.com/document/d/1XvnFOI6ssJp8IqlnhYlgu6cy_30OphGaCadxktZrbM8/edit#heading=h.xergorgytnks

-- TODO: execute all SQL statements, in sequential order, from the top of this file
--       to create the tables or to "reset" the database to the expected structure

DROP TABLE IF EXISTS registered_students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS students;

CREATE TABLE classes
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    code         VARCHAR(10) UNIQUE,
    title        VARCHAR(50) NOT NULL,
    description  VARCHAR(200),
    max_students INTEGER DEFAULT 10
);

CREATE TABLE students
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name  VARCHAR(50) NOT NULL,
    birth_date DATE
);

CREATE TABLE registered_students
(
    class_id   INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    signup_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (class_id) REFERENCES classes (id),
    FOREIGN KEY (student_id) REFERENCES students (id),
    UNIQUE (class_id, student_id)
);
