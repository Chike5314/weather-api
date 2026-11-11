import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import {
  CodePipeline,
  ShellStep,
  CodePipelineSource,
  ManualApprovalStep,
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
        commands: ["npm ci", "npm run build", "npm test", "npx cdk synth"],
      }),
    });

    /*********************************
     *    Add test stage
     *********************************/
    // The unit tests already ran in the synth step above, so a failing test
    // stops the pipeline before anything is deployed to dev or prod.
    pipeline.addStage(
      new PipelineStage(this, "PipelineDevStage", {
        stageName: "dev",
      })
    );

    /*********************************
     *    Add prod stage (gated)
     *********************************/
    // The pipeline pauses here until someone approves in the CodePipeline console.
    pipeline.addStage(
      new PipelineStage(this, "PipelineProdStage", {
        stageName: "prod",
      }),
      { pre: [new ManualApprovalStep("PromoteToProd")] }
    );
  }
}
