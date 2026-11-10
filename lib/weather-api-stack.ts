import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import {
  CodePipeline,
  ShellStep,
  CodePipelineSource,
} from "aws-cdk-lib/pipelines";
import { PipelineStage } from "./pipeline-stage";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class WeatherApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'WeatherApiQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const pipeline = new CodePipeline(this, "Pipeline", {
      synth: new ShellStep("synth", {
        input: CodePipelineSource.gitHub(
          "Chike5314/weather-api",
          "master"
        ),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
    });

    /*********************************
     *    Add test stage
     *********************************/
    const devStage = pipeline.addStage(
      new PipelineStage(this, "PipelineDevStage", {
        stageName: "dev",
      })
    );
    const prodStage = pipeline.addStage(
    new PipelineStage(this, "PipelineProdStage", {
        stageName: "prod",
    })
    );
  }
}
