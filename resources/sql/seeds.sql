-- TODO: execute all SQL INSERT statements, in sequential order, from the top of this file
--       to populate the tables with sample data

-- this is an example of a multiple row INSERT statement
INSERT INTO classes (code, title, description, max_students)
VALUES
    ('CS 410', 'Databases', 'Foundations of database management systems...', 10),
    ('CS 408', 'Full Stack Web Development', 'Learn how to apply various technologies used for client-side and server-side web development...', 10),
    ('CS 402', 'Mobile Application Development', 'A project-intensive course on mobile development using either iOS or Android as a platform...', 10),
    ('COMM 101', 'Fundamentals of Oral Communication', 'A theoretical and contextual overview of the communication discipline...', 20),
    ('ENGL 101', 'Writing and Rhetoric I', 'Develops students'' knowledge of what writing is and how it functions in the world...', 30),
    ('ENGL 102', 'Writing and Rhetoric II', 'Develops students'' understanding of how rhetoric functions in academic and public environments...', 35),
    ('WRITE 212', 'Introduction to Technical Communication', 'Students design and create practical documents and presentations relevant to the workplace and courses in their majors...', 15),
    ('MATH 170', 'Calculus I', 'Informal limits and continuity. Derivatives and antiderivatives...', 4),
    ('MATH 175', 'Calculus II', 'A continuation of MATH 170. Techniques of integration and calculation of antiderivatives...', 10);


INSERT INTO students (first_name, last_name, birth_date)
VALUES
    ('Alice', 'Agnesi', '1991-01-01'),
    ('Bob', 'Babbage', '1992-02-02'),
    ('Carol', 'Carson', '1993-03-03'),
    ('Daniel', 'Dijkstra', '1994-04-04'),
    ('Emmett', 'Einstein', '1995-05-05'),
    ('Fiona', 'Faraday', '1996-06-06'),
    ('George', 'Galois', '1997-07-07'),
    ('Hannah', 'Hamilton', '1998-08-08'),
    ('Isaac', 'Ishizaka', '1999-09-09'),
    ('Jessica', 'Jackson', '2000-10-10');


INSERT INTO registered_students(class_id, student_id)
SELECT (SELECT id
        FROM classes
        WHERE code = 'ENGL 101'),
       (SELECT id
        FROM students
        WHERE first_name = 'George');

INSERT INTO registered_students(class_id, student_id)
SELECT (SELECT id
        FROM classes
        WHERE code = 'MATH 170'),
       id
FROM students
WHERE (first_name LIKE '%i%') AND (last_name LIKE '%i%');

INSERT INTO registered_students(class_id, student_id)
SELECT (SELECT id
        FROM classes
        WHERE code = 'CS 410'), id
FROM students
WHERE (first_name LIKE '%a%') AND (last_name LIKE '%i%');

INSERT INTO registered_students(class_id, student_id)
SELECT classes.id, students.id
FROM students
INNER JOIN classes ON (code = 'WRITE 212') AND (LOWER(first_name) LIKE '%r%');
