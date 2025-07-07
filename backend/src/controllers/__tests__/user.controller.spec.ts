import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "@/app";
import { UserModel } from "@/models/user.model";

/**
 * Integration tests for UserController (CRUD API endpoints).
 * Uses Supertest to simulate HTTP requests against the app.
 * Uses in-memory MongoDB for isolation (mongodb-memory-server).
 */
describe("UserController (integration)", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Start up a fresh in-memory MongoDB instance for isolation
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: "test" });
  });

  afterAll(async () => {
    // Close all connections and stop the memory server
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    // Clean user collection after each test to ensure isolation
    await UserModel.deleteMany({});
  });

  describe("POST /users", () => {
    it("should create a user and return UserResponseDto", async () => {
      // When a valid user is created, should return safe fields only
      const res = await request(app).post("/users").send({
        email: "user@example.com",
        password: "password123",
        name: "Test User",
      });
      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        email: "user@example.com",
        name: "Test User",
        role: "user",
      });
      // Sensitive fields should not be exposed
      expect(res.body.data).not.toHaveProperty("password");
      // expect(res.body.data).not.toHaveProperty("deletedAt"); // 삭제!
    });

    it("should return 409 error if email already exists", async () => {
      // If a user already exists with this email, should return 409
      await request(app).post("/users").send({
        email: "dupe@example.com",
        password: "pw123456",
        name: "Dup",
      });
      const res = await request(app).post("/users").send({
        email: "dupe@example.com",
        password: "pw123456",
        name: "Dup2",
      });
      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already exists/i);
    });
  });

  describe("GET /users", () => {
    it("should return all users", async () => {
      // Should return an array of all users (not soft-deleted)
      await request(app).post("/users").send({
        email: "a@a.com",
        password: "pw123456",
        name: "A",
      });
      await request(app).post("/users").send({
        email: "b@b.com",
        password: "pw123456",
        name: "B",
      });
      const res = await request(app).get("/users");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  describe("GET /users/:id", () => {
    it("should return user by id", async () => {
      // Should find a user by their id and return UserResponseDto
      const postRes = await request(app).post("/users").send({
        email: "test@test.com",
        password: "pw123456",
        name: "C",
      });
      const userId = postRes.body.data.id;
      const res = await request(app).get(`/users/${userId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe("test@test.com");
    });

    it("should return 404 if user does not exist", async () => {
      // Should return 404 for non-existing user id
      const res = await request(app).get(`/users/666666666666666666666666`);
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });

  describe("PATCH /users/:id", () => {
    it("should update user", async () => {
      // Should update user's info and return new UserResponseDto
      const postRes = await request(app).post("/users").send({
        email: "patch@patch.com",
        password: "pw123456",
        name: "Patch",
      });
      const userId = postRes.body.data.id;
      const res = await request(app)
        .patch(`/users/${userId}`)
        .send({ name: "PatchUpdated" });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("PatchUpdated");
    });

    it("should return 404 if user not found", async () => {
      // Should return 404 if trying to update a non-existing user
      const res = await request(app)
        .patch(`/users/666666666666666666666666`)
        .send({ name: "none" });
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });

  describe("DELETE /users/:id", () => {
    it("should soft delete user", async () => {
      // Should soft-delete a user and return 204 No Content
      const postRes = await request(app).post("/users").send({
        email: "del@del.com",
        password: "pw123456",
        name: "Del",
      });
      const userId = postRes.body.data.id;
      const res = await request(app).delete(`/users/${userId}`);
      expect(res.status).toBe(204);
    });

    it("should return 404 if user not found", async () => {
      // Should return 404 if trying to delete a non-existing user
      const res = await request(app).delete(`/users/666666666666666666666666`);
      expect(res.status).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
  });
});
