import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

interface LambdaStackProps extends StackProps {
  stageName: string;
}

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, "DevCdkTypescriptWeatherTable", {
      tableName: `${props.stageName}weatherApiTable`,
      partitionKey: {
        name: "town",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const weatherApi = new apigw.RestApi(this, "weather_rest_api", {
      restApiName: `${props.stageName} Weather Rest Api`,
      description: "This service saves weather data.",
      // Lets the browser frontend call the API from another origin.
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
      },
    });
    const code = lambda.Code.fromAsset(path.join(__dirname, "..", "src"));
    const environment = {
      TABLE_NAME: table.tableName,
      STAGE_NAME: props.stageName,
    };

    const createWeatherLambda = new lambda.Function(
      this,
      "CreateWeatherLambdaFunction",
      {
        functionName: `${props.stageName}-cdk-typescript-create`,
        runtime: lambda.Runtime.NODEJS_24_X,
        handler: "createWeather.lambdaHandler",
        code,
        environment,
      }
    );
    const getWeatherLambda = new lambda.Function(this, "GetWeatherLambdaFunction", {
      functionName: `${props.stageName}-cdk-typescript-get`,
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "getWeather.lambdaHandler",
      code,
      environment,
    });
    const deleteWeatherLambda = new lambda.Function(
      this,
      "DeleteWeatherLambdaFunction",
      {
        functionName: `${props.stageName}-cdk-typescript-delete`,
        runtime: lambda.Runtime.NODEJS_24_X,
        handler: "deleteWeather.lambdaHandler",
        code,
        environment,
      }
    );
    const updateWeatherLambda = new lambda.Function(
      this,
      "UpdateWeatherLambdaFunction",
      {
        functionName: `${props.stageName}-cdk-typescript-update`,
        runtime: lambda.Runtime.NODEJS_24_X,
        handler: "updateWeather.lambdaHandler",
        code,
        environment,
      }
    );
    const listWeathersLambda = new lambda.Function(
      this,
      "ListWeathersLambdaFunction",
      {
        functionName: `${props.stageName}-cdk-typescript-list`,
        runtime: lambda.Runtime.NODEJS_24_X,
        handler: "listWeathers.lambdaHandler",
        code,
        environment,
      }
    );

    table.grantWriteData(createWeatherLambda);
    table.grantReadData(getWeatherLambda);
    table.grantWriteData(deleteWeatherLambda);
    table.grantReadWriteData(updateWeatherLambda);
    table.grantReadData(listWeathersLambda);

    const integration = (fn: lambda.IFunction) =>
      new apigw.LambdaIntegration(fn);
    weatherApi.root
      .addResource("create-weather")
      .addMethod("POST", integration(createWeatherLambda));
    weatherApi.root
      .addResource("get-weather")
      .addResource("{town}")
      .addMethod("GET", integration(getWeatherLambda));
    weatherApi.root
      .addResource("delete-weather")
      .addResource("{town}")
      .addMethod("DELETE", integration(deleteWeatherLambda));
    weatherApi.root
      .addResource("update-weather")
      .addResource("{town}")
      .addMethod("PUT", integration(updateWeatherLambda));
    weatherApi.root
      .addResource("list-weathers")
      .addMethod("GET", integration(listWeathersLambda));
  }
}