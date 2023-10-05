const {describe, expect, test} = require("@jest/globals");

// supertest is a framework that allows to easily test web APIs
const supertest = require('supertest');
const app = require('./../app');
const request = supertest(app);

describe('REST APIs for classes', () =>
{
    describe('GET /classes', () =>
    {
        test('should return a 200 (ok) status code', async() =>
        {
            // version 1
            const response = await request.get('/classes');
            expect(response.status).toBe(200);

            // or

            // version 2
            await request.get('/classes').expect(200);
        });

        test('should have Content-Type "application/json"', async() =>
        {
            const response = await request.get('/classes');
            expect(response.header['content-type']).toMatch(/application\/json/);

            // or

            await request.get('/classes').expect('Content-Type', /application\/json/);
        });

        test('should contain the key "code" in the first class returned as a JSON response', async() =>
        {
            const response = await request.get('/classes');
            const response_content_as_json = response.body;

            expect(response_content_as_json[0]).toHaveProperty('code');
        });

        test('should contain "CS 410" in the first class code returned as a JSON response', async() =>
        {
            const response = await request.get('/classes');
            const response_content_as_json = response.body;

            expect(response_content_as_json[0].code).toBe('CS 410');
        });
    });

    describe('GET /classes/:id', () =>
    {
        test('should return a 200 status code', async() =>
        {
            const response = await request.get('/classes/1');
            expect(response.status).toBe(200);
        });

        test('should have Content-Type "application/json"', async() =>
        {
            const response = await request.get('/classes/1');
            expect(response.header['content-type']).toMatch(/application\/json/);
        });

        test('should contain the correct class as JSON', async() =>
        {
            const response = await request.get('/classes/1');
            const actual_response_content_as_json = response.body;

            const expected_response_as_json = {
                id: 1,
                code: 'CS 410',
                title: 'Databases',
                description: 'Foundations of database management systems...',
                maxStudents: 10
            };

            expect(actual_response_content_as_json).toEqual(expected_response_as_json);
        });

        test('should return a 404 (not found) status code when the class with id = 999 does not exist', async() =>
        {
            const response = await request.get('/classes/999');
            expect(response.status).toBe(404);
        });
    });

    describe('POST /classes', () =>
    {
        test('should return a 400 response when the "title" field is missing in the request', async() =>
        {
            // this is the form data that we will send in our POST request to the server
            const form_data = {
                code: 'CS 497',
                // title: 'DevOps',
                description: 'Development and Operations (DevOps) ...',
                maxStudents: 25
            };

            const response = await request
                .post('/classes')
                // .set('Content-Type', 'application/x-www-form-urlencoded') // this is equivalent to .type('form')
                .type('form')
                .send(form_data);     // send form data as the request body

            expect(response.status).toBe(400);
        });

        test('should return a 201 response when the request has all required fields and all field values are valid', async() =>
        {
            const form_data = {
                code: 'CS 497',
                title: 'DevOps',
                description: 'Development and Operations (DevOps) ...',
                maxStudents: 25
            };

            const response = await request
                .post('/classes')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(201);
        });

        test('should return a 422 response when the length of the "code" field is > 10 in the request', async() =>
        {
            const form_data = {
                code: 'CS 1234567890',  // length is > 10
                title: 'DevOps',
                description: 'Development and Operations (DevOps) ...',
                maxStudents: 25
            };

            const response = await request
                .post('/classes')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(422);
        });

        test('should return a 422 response when adding a class with the same code twice, since it will violate the unique code constraint', async() =>
        {
            const form_data = {
                code: 'CS 354',
                title: 'Programming Languages',
                description: 'Principles of programming languages: design, syntax, semantics...',
                maxStudents: 25
            };

            const first_response = await request
                .post('/classes')
                .type('form')
                .send(form_data);

            // we expect the class to be created successfully the first time
            expect(first_response.status).toBe(201);


            const second_response = await request
                .post('/classes')
                .type('form')
                .send(form_data);

            // we expect the class to not be created the second time because we cannot add a class with the same code twice,
            // since the code has a unique constraint in the database
            expect(second_response.status).toBe(422);
        });
    });

    describe('PUT /classes/:id', () =>
    {
        test('should return a 400 response when the "description" field is missing in the request', async() =>
        {
            const form_data = {
                code: 'CS 497',
                title: 'DevOps',
                // description: 'Development and Operations (DevOps) ...',
                maxStudents: 25
            };

            const response = await request
                .put('/classes/1')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(400);
        });

        test('should return a 200 response when updating the class with id = 2', async() =>
        {
            const form_data = {
                code: 'CS 408',
                title: '[Modified] Full Stack Web Development',
                description: '[Modified] Learn how to apply various technologies used for client-side and server-side web development...',
                maxStudents: 50
            };

            const response = await request
                .put('/classes/2')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(200);
        });

        test('should return a 422 response when updating the class with id = 3 using the same code as the class with id = 1', async() =>
        {
            const form_data = {
                code: 'CS 410', // this is the same code as the class with id = 1
                title: 'Full Stack Web Development',
                description: 'Learn how to apply various technologies used for client-side and server-side web development...',
                maxStudents: 50
            };

            const response = await request
                .put('/classes/3')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(422);
        });

        test('should return a 404 response when updating the class with id = 999 which does not exist', async() =>
        {
            const form_data = {
                code: 'CS 410',
                title: 'Databases',
                description: 'Foundations of database management systems...',
                maxStudents: 10
            };

            const response = await request
                .put('/classes/999')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /classes/:id', () =>
    {
        test('should return a 200 response when updating only a subset of fields for the class with id = 4', async() =>
        {
            const form_data = {
                // the other fields are not specified, which should be ok for a PATCH request
                title: 'Modified title',
                description: 'Modified description'
            };

            const response = await request
                .patch('/classes/4')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(200);
        });

        test('should return a 422 response when updating the class with id = 3 using the same code as the class with id = 1', async() =>
        {
            const form_data = {
                code: 'CS 410', // this is the same code as the class with id = 1
                title: 'Full Stack Web Development',
                description: 'Learn how to apply various technologies used for client-side and server-side web development...',
                maxStudents: 50
            };

            const response = await request
                .patch('/classes/3')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(422);
        });

        test('should return a 404 response when updating the class with id = 999 which does not exist', async() =>
        {
            const form_data = {
                code: 'CS 410',
                title: 'Databases',
                description: 'Foundations of database management systems...',
                maxStudents: 10
            };

            const response = await request
                .patch('/classes/999')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /classes/:id', () =>
    {
        test('should return a 204 response when deleting the class with id = 6', async() =>
        {
            const response = await request.delete('/classes/6');
            expect(response.status).toBe(204);
        });

        test('should return a 422 response when deleting the class with id = 1 which is referenced from the registered_students table', async() =>
        {
            const response = await request.delete('/classes/1');

            // class with id = 1 is referenced from the registered_students table and
            // deleting it will violate the foreign key constraint.
            // Therefore, if the implementation is correct, the server will
            // catch the SQL error thrown by the database and
            // should return a 422 response.
            expect(response.status).toBe(422);
        });

        test('should return a 404 response when deleting the class with id = 999 which does not exist', async() =>
        {
            const response = await request.delete('/classes/999');
            expect(response.status).toBe(404);
        });
    });
});
