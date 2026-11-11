import * as cdk from "aws-cdk-lib";
import { Capture, Template } from "aws-cdk-lib/assertions";
import * as LambdaStack from "../lib/lambda-stack";

test("DynamoDB Table Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new LambdaStack.LambdaStack(app, "MyTestStack", {
    stageName: "Dev",
  });
  // THEN
  const template = Template.fromStack(stack);
  // template.resourceCountIs("AWS::DynamoDB::Table", 1);
  template.hasResource("AWS::DynamoDB::Table", {
    Properties: {
      TableName: "DevweatherApiTable",
    },
  });
});

test("5 Lambda Functions Created", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new LambdaStack.LambdaStack(app, "MyTestStack", {
    stageName: "Dev",
  });
  // THEN
  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::Lambda::Function", 5);
});

test("Create Lambda Function typescript Exist", () => {
  const app = new cdk.App();
  const stack = new LambdaStack.LambdaStack(app, "MyTestStack", {
    stageName: "Dev",
  });
  const template = Template.fromStack(stack);
  const envCapture = new Capture();
  template.hasResource("AWS::Lambda::Function", {
    Properties: {
      FunctionName: "Dev-cdk-typescript-create",
    },
  });
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture,
  });

  expect(envCapture.asObject()).toEqual({
    Variables: {
      TABLE_NAME: {
        Ref: "DevCdkTypescriptWeatherTableA8D40B83",
      },
      STAGE_NAME: "Dev",
    },
  });
});