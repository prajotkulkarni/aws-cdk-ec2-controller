"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiEc2LambdaSnsStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_cdk_patterns_construct_1 = require("./aws-cdk-patterns-construct");
class ApiEc2LambdaSnsStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        new aws_cdk_patterns_construct_1.ApiEc2LambdaSnsConstruct(this, 'Ec2ApiService', {
            emailAddress: 'prajotkulkarni.bgm@gmail.com',
            lambdaCodePath: 'service',
        });
    }
}
exports.ApiEc2LambdaSnsStack = ApiEc2LambdaSnsStack;
