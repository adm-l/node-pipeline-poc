pipeline {
    agent any
    parameters {
        booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Deploy this build?')
    }
    environment {
        IMAGE_NAME = "localhost:5001/node-pipeline-poc"
        SONAR_HOST_URL = "http://localhost:9000"
        SONAR_AUTH_TOKEN = credentials('SONAR_TOKEN') 
        // Make sure 'SONAR-TOKEN' matches your Jenkins Secret Text credential ID exactly
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
            when { expression { params.DEPLOY } }
            steps {
                sh 'docker rm -f node-poc || true'
                sh 'docker run -d --name node-poc -p 3000:3000 ${IMAGE_NAME}:latest'
                sh '''
                for i in {1..5}; do
                  curl --fail http://localhost:3000/health && break
                  echo "Waiting for app to start..."
                  sleep 2
                done
                '''
            }
        }
    }
}
