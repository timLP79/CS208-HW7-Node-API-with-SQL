const util = require("util");
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();

// TODO: create a SQLite data source in IntelliJ with this file name
const SQLITE_FILE_NAME = "cs208_hw7.sqlite";


let db;

// If the run environment is 'test', we create an ephemeral (in memory) SQLite database that will
//   - create tables using the structure defined in the schema file: './resources/sql/schema.sql'
//   - populate the tables with data from the seeds file: './resources/sql/seeds.sql'
// Once the tests complete (i.e., finish running), this in memory SQLite database will be deleted automatically
//
// However, if the environment is not 'test' (e.g., the environment is 'development') then the application will use
// the SQLite database specified in the SQLITE_FILE_NAME
if (process.env.NODE_ENV === "test")
{
    console.log("Creating an in memory SQLite database for running the test suite...");

    const contentOfSchemaSQLFile = fs.readFileSync("./resources/sql/schema.sql", "utf8");
    const contentOfSeedsSQLFile = fs.readFileSync("./resources/sql/seeds.sql", "utf8");

    // Creates a connection to an in-memory SQLite database
    db = new sqlite3.Database(":memory:", function(err)
    {
        if (err)
        {
            return console.error(err.message);
        }

        // Enable enforcement of foreign keys constraints in the SQLite database every time we run the tests
        db.get("PRAGMA foreign_keys = ON;");

        console.log(`Connected to the ':memory:' SQLite database.`);
        console.log("Creating the tables from the 'schema.sql' file...");
        console.log("Populating them with data from the 'seeds.sql' file...");
        db.serialize(function()
        {
            // the serialize method ensures that the SQL queries from the exec calls are executed sequentially
            // (i.e., one after the other instead of being executed in parallel)
            db.exec(contentOfSchemaSQLFile);
            db.exec(contentOfSeedsSQLFile);
        });
    });
}
else
{
    // This is the default environment (e.g., 'development')

    // Create a connection to the SQLite database file specified in SQLITE_FILE_NAME
    db = new sqlite3.Database("./" + SQLITE_FILE_NAME, function(err)
    {
        if (err)
        {
            return console.error(err.message);
        }

        // Enable enforcement of foreign keys constraints in the SQLite database every time we start the application
        db.get("PRAGMA foreign_keys = ON;");

        console.log(`Connected to the '${SQLITE_FILE_NAME}' SQLite database for development.`);
    });
}


function getAllClasses()
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            // note the backticks ` which allow us to write a multiline string
            const sql =
                `SELECT id, code, title, description, max_students 
                 FROM classes;`;

            let listOfClasses = []; // initialize an empty array

            // print table header
            printTableHeader(["id", "code", "title", "description", "max_students"]);

            const callbackEachRowProcessing = function(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                // extract the values from the current row
                const id = row.id;
                const code = row.code;
                const title = row.title;
                const description = row.description;
                const maxStudents = row.max_students;

                // print the results of the current row
                console.log(util.format("| %d | %s | %s | %s | %d |", id, code, title, description, maxStudents));

                const classForCurrentRow = {
                    id: id,
                    code: code,
                    title: title,
                    description: description,
                    maxStudents: maxStudents
                };

                // add a new element classForCurrentRow to the array
                listOfClasses.push(classForCurrentRow);
            };

            const callbackAfterAllRowsProcessed = function()
            {
                resolve(listOfClasses);
            };

            db.each(sql, callbackEachRowProcessing, callbackAfterAllRowsProcessed);
        });
    });
}


function getClassWithId(id)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `SELECT id, code, title, description, max_students 
                 FROM classes 
                 WHERE id = ?;`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                if (row === undefined)
                {
                    resolve(null);
                    return;
                }

                // extract the values from the current row
                const id = row.id;
                const code = row.code;
                const title = row.title;
                const description = row.description;
                const maxStudents = row.max_students;

                // print the results of the current row
                console.log(util.format("| %d | %s | %s | %s | %d |", id, code, title, description, maxStudents));

                const classForCurrentRow = {
                    id: id,
                    code: code,
                    title: title,
                    description: description,
                    maxStudents: maxStudents
                };

                resolve(classForCurrentRow);
            }

            // execute the sql prepared statement (the '?' is replaced with id)
            // and return the class with the given id
            db.get(sql, [id], callbackAfterReturnedRowIsProcessed);
        });
    });
}


function addNewClass(newClass)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `INSERT INTO classes (code, title, description, max_students) 
                 VALUES (?, ?, ?, ?);`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                const numberOfRowsAffected = this.changes;
                if (numberOfRowsAffected > 0)
                {
                    const generatedIdForTheNewlyInsertedClass = this.lastID;

                    console.log("SUCCESSFULLY inserted a new class with id = " + generatedIdForTheNewlyInsertedClass);

                    newClass.id = generatedIdForTheNewlyInsertedClass;

                    resolve(newClass);
                }
            }

            // execute the sql prepared statement
            // and return the id of the newly created class
            db.run(sql, [newClass.code, newClass.title, newClass.description, newClass.maxStudents], callbackAfterReturnedRowIsProcessed);
        });
    });
}


function updateExistingClassInformation(classToUpdate)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `UPDATE classes 
                 SET code = ?, title = ?, description = ?, max_students = ? 
                 WHERE id = ?;`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                const numberOfRowsAffected = this.changes;
                if (numberOfRowsAffected > 0)
                {
                    console.log("SUCCESSFULLY updated the class with id = " + classToUpdate.id);

                    resolve(classToUpdate);
                }
                else
                {
                    reject("ERROR: could not update the class with id = " + classToUpdate.id);
                }
            }

            // execute the sql prepared statement
            // and return the number of rows affected
            db.run(sql, [classToUpdate.code, classToUpdate.title, classToUpdate.description, classToUpdate.maxStudents, classToUpdate.id], callbackAfterReturnedRowIsProcessed);
        });
    });
}


function deleteExistingClass(id)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `DELETE FROM classes 
                 WHERE id = ?;`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                const numberOfRowsAffected = this.changes;
                if (numberOfRowsAffected > 0)
                {
                    console.log("SUCCESSFULLY deleted the class with id = " + id);

                    resolve(id);
                }
                else
                {
                    reject("ERROR: could not delete the class with id = " + id);
                }
            }

            // execute the sql prepared statement
            // and return the number of rows affected
            db.run(sql, [id], callbackAfterReturnedRowIsProcessed);
        });
    });
}


function getAllStudents()
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `SELECT id, first_name, last_name, birth_date 
                 FROM students;`;

            let listOfStudents = []; // initialize an empty array

            printTableHeader(["id", "first_name", "last_name", "birth_date"]);

            const callbackEachRowProcessing = function(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                // extract the values from the current row
                const id = row.id;
                const firstName = row.first_name;
                const lastName = row.last_name;
                const birthDate = row.birth_date;

                // print the results of the current row
                console.log(util.format("| %d | %s | %s | %s |", id, firstName, lastName, birthDate));

                const studentForCurrentRow = {
                    id: id,
                    firstName: firstName,
                    lastName: lastName,
                    birthDate: birthDate
                };

                // add a new element studentForCurrentRow to the array
                listOfStudents.push(studentForCurrentRow);

            };

            const callbackAfterAllRowsProcessed = function()
            {
                resolve(listOfStudents);
            };

            db.each(sql, callbackEachRowProcessing, callbackAfterAllRowsProcessed);
        });
    });
}


function getStudentWithId(id)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `TODO: replace me with actual query`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                if (row === undefined)
                {
                    resolve(null);
                    return;
                }

                // extract the values from the current row
                const id = row.id;
                const firstName = row.first_name;
                const lastName = row.last_name;
                const birthDate = row.birth_date;

                // print the results of the current row
                console.log(util.format("| %d | %s | %s | %s |", id, firstName, lastName, birthDate));

                const studentForCurrentRow = {
                    id: id,
                    firstName: firstName,
                    lastName: lastName,
                    birthDate: birthDate
                };

                resolve(studentForCurrentRow);
            }

            // execute the sql prepared statement (the '?' is replaced with id)
            // and return the student with the given id
            db.get(sql, [id], callbackAfterReturnedRowIsProcessed);

        });
    });
}


function addNewStudent(createdStudent)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `TODO: replace me with actual query`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                const numberOfRowsAffected = this.changes;
                if (numberOfRowsAffected > 0)
                {
                    const generatedIdForTheNewlyInsertedStudent = this.lastID;

                    console.log("SUCCESSFULLY inserted a new student with id = " + generatedIdForTheNewlyInsertedStudent);

                    createdStudent.id = generatedIdForTheNewlyInsertedStudent;

                    resolve(createdStudent);
                }
            }

            // execute the sql prepared statement
            // and return the id of the newly created student
            db.run(sql, [createdStudent.firstName, createdStudent.lastName, createdStudent.birthDate], callbackAfterReturnedRowIsProcessed);
        });
    });
}


function updateExistingStudentInformation(studentToUpdate)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `TODO: replace me with actual query`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                const numberOfRowsAffected = this.changes;
                if (numberOfRowsAffected > 0)
                {
                    console.log("SUCCESSFULLY updated the student with id = " + studentToUpdate.id);

                    resolve(studentToUpdate);
                }
                else
                {
                    reject("ERROR: could not update the student with id = " + studentToUpdate.id);
                }
            }

            // execute the sql prepared statement
            // and return the number of rows affected
            db.run(sql, [studentToUpdate.firstName, studentToUpdate.lastName, studentToUpdate.birthDate, studentToUpdate.id], callbackAfterReturnedRowIsProcessed);
        });
    });
}


function deleteExistingStudent(id)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `TODO: replace me with actual query`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                const numberOfRowsAffected = this.changes;
                if (numberOfRowsAffected > 0)
                {
                    console.log("SUCCESSFULLY deleted the student with id = " + id);

                    resolve(id);
                }
                else
                {
                    reject("ERROR: could not delete the student with id = " + id);
                }
            }

            // execute the sql prepared statement
            // and return the number of rows affected
            db.run(sql, [id], callbackAfterReturnedRowIsProcessed);
        });
    });
}


function getAllRegisteredStudents()
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `TODO: replace me with actual query`;

            let listOfRegisteredStudentJoinResults = [];

            printTableHeader(["students.id", "student_full_name", "classes.code", "classes.title"]);

            const callbackEachRowProcessing = function(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                // extract the values from the current row
                const studentId = row.id;
                const studentFullName = row.student_full_name;
                const code = row.code;
                const title = row.title;

                // print the results of the current row
                console.log(util.format("| %d | %s | %s | %s |", studentId, studentFullName, code, title));

                const studentForCurrentRow = {
                    studentId: studentId,
                    studentFullName: studentFullName,
                    code: code,
                    title: title
                };

                listOfRegisteredStudentJoinResults.push(studentForCurrentRow);
            };

            const callbackAfterAllRowsProcessed = function()
            {
                resolve(listOfRegisteredStudentJoinResults);
            };

            db.each(sql, callbackEachRowProcessing, callbackAfterAllRowsProcessed);
        });
    });
}


function addStudentToClass(studentId, classId)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `TODO: replace me with actual query`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                const numberOfRowsAffected = this.changes;
                if (numberOfRowsAffected > 0)
                {
                    console.log("SUCCESSFULLY added the student with id = " + studentId + " to the class with id = " + classId);

                    resolve(studentId);
                }
                else
                {
                    reject("ERROR: could not add the student with id = " + studentId + " to the class with id = " + classId);
                }
            }

            // execute the sql prepared statement
            // and return the number of rows affected
            db.run(sql, [studentId, classId], callbackAfterReturnedRowIsProcessed);
        });
    });
}


function dropAnExistingStudentFromAClass(studentId, classId)
{
    return new Promise(function(resolve, reject)
    {
        db.serialize(function()
        {
            const sql =
                `TODO: replace me with actual query`;

            function callbackAfterReturnedRowIsProcessed(err, row)
            {
                if (err)
                {
                    reject(err);
                }

                const numberOfRowsAffected = this.changes;
                if (numberOfRowsAffected > 0)
                {
                    console.log("SUCCESSFULLY dropped the student with id = " + studentId + " from the class with id = " + classId);

                    resolve(studentId);
                }
                else
                {
                    reject("ERROR: could not drop the student with id = " + studentId + " from the class with id = " + classId);
                }
            }

            // execute the sql prepared statement
            // and return the number of rows affected
            db.run(sql, [studentId, classId], callbackAfterReturnedRowIsProcessed);
        });
    });
}


function getAllStudentsThatAreTakingAClass(classCode)
{
    // TODO: implement this function
}


function showAllClassesInWhichAStudentIsEnrolled(studentId)
{
    // TODO: implement this function
}

function printTableHeader(listOfColumnNames)
{
    let buffer = "| ";
    for (const columnName of listOfColumnNames)
    {
        buffer += columnName + " | ";
    }
    console.log(buffer);
    console.log("-".repeat(80));
}


// these functions will be available from other files that import this module
module.exports = {
    getAllClasses,
    getClassWithId,
    addNewClass,
    updateExistingClassInformation,
    deleteExistingClass,

    getAllStudents,
    getStudentWithId,
    addNewStudent,
    updateExistingStudentInformation,
    deleteExistingStudent,

    getAllRegisteredStudents,
    addStudentToClass,
    dropAnExistingStudentFromAClass,
    getAllStudentsThatAreTakingAClass,
    showAllClassesInWhichAStudentIsEnrolled,
};
