import {
  EC2Client,
  DescribeInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand
} from "@aws-sdk/client-ec2";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const ec2 = new EC2Client({});
const sns = new SNSClient({});

export const handler = async (event) => {
  const path = event.requestContext?.http?.path || "";
  const method = event.requestContext?.http?.method || "GET";
  let responseBody;
  let isValid = true; // track if endpoint is valid

  try {
    if (path.endsWith("/start") && method === "POST") {
      const describe = await ec2.send(new DescribeInstancesCommand({}));
      const stoppedInstances = describe.Reservations.flatMap(r =>
        r.Instances.filter(i => i.State.Name === "stopped").map(i => i.InstanceId)
      );

      if (stoppedInstances.length > 0) {
        await ec2.send(new StartInstancesCommand({ InstanceIds: stoppedInstances }));
        responseBody = { action: "start", started: stoppedInstances };
      } else {
        responseBody = { action: "start", message: "No stopped instances found to start." };
      }
    } else if (path.endsWith("/stop") && method === "POST") {
      const describe = await ec2.send(new DescribeInstancesCommand({}));
      const runningInstances = describe.Reservations.flatMap(r =>
        r.Instances.filter(i => i.State.Name === "running").map(i => i.InstanceId)
      );

      if (runningInstances.length > 0) {
        await ec2.send(new StopInstancesCommand({ InstanceIds: runningInstances }));
        responseBody = { action: "stop", stopped: runningInstances };
      } else {
        responseBody = { action: "stop", message: "No running instances found to stop." };
      }
    } else if (path.endsWith("/details") && (method === "GET" || method === "POST")) {
      const describe = await ec2.send(new DescribeInstancesCommand({}));
      const details = describe.Reservations.flatMap(r =>
        r.Instances.map(i => ({
          InstanceId: i.InstanceId,
          Name: i.Tags?.find(t => t.Key === "Name")?.Value || "Unnamed",
          State: i.State?.Name || "unknown",
          PrivateIp: i.PrivateIpAddress || "N/A",
          PublicIp: i.PublicIpAddress || "N/A",
        }))
      );
      responseBody = { action: "details", instances: details };
    } else {
      isValid = false;
      responseBody = {
        error: "Invalid endpoint",
        validEndpoints: ["/start (POST)", "/stop (POST)", "/details (GET|POST)"],
      };
    }

    // Publish to SNS only for valid endpoints
    if (isValid && process.env.TOPIC_ARN) {
      const messageToSend =
        typeof responseBody === "string"
          ? responseBody
          : JSON.stringify(responseBody, null, 2);

      await sns.send(new PublishCommand({
        TopicArn: process.env.TOPIC_ARN,
        Message: messageToSend,
      }));
    }

    return {
      statusCode: isValid ? 200 : 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(responseBody, null, 2),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }, null, 2),
    };
  }
};
