import { lambdaHandler as createWeather } from "../src/createWeather";
import { lambdaHandler as getWeather } from "../src/getWeather";
import { lambdaHandler as deleteWeather } from "../src/deleteWeather";
import { lambdaHandler as updateWeather } from "../src/updateWeather";
import { lambdaHandler as listWeathers } from "../src/listWeathers";
import { docClient } from "../src/dynamo";

const sendMock = jest.spyOn(docClient, "send");
const originalTableName = process.env.TABLE_NAME;

beforeEach(() => {
  process.env.TABLE_NAME = "TestWeatherTable";
  sendMock.mockResolvedValue({ $metadata: {} });
});

afterEach(() => {
  if (originalTableName === undefined) {
    delete process.env.TABLE_NAME;
  } else {
    process.env.TABLE_NAME = originalTableName;
  }
  sendMock.mockReset();
});

afterAll(() => {
  docClient.destroy();
});

test("create weather", async () => {
  const result = await createWeather({
    body: JSON.stringify({
      weather: "hot",
      town: "Douala",
    }),
  });
  expect(result).toMatchObject({
    body: expect.any(String),
    statusCode: 201,
  });
  expect(sendMock).toHaveBeenCalledTimes(1);
});

test("get weather", async () => {
  sendMock.mockResolvedValueOnce({
    Item: { weather: "hot", town: "Douala" },
    $metadata: {},
  });

  const result = await getWeather({
    pathParameters: { town: "Douala" },
  });

  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body)).toEqual({ weather: "hot", town: "Douala" });
});

test("delete weather", async () => {
  const result = await deleteWeather({
    pathParameters: { town: "Douala" },
  });

  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body)).toMatchObject({ town: "Douala" });
});

test("update weather", async () => {
  sendMock.mockResolvedValueOnce({
    Attributes: { weather: "rainy", town: "Douala" },
    $metadata: {},
  });

  const result = await updateWeather({
    pathParameters: { town: "Douala" },
    body: JSON.stringify({ weather: "rainy" }),
  });

  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body)).toEqual({ weather: "rainy", town: "Douala" });
});

test("list weather", async () => {
  sendMock.mockResolvedValueOnce({
    Items: [{ weather: "hot", town: "Douala" }],
    $metadata: {},
  });

  const result = await listWeathers({});

  expect(result.statusCode).toBe(200);
  expect(JSON.parse(result.body)).toEqual([
    { weather: "hot", town: "Douala" },
  ]);
});

test("create weather rejects invalid input", async () => {
  const result = await createWeather({ body: "{}" });

  expect(result.statusCode).toBe(400);
  expect(sendMock).not.toHaveBeenCalled();
});