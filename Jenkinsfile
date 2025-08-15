pipeline {
    agent any
    environment {
        IMAGE_NAME = "localhost:5000/node-pipeline-poc"
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install & Lint & Test') {
            steps {
                sh 'docker run --rm -v $PWD:/app -w /app node:22-alpine sh -c "npm install && npm run lint && npm test"'
            }
        }
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${IMAGE_NAME}:latest .'
            }
        }
        stage('Push to Local Registry') {
            steps {
                sh 'docker push ${IMAGE_NAME}:latest'
            }
        }
        stage('Deploy Locally') {
            steps {
                sh 'docker rm -f node-poc || true'
                sh 'docker run -d --name node-poc -p 3000:3000 ${IMAGE_NAME}:latest'
            }
        }
        stage('Smoke Test') {
            steps {
                sh 'curl --fail http://localhost:3000/health'
            }
        }
    }
}
