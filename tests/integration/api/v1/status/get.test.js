import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();

  const parsedUpdatedDate = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toEqual(parsedUpdatedDate);

  expect(responseBody.database.version).toEqual("16.3");
  expect(responseBody.database.max_connections).toEqual(100);
  expect(responseBody.database.opened_connections).toEqual(1);
});
