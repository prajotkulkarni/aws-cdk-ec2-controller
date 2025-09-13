
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

**AWS CDK construct to automate EC2 instance management via Lambda and API Gateway, with SNS notifications for all actions.**  

This stack allows you to:  

- Start and stop EC2 instances programmatically.  
- Fetch instance details (ID, Name, IP) via the `/details` endpoint.  
- Send **SNS notifications** for all actions, including invalid requests.  
- Expose a **dev stage HTTP API** with a catch-all route for guidance.  

---

## Features

- **EC2 Control**: `/start` starts all stopped instances, `/stop` stops all running instances.  
- **Instance Details**: `/details` returns a JSON list of instance IDs, names, and IPs.  
- **SNS Notifications**: Sends emails for every action and invalid requests.  
- **HTTP API Gateway**: Dev stage included, with a catch-all route for guidance.  
- **Environment-Friendly**: Lambda reads the SNS topic ARN from environment variables.  

---

## API Endpoints

| Path       | Method | Description                              |
|------------|--------|------------------------------------------|
| /start     | POST   | Start all stopped EC2 instances           |
| /stop      | POST   | Stop all running EC2 instances            |
| /details   | GET    | Returns JSON with instance details        |
| *          | POST   | Catch-all: guides valid endpoints         |

---

## Installation

```bash
# Install via npm
npm install aws-cdk-ec2-controller

