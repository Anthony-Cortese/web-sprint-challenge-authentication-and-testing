const request = require("supertest");
const server = require("./server");
const db = require("../data/dbConfig");

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db("users").truncate();
});

afterAll(async () => {
  await db.destroy();
});

const natalie = { username: "Natalie", password: "Portman" };
const margot = { username: "Margot", password: "Robbie" };
const empty = { username: "", password: "" };

test("sanity", () => {
  expect(true).toBe(true);
});

describe("[POST] /api/auth/register", () => {
  it("responds with a 201", async () => {
    const res = await request(server).post("/api/auth/register").send(natalie);
    expect(res.status).toBe(201);
  });

  it("responds with correct name on register", async () => {
    const res = await request(server).post("/api/auth/register").send(natalie);
    expect(res.body.username).toBe(natalie.username);
  });

  it("responds with an incorrect password match due to hash", async () => {
    const res = await request(server).post("/api/auth/register").send(margot);
    expect(res.body.password).not.toBe(margot.password);
  });
});

describe("[POST] /api/auth/login", () => {
  it("gives username and password are required message", async () => {
    const logged = await request(server).post("/api/auth/login").send(empty);
    expect(logged.body.message).toBe("username and password required");
  });

  it("brings back a welcome message", async () => {
    await request(server).post("/api/auth/register").send(natalie);
    const logged = await request(server).post("/api/auth/login").send(natalie);
    expect(logged.body.message).toBe("welcome, Natalie");
  });
});
