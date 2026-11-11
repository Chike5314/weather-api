# Weather API: unit testing and CI/CD with AWS CDK

A small serverless CRUD API for weather data, used to practise unit testing and CI/CD pipelines.

**Stack:** API Gateway, Lambda (Node.js 24), DynamoDB, AWS CDK (TypeScript), CDK Pipelines (CodePipeline + CodeBuild).

## Endpoints

| Method | Path                    | Lambda          | Body                     |
| ------ | ----------------------- | --------------- | ------------------------ |
| POST   | `/create-weather`       | createWeather   | `{ "town", "weather" }`  |
| GET    | `/get-weather/{town}`   | getWeather      |                          |
| PUT    | `/update-weather/{town}`| updateWeather   | `{ "weather" }`          |
| DELETE | `/delete-weather/{town}`| deleteWeather   |                          |
| GET    | `/list-weathers`        | listWeathers    |                          |

## Project layout

- `src/` Lambda handlers (`dynamo.js` holds the shared DynamoDB client and response helpers)
- `lib/lambda-stack.ts` the application stack (table, API, Lambdas), deployed once per stage
- `lib/pipeline-stage.ts` wraps the application stack so the pipeline can deploy it as a stage
- `lib/weather-api-stack.ts` the pipeline: Source (GitHub) -> Build (`npm ci`, build, **test**, synth) -> dev -> **manual approval** -> prod
- `test/` unit tests: Lambda handlers (DynamoDB mocked), infrastructure assertions, pipeline assertions

## Useful commands

* `npm run build`   type-check the project
* `npm test`        run the Jest unit tests
* `npx cdk synth`   emit the CloudFormation templates
* `npx cdk deploy`  deploy the pipeline stack (once; after that, `git push` deploys)

## Frontend (`web/`)

A React + TypeScript + Tailwind app built with [shadcn/ui](https://ui.shadcn.com) components (Vite).

```bash
cd web
npm install
npm run dev        # http://localhost:5173
```

1. Deploy the stack and copy the **Endpoint** output of the dev stage (it ends with `/dev/`).
2. In the app, click the gear icon and paste that URL (or set `VITE_API_URL` in `web/.env`).
3. With no URL set, the app runs in demo mode on sample data.

The API sends CORS headers (`defaultCorsPreflightOptions` in `lib/lambda-stack.ts` and `Access-Control-Allow-Origin` in `src/dynamo.js`) so the browser is allowed to call it.
Add more shadcn components later with `npx shadcn@latest add <component>` (`web/components.json` is already configured).

## How the pipeline protects you

Every push to `master` runs the unit tests in the Build step. If any test fails, the
pipeline stops and nothing is deployed to dev or prod.

Prod is gated by a manual approval: after dev succeeds, the pipeline pauses at `PromoteToProd` until you approve (or reject) it in the CodePipeline console.
