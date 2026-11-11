import { lambdaHandler as createWeather } from "../src/createWeather";
import { lambdaHandler as getWeather } from "../src/getWeather";
import { lambdaHandler as deleteWeather } from "../src/deleteWeather";
import { lambdaHandler as updateWeather } from "../src/updateWeather";
import { lambdaHandler as listWeathers } from "../src/listWeathers";
import { docClient } from "../src/dynamo";

const sendMock = jest.spyOn(docClient, "send");
let errorSpy: jest.SpyInstance;

beforeEach(() => {
  process.env.TABLE_NAME = "TestWeatherTable";
  sendMock.mockResolvedValue({ $metadata: {} });
  // Handlers log errors with console.error; keep test output clean.
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  sendMock.mockReset();
  errorSpy.mockRestore();
});

afterAll(() => {
  docClient.destroy();
});

describe("create weather", () => {
  test("sends a PutCommand with the trimmed town and weather", async () => {
    await createWeather({
      body: JSON.stringify({ town: "  Yaounde ", weather: " cloudy " }),
    });

    const command = sendMock.mock.calls[0][0] as any;
    expect(command.input.TableName).toBe("TestWeatherTable");
    expect(command.input.Item).toMatchObject({
      town: "Yaounde",
      weather: "cloudy",
    });
    expect(command.input.Item.updatedAt).toEqual(expect.any(String));
  });

  test("rejects a body that is not valid JSON", async () => {
    const result = await createWeather({ body: "{not json" });

    expect(result.statusCode).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("rejects a blank weather value", async () => {
    const result = await createWeather({
      body: JSON.stringify({ town: "Douala", weather: "   " }),
    });

    expect(result.statusCode).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("returns 500 when DynamoDB fails", async () => {
    sendMock.mockRejectedValueOnce(new Error("boom"));

    const result = await createWeather({
      body: JSON.stringify({ town: "Douala", weather: "hot" }),
    });

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: "Internal server error",
    });
  });

  test("returns 500 when TABLE_NAME is not configured", async () => {
    delete process.env.TABLE_NAME;

    const result = await createWeather({
      body: JSON.stringify({ town: "Douala", weather: "hot" }),
    });

    expect(result.statusCode).toBe(500);
  });
});

describe("get weather", () => {
  test("returns 404 when the town does not exist", async () => {
    const result = await getWeather({ pathParameters: { town: "Nowhere" } });

    expect(result.statusCode).toBe(404);
  });

  test("returns 400 when the town path parameter is missing", async () => {
    const result = await getWeather({});

    expect(result.statusCode).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("returns 500 when DynamoDB fails", async () => {
    sendMock.mockRejectedValueOnce(new Error("boom"));

    const result = await getWeather({ pathParameters: { town: "Douala" } });

    expect(result.statusCode).toBe(500);
  });
});

describe("delete weather", () => {
  test("sends a DeleteCommand for the requested town", async () => {
    await deleteWeather({ pathParameters: { town: "Douala" } });

    const command = sendMock.mock.calls[0][0] as any;
    expect(command.input).toEqual({
      TableName: "TestWeatherTable",
      Key: { town: "Douala" },
    });
  });

  test("returns 400 when the town path parameter is missing", async () => {
    const result = await deleteWeather({});

    expect(result.statusCode).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("returns 500 when DynamoDB fails", async () => {
    sendMock.mockRejectedValueOnce(new Error("boom"));

    const result = await deleteWeather({ pathParameters: { town: "Douala" } });

    expect(result.statusCode).toBe(500);
  });
});

describe("update weather", () => {
  test("returns 400 when the weather value is missing", async () => {
    const result = await updateWeather({
      pathParameters: { town: "Douala" },
      body: JSON.stringify({}),
    });

    expect(result.statusCode).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  test("returns 400 when the body is not valid JSON", async () => {
    const result = await updateWeather({
      pathParameters: { town: "Douala" },
      body: "{not json",
    });

    expect(result.statusCode).toBe(400);
  });

  test("returns 400 when the town path parameter is missing", async () => {
    const result = await updateWeather({
      body: JSON.stringify({ weather: "rainy" }),
    });

    expect(result.statusCode).toBe(400);
  });

  test("returns 500 when DynamoDB fails", async () => {
    sendMock.mockRejectedValueOnce(new Error("boom"));

    const result = await updateWeather({
      pathParameters: { town: "Douala" },
      body: JSON.stringify({ weather: "rainy" }),
    });

    expect(result.statusCode).toBe(500);
  });
});

describe("list weathers", () => {
  test("returns an empty array when the table is empty", async () => {
    const result = await listWeathers({});

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual([]);
  });

  test("returns 500 when DynamoDB fails", async () => {
    sendMock.mockRejectedValueOnce(new Error("boom"));

    const result = await listWeathers({});

    expect(result.statusCode).toBe(500);
  });
});

describe("CORS", () => {
  test("every response lets the browser frontend read it", async () => {
    const ok = await listWeathers({});
    const bad = await getWeather({});

    expect(ok.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(bad.headers["Access-Control-Allow-Origin"]).toBe("*");
  });
});
