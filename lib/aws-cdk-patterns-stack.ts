import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiEc2LambdaSnsConstruct } from './aws-cdk-patterns-construct';

export class ApiEc2LambdaSnsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new ApiEc2LambdaSnsConstruct(this, 'Ec2ApiService', {
      emailAddress: 'prajotkulkarni.bgm@gmail.com',
      lambdaCodePath: 'service',
    });
  }
}
