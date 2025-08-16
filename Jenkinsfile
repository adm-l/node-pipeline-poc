pipeline {
    agent any
    parameters {
        booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Deploy this build?')
    }
    environment {
        IMAGE_NAME = "localhost:5001/node-pipeline-poc"
        SONAR_HOST_URL = "http://localhost:9000"
        SONAR_AUTH_TOKEN = credentials('SONAR_TOKEN') 
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
                // Generate Jest coverage report for Sonar
                sh 'npm test -- --coverage'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('MySonarServer') {
                    sh """
                        sonar-scanner \
                          -Dsonar.projectKey=node-pipeline-poc \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=${SONAR_HOST_URL} \
                          -Dsonar.login=${SONAR_AUTH_TOKEN} \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    waitForQualityGate abortPipeline: true
                }
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
