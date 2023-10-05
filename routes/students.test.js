const {describe, expect, test} = require("@jest/globals");

// supertest is a framework that allows to easily test web APIs
const supertest = require('supertest');
const app = require('./../app');
const request = supertest(app);

describe('REST APIs for students', () =>
{
    describe('GET /students', () =>
    {
        // TODO: add your tests
    });

    describe('GET /students/:id', () =>
    {
        // TODO: add your tests
    });

    describe('POST /students', () =>
    {
        // TODO: add your tests
    });

    describe('PUT /students/:id', () =>
    {
        // TODO: add your tests
    });

    describe('PATCH /students/:id', () =>
    {
        // TODO: add your tests
    });

    describe('DELETE /students/:id', () =>
    {
        // TODO: add your tests
    });
});
