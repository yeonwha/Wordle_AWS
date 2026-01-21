# 🎮 AWS Serverless Wordle

A fully serverless Wordle clone built on AWS.

> **Note**: This project is currently **archived**. The AWS resources have been decommissioned as the service period expired. This repository is for code reference.

## 🏗️ System Architecture
<img width="770" height="481" alt="Image" src="https://github.com/user-attachments/assets/71bf4a55-0523-4a4e-bead-3e6d882dae48" />

## 🕹️ Workflow & Game Logic
<img width="649" height="517" alt="Image" src="https://github.com/user-attachments/assets/bff42fd7-79c2-40c9-94ff-7d28f4d2b079" />

## 🚀 Architecture
- **Hosting**: S3 Static Website Hosting
- **Auth**: AWS Cognito (Identity & Access)
- **API**: API Gateway
- **Compute**: AWS Lambda (Game Logic)
- **Database**: DynamoDB (State & Scores)

## 🛠 Tech Stack
| Service | Role |
| :--- | :--- |
| **Amazon S3** | Frontend Deployment |
| **AWS Cognito** | User Authentication |
| **API Gateway** | REST API Management |
| **AWS Lambda** | Serverless Backend Logic |
| **DynamoDB** | Game Data & Leaderboard |

## 🕹️ Workflow & Game Logic
1. **Access**: Users access the web app via **S3** static hosting.
2. **Auth**: Authentication and session management are handled by **Cognito**.
3. **Guess Submission**: Each guess is sent to **Lambda** via **API Gateway**.
4. **Validation**: The backend verifies if the submitted word is **VALID**.
5. **Comparison**: Lambda iterates through each character:
    * 🟩 **Correct**: Right letter, right spot.
    * 🟨 **Present**: Right letter, wrong spot.
    * ⬛ **Absent**: Letter not in the word.
6. **State Management**: Results and scores are stored in **DynamoDB**.