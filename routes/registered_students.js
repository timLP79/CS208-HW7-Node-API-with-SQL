let express = require('express');
let router = express.Router();
const db = require("./../db");


/**
 * GET /registered_students
 *
 * @return a list of registered students (extracted from a join between
 * registered_students, students and classes tables in the database) as JSON
 */
router.get("/registered_students", async function (req, res)
{
    try
    {
        const listOfRegisteredStudentJoinResults = await db.getAllRegisteredStudents();
        console.log({listOfRegisteredStudentJoinResults});

        res.send(listOfRegisteredStudentJoinResults);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(500).json({"error": "Internal Server Error"});
    }
});


/**
 * POST /add_student_to_class
 * with the following form parameters:
 *      studentId
 *      classId
 *
 * The parameters passed in the body of the POST request will be inserted
 * into the registered_students table in the database.
 */
router.post("/add_student_to_class", async function (req, res)
{
    try
    {
        const studentId = req.body.studentId;
        const classId = req.body.classId;

        console.log("studentId = " + studentId);
        console.log("classId = " + classId);

        const student = await db.getStudentWithId(studentId);
        if (student == null)
        {
            console.log("No student with id " + studentId + " exists.");
            res.status(404).json({"error": "student with id " + studentId + " not found"});
            return;
        }

        const classObj = await db.getClassWithId(classId);
        if (classObj == null)
        {
            console.log("No class with id " + classId + " exists.");
            res.status(404).json({"error": "class with id " + classId + " not found"});
            return;
        }

        const result = await db.addStudentToClass(studentId, classId);
        console.log({result});

        res.send(result);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(500).json({"error": "Internal Server Error"});
    }
});


/**
 * DELETE /drop_student_from_class
 * with the following form parameters:
 *      studentId
 *      classId
 *
 * Deletes the student with id = {studentId} from the class with id = {classId}
 * from the registered_students in the database.
 *
 * @throws a 404 status code if the student with id = {studentId} does not exist
 * @throws a 404 status code if the class with id = {classId} does not exist
 */
router.delete("/drop_student_from_class", async function (req, res)
{
    try
    {
        const studentId = req.body.studentId;
        const classId = req.body.classId;

        console.log("studentId = " + studentId);
        console.log("classId = " + classId);

        const student = await db.getStudentWithId(studentId);
        if (student == null)
        {
            console.log("No student with id " + studentId + " exists.");
            res.status(404).json({"error": "student with id " + studentId + " not found"});
            return;
        }

        const classObj = await db.getClassWithId(classId);
        if (classObj == null)
        {
            console.log("No class with id " + classId + " exists.");
            res.status(404).json({"error": "class with id " + classId + " not found"});
            return;
        }

        const result = await db.dropAnExistingStudentFromAClass(studentId, classId);
        console.log({result});

        res.send(result);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(500).json({"error": "Internal Server Error"});
    }
});


/**
 * GET /students_taking_class/{classCode}
 *
 * @return a list of registered students (extracted from a join between
 * registered_students, students and classes tables in the database) as JSON
 * that are taking the class {classCode}
 */
// TODO: implement this route


/**
 * GET /classes_in_which_student_is_enrolled/{studentId}
 *
 * @return a list of all classes (extracted from a join between
 * registered_students, students and classes tables in the database) as JSON
 * in which the student with id = {studentId} is enrolled
 *
 * @throws a 404 status code if the student with id = {studentId} does not exist
 */
// TODO: implement this route


module.exports = router;
