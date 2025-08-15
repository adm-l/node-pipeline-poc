pipeline {
    agent any
    environment {
        IMAGE_NAME = "localhost:5001/node-pipeline-poc"
    }
    tools {
        nodejs 'Node22' 
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Install & Lint & Test') {
            steps {
               sh 'npm install'
                sh 'npm run lint'
                sh 'npm test'
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
                sh 'docker run -d --name node-poc -p 5001:3000 ${IMAGE_NAME}:latest'
            }
        }
        stage('Smoke Test') {
            steps {
                sh 'curl --fail http://localhost:3001/health'
            }
        }
    }
}
