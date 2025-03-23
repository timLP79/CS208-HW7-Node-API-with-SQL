let express = require('express');
let router = express.Router();
const db = require("./../db");


/**
 * GET /students
 *
 * @return a list of students (extracted from the students table in the database) as JSON
 */
router.get("/students", async function (req, res)
{
    try
    {
        const listOfStudents = await db.getAllStudents();
        console.log("listOfStudents:", listOfStudents);

        // this automatically converts the array of classes to JSON and returns it to the client
        res.send(listOfStudents);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});


/**
 * GET /students/{id}
 *
 * @return the student with id = {id} (extracted from the students table in the database) as JSON
 *
 * @throws a 404 status code if the student with id = {id} does not exist
 */
router.get("/students/:id", async function (req, res)
{
    try
    {
        const id = req.params.id;
        console.log("id = " + id);

        const studentWithID = await db.getStudentWithId(id);
        console.log("studentWithID:", studentWithID);

        if (studentWithID == null)
        {
            console.log("No class with id " + id + " exists.");

            // return 404 status code (i.e., error that the class was not found)
            res.status(404).json({"error": "student with id " + id + " not found"});
            return;
        }

        // this automatically converts the class to JSON and returns it to the client
        res.send(studentWithID);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(500).json({"error": "Internal Server Error"});
    }
});


/**
 * POST /students
 * with the following form parameters:
 *      firstName
 *      lastName
 *      birthDate (in ISO format: yyyy-mm-dd)
 *
 * The parameters passed in the body of the POST request are used to create a new student.
 * The new student is inserted into the students table in the database.
 *
 * @return the created student (which was inserted into the database), as JSON
 */
router.post("/students", async function (req, res)
{
    try
    {
        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const birthDate = req.body.birthDate;

        console.log("firstName = " + firstName);
        console.log("lastName  = " + lastName);
        console.log("birthDate = " + birthDate);

        if (firstName === undefined)
        {
            res.status(400).json({"error": "bad request: expected parameter 'code' is not defined"});
            return;
        }

        if (lastName === undefined)
        {
            res.status(400).json({"error": "bad request: expected parameter 'title' is not defined"});
            return;
        }

        if (birthDate === undefined)
        {
            res.status(400).json({"error": "bad request: expected parameter 'description' is not defined"});
            return;
        }

        // we can perform additional validation on the parameters, for example:
        if (birthDate.length > 10)
        {
            console.log("Detected a birth date length greater than 10 characters. Throwing an error...");

            // return 422 status code
            res.status(422).json({"error": "birth date should be less than 10 characters"});
            return;
        }

        let createdStudent = {
            id: null, // will be initialized by the database, after we insert the record
            firstName: firstName,
            lastName: lastName,
            birthDate: birthDate
        };

        createdStudent = await db.addNewStudent(createdStudent);

        // return 201 status code (i.e., created)
        res.status(201).json(createdStudent);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(422).json({"error": "failed to add new student to the database"});
    }
});


/**
 * PUT /students/{id}
 * with the following form parameters:
 *      firstName
 *      lastName
 *      birthDate
 *
 * The parameters passed in the body of the PUT request are used to
 * update the existing student with id = {id} in the students table in the database.
 *
 * @return the updated student as JSON
 *
 * @throws a 404 status code if the student with id = {id} does not exist
 */
router.put("/students/:id", async function (req, res)
{
    // TODO: implement this route or the PATCH route below
});


/**
 * PATCH /students/{id}
 * with the following optional form parameters:
 *      firstName
 *      lastName
 *      birthDate
 *
 * The optional parameters passed in the body of the PATCH request are used to
 * update the existing student with id = {id} in the students table in the database.
 *
 * @return the updated student as JSON
 *
 * @throws a 404 status code if the student with id = {id} does not exist
 */
router.patch("/students/:id", async function (req, res)
{
    // TODO: implement this route or the PUT route above
});


/**
 * DELETE /students/{id}
 *
 * Deletes the student with id = {id} from the students table in the database.
 *
 * @throws a 404 status code if the student with id = {id} does not exist
 */
router.delete("/students/:id", async function (req, res)
{
    // TODO: implement this route
});


module.exports = router;
