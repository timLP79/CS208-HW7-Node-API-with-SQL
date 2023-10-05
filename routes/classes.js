let express = require('express');
let router = express.Router();
const db = require("./../db");


/**
 * http://localhost:8080/classes
 * GET /classes
 *
 * @return a list of classes (extracted from the classes table in the database) as JSON
 */
router.get("/classes", async function (req, res)
{
    try
    {
        const listOfClasses = await db.getAllClasses();
        console.log("listOfClasses:", listOfClasses);

        // this automatically converts the array of classes to JSON and returns it to the client
        res.send(listOfClasses);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(500).json({ "error": "Internal Server Error" });
    }
});


/**
 * GET /classes/{id}
 *
 * @return the class with id = {id} (extracted from the classes table in the database) as JSON
 *
 * @throws a 404 status code if the class with id = {id} does not exist
 */
router.get("/classes/:id", async function (req, res)
{
    try
    {
        const id = req.params.id;
        console.log("id = " + id);

        const classWithID = await db.getClassWithId(id);
        console.log("classWithID:", classWithID);

        if (classWithID == null)
        {
            console.log("No class with id " + id + " exists.");

            // return 404 status code (i.e., error that the class was not found)
            res.status(404).json({"error": "class with id " + id + " not found"});
            return;
        }

        // this automatically converts the class to JSON and returns it to the client
        res.send(classWithID);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(500).json({"error": "Internal Server Error"});
    }
});


/**
 * POST /classes
 * with the following form parameters:
 *      code
 *      title
 *      description
 *      maxStudents
 *
 * The parameters passed in the body of the POST request are used to create a new class.
 * The new class is inserted into the classes table in the database.
 *
 * @return the created class (which was inserted into the database), as JSON
 */
router.post("/classes", async function (req, res)
{
    try
    {
        const code = req.body.code;
        const title = req.body.title;
        const description = req.body.description;
        const maxStudents = req.body.maxStudents;

        console.log("code        = " + code);
        console.log("title       = " + title);
        console.log("description = " + description);
        console.log("maxStudents = " + maxStudents);

        if (code === undefined)
        {
            res.status(400).json({"error": "bad request: expected parameter 'code' is not defined"});
            return;
        }

        if (title === undefined)
        {
            res.status(400).json({"error": "bad request: expected parameter 'title' is not defined"});
            return;
        }

        if (description === undefined)
        {
            res.status(400).json({"error": "bad request: expected parameter 'description' is not defined"});
            return;
        }

        if (maxStudents === undefined)
        {
            res.status(400).json({"error": "bad request: expected parameter 'maxStudents' is not defined"});
            return;
        }

        // we can perform additional validation on the parameters, for example:
        if (code.length > 10)
        {
            console.log("Detected a code length greater than 10 characters. Throwing an error...");

            // return 422 status code
            res.status(422).json({"error": "class code should be less than 10 characters"});
            return;
        }

        let createdClass = {
            id: null, // will be initialized by the database, after we insert the record
            code: code,
            title: title,
            description: description,
            maxStudents: maxStudents
        };

        createdClass = await db.addNewClass(createdClass);

        // return 201 status code (i.e., created)
        res.status(201).json(createdClass);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(422).json({"error": "failed to add new class to the database"});
    }
});


/**
 * PUT /classes/{id}
 * with the following form parameters:
 *      code
 *      title
 *      description
 *      maxStudents
 *
 * The parameters passed in the body of the PUT request are used to
 * update the existing class with id = {id} in the classes table in the database.
 *
 * @return the updated class as JSON
 *
 * @throws a 404 status code if the class with id = {id} does not exist
 */
router.put("/classes/:id", async function (req, res){
    try
    {
        const id = req.params.id;
        const code = req.body.code;
        const title = req.body.title;
        const description = req.body.description;
        const maxStudents = req.body.maxStudents;

        console.log("id          = " + id);
        console.log("code        = " + code);
        console.log("title       = " + title);
        console.log("description = " + description);
        console.log("maxStudents = " + maxStudents);

        if (code === undefined)
        {
            res.status(400).json({"error": "bad request: expected parameter 'code' is not defined"});
            return;
        }

        if (title === undefined)
        {
            res.status(400).json({"error": "bad request: expected parameter 'title' is not defined"});
            return;
        }

        if (description === undefined)
        {
            res.status(400).json({"error": "bad request: expected parameter 'description' is not defined"});
            return;
        }

        if (maxStudents === undefined)
        {
            res.status(400).json({"error": "bad request: expected parameter 'maxStudents' is not defined"});
            return;
        }

        let classToUpdate = await db.getClassWithId(id);
        console.log({classToUpdate}); // this will pretty print the class object

        if (classToUpdate == null)
        {
            console.log("No class with id " + id + " exists.");

            // return 404 status code (i.e., error that the class was not found)
            res.status(404).json({"error": "failed to update the class with id = " + id + " in the database because it does not exist"});
            return;
        }

        // override the values of all the fields from classToUpdate with the values from the parameters
        classToUpdate.code = code;
        classToUpdate.title = title;
        classToUpdate.description = description;
        classToUpdate.maxStudents = maxStudents;

        await db.updateExistingClassInformation(classToUpdate);
        res.json(classToUpdate);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(422).json({"error": "failed to update the class with id = " + req.params.id + " in the database"});
    }
});


/**
 * PATCH /classes/{id}
 * with the following optional form parameters:
 *      code
 *      title
 *      description
 *      maxStudents
 *
 * The optional parameters passed in the body of the PATCH request are used to
 * update the existing class with id = {id} in the classes table in the database.
 *
 * @return the updated class as JSON
 *
 * @throws a 404 status code if the class with id = {id} does not exist
 */
router.patch("/classes/:id", async function (req, res){
    try
    {
        const id = req.params.id;
        const code = req.body.code || null;    // if the parameter is not specified, then assign null to code
        const title = req.body.title || null;
        const description = req.body.description || null;
        const maxStudents = req.body.maxStudents || null;

        console.log("id          = " + id);
        console.log("code        = " + code);
        console.log("title       = " + title);
        console.log("description = " + description);
        console.log("maxStudents = " + maxStudents);

        // there is no need to check if the parameters are defined, because they are optional
        // for a PATCH request


        let classToUpdate = await db.getClassWithId(id);
        console.log({classToUpdate});

        if (classToUpdate == null)
        {
            console.log("No class with id " + id + " exists.");

            // return 404 status code (i.e., error that the class was not found)
            res.status(404).json({"error": "failed to update the class with id = " + id + " in the database because it does not exist"});
            return;
        }

        // Override the values of all the fields from classToUpdate with the values from the parameters.
        // If a parameter is not specified in the request, then the corresponding field in classToUpdate
        // will not be updated and will still have the old value.
        if (code != null)
        {
            classToUpdate.code = code;
        }

        if (title != null)
        {
            classToUpdate.title = title;
        }

        if (description != null)
        {
            classToUpdate.description = description;
        }

        if (maxStudents != null)
        {
            classToUpdate.maxStudents = maxStudents;
        }

        await db.updateExistingClassInformation(classToUpdate);
        res.json(classToUpdate);
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(422).json({"error": "failed to update the class with id = " + req.params.id + " in the database"});
    }
});


/**
 * DELETE /classes/{id}
 *
 * Deletes the class with id = {id} from the classes table in the database.
 *
 * @throws a 404 status code if the class with id = {id} does not exist
 */
router.delete("/classes/:id", async function (req, res){
    try
    {
        const id = req.params.id;
        console.log("id = " + id);

        const classToDelete = await db.getClassWithId(id);
        console.log({classToDelete});

        if (classToDelete == null)
        {
            console.log("No class with id " + id + " exists.");

            // return 404 status code (i.e., error that the class was not found)
            res.status(404).json({"error": "failed to delete the class with id = " + id + " from the database because it does not exist"});
            return;
        }

        await db.deleteExistingClass(id);

        res.status(204).send(); //there is no return value
    }
    catch (err)
    {
        console.error("Error:", err.message);
        res.status(422).json({"error": "failed to delete the class with id = " + req.params.id + " from the database"});
    }
});


module.exports = router;
