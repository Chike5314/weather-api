import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import { WeatherApiStack } from "../lib/weather-api-stack";

describe("WeatherApiStack (pipeline)", () => {
  const app = new cdk.App();
  const stack = new WeatherApiStack(app, "TestPipelineStack");
  const template = Template.fromStack(stack);

  test("creates exactly one CodePipeline", () => {
    template.resourceCountIs("AWS::CodePipeline::Pipeline", 1);
  });
//
  test("deploys to dev first, then prod", () => {
    const pipeline = Object.values(
      template.findResources("AWS::CodePipeline::Pipeline")
    )[0] as any;
    const stageNames = pipeline.Properties.Stages.map((s: any) => s.Name);

    expect(stageNames).toEqual(expect.arrayContaining(["dev", "prod"]));
    expect(stageNames.indexOf("dev")).toBeLessThan(stageNames.indexOf("prod"));
  });

  test("the build step runs the unit tests before synth", () => {
    const projects = template.findResources("AWS::CodeBuild::Project");
    const buildSpecs = JSON.stringify(projects);

    expect(buildSpecs).toContain("npm test");
    expect(buildSpecs.indexOf("npm test")).toBeLessThan(
      buildSpecs.indexOf("npx cdk synth")
    );
  });

  test("builds from the GitHub repository", () => {
    template.hasResourceProperties("AWS::CodePipeline::Pipeline", {
      Stages: Match.arrayWith([
        Match.objectLike({
          Actions: Match.arrayWith([
            Match.objectLike({
              ActionTypeId: Match.objectLike({ Provider: "GitHub" }),
            }),
          ]),
        }),
      ]),
    });
  });

  test("prod needs a manual approval before it deploys", () => {
    const pipeline = Object.values(
      template.findResources("AWS::CodePipeline::Pipeline")
    )[0] as any;
    const stages: any[] = pipeline.Properties.Stages;
    const prod = stages.find((s) => s.Name === "prod");
    const dev = stages.find((s) => s.Name === "dev");

    const approval = prod.Actions.find(
      (a: any) => a.ActionTypeId.Category === "Approval"
    );
    expect(approval).toBeDefined();
    expect(approval.ActionTypeId.Provider).toBe("Manual");

    // every prod deploy action runs after the approval
    prod.Actions.filter((a: any) => a.ActionTypeId.Category === "Deploy").forEach(
      (a: any) => expect(a.RunOrder).toBeGreaterThan(approval.RunOrder)
    );

    // dev deploys automatically, with no approval
    expect(
      dev.Actions.some((a: any) => a.ActionTypeId.Category === "Approval")
    ).toBe(false);
  });
});
