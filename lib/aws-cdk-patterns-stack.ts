import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

export class ApiEc2LambdaSnsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //<<--------------------------------- SNS TOPIC --------------------------------->>//
    const topic = new sns.Topic(this, 'Ec2NotificationTopic');
    topic.addSubscription(new subscriptions.EmailSubscription('prajotkulkarni.bgm@gmail.com'));

    //<<--------------------------------- IAM ROLE --------------------------------->>//
    const role = new iam.Role(this, 'ApiLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Execution role for EC2 control Lambda',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    role.addToPolicy(new iam.PolicyStatement({
      actions: [
        'ec2:StartInstances',
        'ec2:StopInstances',
        'ec2:DescribeInstances',
      ],
      resources: ['*'],
    }));

    role.addToPolicy(new iam.PolicyStatement({
      actions: ['sns:Publish'],
      resources: [topic.topicArn],
    }));

    //<<--------------------------------- LAMBDA FUNCTION --------------------------------->>//
    const apiLambda = new lambda.Function(this, 'ApiLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('service'),
      role,
      environment: {
        TOPIC_ARN: topic.topicArn,
      },
    });

    //<<--------------------------------- API GATEWAY --------------------------------->>//
    const httpApi = new apigatewayv2.HttpApi(this, 'MyHttpApi', {
      apiName: 'ec2-api',
      description: 'HTTP API Gateway to trigger Lambda',
    });

    // Create a dev stage
    new apigatewayv2.HttpStage(this, 'DevStage', {
      httpApi,
      stageName: 'dev',
      autoDeploy: true,
    });

    // Lambda Integration
    const lambdaIntegration = new integrations.HttpLambdaIntegration('LambdaIntegration', apiLambda);

    //<<--------------------------------- ROUTES --------------------------------->>//
    httpApi.addRoutes({
      path: '/start',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: lambdaIntegration,
    });

    httpApi.addRoutes({
      path: '/stop',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: lambdaIntegration,
    });

    httpApi.addRoutes({
      path: '/details',
      methods: [apigatewayv2.HttpMethod.GET, apigatewayv2.HttpMethod.POST],
      integration: lambdaIntegration,
    });

    // Catch-all route for invalid paths
    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [
        apigatewayv2.HttpMethod.GET,
        apigatewayv2.HttpMethod.POST,
        apigatewayv2.HttpMethod.PUT,
        apigatewayv2.HttpMethod.DELETE,
      ],
      integration: lambdaIntegration,
    });

    //<<--------------------------------- OUTPUTS --------------------------------->>//
    new cdk.CfnOutput(this, 'HttpApiUrl', { value: `${httpApi.apiEndpoint}/dev` });
    new cdk.CfnOutput(this, 'SnsTopicArn', { value: topic.topicArn });
  }
};
