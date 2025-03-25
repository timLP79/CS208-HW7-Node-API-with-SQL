const {describe, expect, test} = require("@jest/globals");

// supertest is a framework that allows to easily test web APIs
const supertest = require('supertest');
const app = require('./../app');
const request = supertest(app);

describe('REST APIs for students', () =>
{
    describe('GET /students', () =>
    {
        test('should return a 200 (ok) status code', async() =>
        {
            // version 1
            const response = await request.get('/students');
            expect(response.status).toBe(200);

            // or

            // version 2
            //await request.get('/students').expect(200);
        });

        test('should have Content-Type "application/json"', async() =>
        {
            const response = await request.get('/students');
            expect(response.header['content-type']).toMatch(/application\/json/);

            // or

           // await request.get('/students').expect('Content-Type', /application\/json/);
        });

        test('should contain the key "firstName" in the first student returned as a JSON response', async() =>
        {
            const response = await request.get('/students');
            const response_content_as_json = response.body;

            expect(response_content_as_json[0]).toHaveProperty('firstName');
        });

        test('should contain "Alice" in the first student first name returned as a JSON response', async() =>
        {
            const response = await request.get('/students');
            const response_content_as_json = response.body;

            expect(response_content_as_json[0].firstName).toBe('Alice');
        });
    });

    describe('GET /students/:id', () =>
    {
        test('should return a 200 status code', async() =>
        {
            const response = await request.get('/students/1');
            expect(response.status).toBe(200);
        });

        test('should have Content-Type "application/json"', async() =>
        {
            const response = await request.get('/students/1');
            expect(response.header['content-type']).toMatch(/application\/json/);
        });

        test('should contain the correct students as JSON', async() =>
        {
            const response = await request.get('/students/1');
            const actual_response_content_as_json = response.body;

            const expected_response_as_json = {
                id: 1,
                firstName: 'Alice',
                lastName: 'Agnesi',
                birthDate: '1991-01-01'
            };

            expect(actual_response_content_as_json).toEqual(expected_response_as_json);
        });

        test('should return a 404 (not found) status code when the student with id = 999 does not exist', async() =>
        {
            const response = await request.get('/students/999');
            expect(response.status).toBe(404);
        });
    });

    describe('POST /students', () =>
    {
        test('should return a 400 response when the "last_name" field is missing in the request', async() =>
        {
            // this is the form data that we will send in our POST request to the server
            const form_data = {
                firstName: 'Alice',
                // lastName: 'Agnesi',
                birthDate: '1990-01-01'
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
                firstName: 'Alice',
                lastName: 'Agnesi',
                birthDate: '1990-01-01'
            };

            const response = await request
                .post('/students')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(201);
        });

        test('should return a 422 response when the length of the "firstName" field is > 30 in the request', async() =>
        {
            const form_data = {
                firstName: 'fjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjfjf',  // length is > 30
                lastName: 'Agnesi',
                birthDate: '1990-01-01'
            };

            const response = await request
                .post('/students')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(422);
        });
    });

    describe('PUT /students/:id', () =>
    {
        test('should return a 400 response when the "birth_date" field is missing in the request', async() =>
        {
            const form_data = {
                firstName: 'Alice',
                lastName: 'Agnesi',
                // birthDate: '1990-01-01'
            };

            const response = await request
                .put('/students/1')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(400);
        });

        test('should return a 200 response when updating the students with id = 2', async() =>
        {
            const form_data = {
                firstName: 'Bob',
                lastName: 'Babbage',
                birthDate: '1992-02-02'
            };

            const response = await request
                .put('/students/2')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(200);
        });

        test('should return a 404 response when updating the student with id = 999 which does not exist', async() =>
        {
            const form_data = {
                firstName: 'Alice',
                lastName: 'Agnesi',
                birthDate: '1990-01-01'
            };

            const response = await request
                .put('/students/999')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(404);
        });
    });

    describe('DELETE /students/:id', () =>
    {
        test('should return a 204 response when deleting the student with id = 6', async() =>
        {
            const response = await request.delete('/students/6');
            expect(response.status).toBe(204);
        });

        test('should return a 422 response when deleting the student with id = 1 which is referenced from the registered_students table', async() =>
        {
            const response = await request.delete('/students/1');

            // class with id = 1 is referenced from the registered_students table and
            // deleting it will violate the foreign key constraint.
            // Therefore, if the implementation is correct, the server will
            // catch the SQL error thrown by the database and
            // should return a 422 response.
            expect(response.status).toBe(422);
        });

        test('should return a 404 response when deleting the student with id = 999 which does not exist', async() =>
        {
            const response = await request.delete('/students/999');
            expect(response.status).toBe(404);
        });
    });
});
