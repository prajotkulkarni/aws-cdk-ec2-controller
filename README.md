
# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

# aws-cdk-ec2-controller

![npm](https://img.shields.io/npm/v/aws-cdk-ec2-controller?style=flat-square) ![CDK](https://img.shields.io/badge/CDK-2.172.0-blue?style=flat-square) ![Node](https://img.shields.io/badge/Node-20.x-green?style=flat-square)

**AWS CDK construct for automating EC2 instance management via Lambda and API Gateway.**  

This CDK stack allows you to:  

- Control EC2 instances programmatically (**start** and **stop**).  
- Retrieve instance details (ID, Name, IP) via the `/details` endpoint.  
- Send **SNS notifications** for all actions, including invalid requests.  
- Provide a **dev stage HTTP API** with a catch-all route for guidance.  

---

## Features

- **EC2 Control**: Start and stop instances programmatically via API endpoints.  
- **Instance Details**: `/details` endpoint returns JSON with instance **ID, Name, and IP**.  
- **SNS Notifications**: Sends emails for all actions, including invalid requests.  
- **API Gateway HTTP API**: Includes a dev stage and a catch-all route.  
- **Dynamic Lambda Environment**: Lambda reads the SNS topic ARN from environment variables.  

---

## Installation

```bash
# Install via npm
npm install aws-cdk-ec2-controller
