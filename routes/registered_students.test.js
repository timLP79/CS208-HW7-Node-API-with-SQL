const {describe, expect, test} = require("@jest/globals");

// supertest is a framework that allows to easily test web APIs
const supertest = require('supertest');
const app = require('./../app');
const request = supertest(app);

describe('REST APIs for registered_students', () =>
{
    describe('GET /registered_students', () =>
    {
        test('should return a 200 (ok) status code', async() =>
        {
            // version 1
            const response = await request.get('/registered_students');
            expect(response.status).toBe(200);

            // or

            // version 2
            //await request.get('/students').expect(200);
        });

        test('should have Content-Type "application/json"', async() =>
        {
            const response = await request.get('/registered_students');
            expect(response.header['content-type']).toMatch(/application\/json/);

            // or

            // await request.get('/students').expect('Content-Type', /application\/json/);
        });

        test('should contain the key "studentFullName" in the first student returned as a JSON response', async() =>
        {
            const response = await request.get('/registered_students');
            const response_content_as_json = response.body;

            expect(response_content_as_json[0]).toHaveProperty('studentFullName');
        });

        test('should contain "Alice Agnesi" in the first student full name returned as a JSON response', async() =>
        {
            const response = await request.get('/registered_students');
            const response_content_as_json = response.body;

            expect(response_content_as_json[0].studentFullName).toBe('Alice Agnesi');
        });

    });

    describe('POST /add_student_to_class', () =>
    {
        test('should return a 400 response when the "studentId" field is missing in the request', async() =>
        {
            // this is the form data that we will send in our POST request to the server
            const form_data = {
                classId: 1,   // classId is present
                //studentId: '5'
            };

            const response = await request
                .post('/add_student_to_class')
                // .set('Content-Type', 'application/x-www-form-urlencoded') // this is equivalent to .type('form')
                .type('form')
                .send(form_data);     // send form data as the request body

            expect(response.status).toBe(400);
        });

        test('should return a 201 response when the request has all required fields and all field values are valid', async() =>
        {
            const form_data = {
                studentId: 1,
                classId: 2
            };

            const response = await request
                .post('/add_student_to_class')
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

    describe('DELETE /drop_student_from_class', () =>
    {
        test('should return a 400 response when the "studentId" field is missing in the request', async() =>
        {
            // this is the form data that we will send in our POST request to the server
            const form_data = {
                classId: 1,   // classId is present
                //studentId: '5'
            };

            const response = await request
                .delete('/drop_student_from_class')
                // .set('Content-Type', 'application/x-www-form-urlencoded') // this is equivalent to .type('form')
                .type('form')
                .send(form_data);     // send form data as the request body

            expect(response.status).toBe(400);
        });

        test('should return a 201 response when the request has all required fields and all field values are valid', async() =>
        {
            const form_data = {
                studentId: 1,
                classId: 2
            };

            const response = await request
                .delete('/drop_student_from_class')
                .type('form')
                .send(form_data);

            expect(response.status).toBe(200);
        });
    });

    describe('GET /students_taking_class/:classCode', () =>
    {
        test('should return a 200 (ok) status code', async() =>
        {
            const response = await request.get('/students_taking_class/MATH%20170');
            expect(response.status).toBe(200);
        });

        test('should have Content-Type "application/json"', async() =>
        {
            const response = await request.get('/students_taking_class/MATH%20170');
            expect(response.header['content-type']).toMatch(/application\/json/);
        });

        test('should contain the key "student_full_name" in the first student returned as a JSON response', async() =>
        {
            const response = await request.get('/students_taking_class/MATH%20170');
            const response_content_as_json = response.body;

            expect(response_content_as_json[1]).toHaveProperty('studentFullName');
        });

        test('should contain "Alice Agnesi" in the first student full name returned as a JSON response', async() =>
        {
            const response = await request.get('/students_taking_class/MATH%20170');
            const response_content_as_json = response.body;

            expect(response_content_as_json[0].studentFullName).toBe('Alice Agnesi');
        });
    });

    describe('GET /classes_in_which_student_is_enrolled/:studentId', () =>
    {
        test('should return a 200 (ok) status code', async() =>
        {
            const response = await request.get('/classes_in_which_student_is_enrolled/1');
            expect(response.status).toBe(200);
        });

        test('should have Content-Type "application/json"', async() =>
        {
            const response = await request.get('/classes_in_which_student_is_enrolled/1');
            expect(response.header['content-type']).toMatch(/application\/json/);
        });

        test('should contain the key "class_code" in the first class returned as a JSON response', async() =>
        {
            const response = await request.get('/classes_in_which_student_is_enrolled/1');
            const response_content_as_json = response.body;

            expect(response_content_as_json[0]).toHaveProperty('classCode');
        });

        test('should contain "CS 410" in the first class code returned as a JSON response', async() =>
        {
            const response = await request.get('/classes_in_which_student_is_enrolled/1');
            const response_content_as_json = response.body;

            expect(response_content_as_json[0].classCode).toBe('CS 410');
        });
    });
});
