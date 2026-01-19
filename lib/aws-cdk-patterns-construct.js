"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiEc2LambdaSnsConstruct = void 0;
const cdk = require("aws-cdk-lib");
const constructs_1 = require("constructs");
const apigatewayv2 = require("aws-cdk-lib/aws-apigatewayv2");
const integrations = require("aws-cdk-lib/aws-apigatewayv2-integrations");
const lambda = require("aws-cdk-lib/aws-lambda");
const iam = require("aws-cdk-lib/aws-iam");
const sns = require("aws-cdk-lib/aws-sns");
const subscriptions = require("aws-cdk-lib/aws-sns-subscriptions");
class ApiEc2LambdaSnsConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        //<<--------------------------------- SNS TOPIC --------------------------------->>//
        const topic = new sns.Topic(this, 'Ec2NotificationTopic', {
            topicName: props.topicName ?? 'ec2-notification-topic',
        });
        topic.addSubscription(new subscriptions.EmailSubscription(props.emailAddress));
        //<<--------------------------------- IAM ROLE --------------------------------->>//
        const role = new iam.Role(this, 'ApiLambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            description: 'Execution role for EC2 control Lambda',
            roleName: props.lambdaName ?? 'ApiEc2LambdaSnsRole',
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
            functionName: props.lambdaName ?? 'ApiEc2LambdaSnsFunction',
            code: props.lambdaCodePath
                ? lambda.Code.fromAsset(props.lambdaCodePath)
                : lambda.Code.fromAsset('service'),
            role,
            environment: {
                TOPIC_ARN: topic.topicArn,
            },
        });
        //<<--------------------------------- API GATEWAY --------------------------------->>//
        const httpApi = new apigatewayv2.HttpApi(this, 'MyHttpApi', {
            apiName: props.apiName ?? 'ec2-api',
            description: 'HTTP API Gateway to trigger Lambda',
        });
        // Create a dev stage
        new apigatewayv2.HttpStage(this, 'DevStage', {
            httpApi,
            stageName: props.stageName ?? 'dev',
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
}
exports.ApiEc2LambdaSnsConstruct = ApiEc2LambdaSnsConstruct;
;
