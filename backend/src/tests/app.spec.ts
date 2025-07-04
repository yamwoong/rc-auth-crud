import request from "supertest";
import app from "@/app";

// Root endpoint integration tests
describe("Root API Endpoint", () => {
  it("should return wrapped response { data, message, code } on GET /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body).toEqual({
      data: { result: "Hello World" },
      message: "success",
      code: 200,
    });
  });

  it("should return 404 on unknown route", async () => {
    const res = await request(app).get("/unknown");
    expect(res.status).toBe(404);
  });
});
