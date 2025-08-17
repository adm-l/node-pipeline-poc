pipeline {
    agent any
    parameters {
        booleanParam(name: 'DEPLOY', defaultValue: false, description: 'Enable manual deployment?')
    }
    environment {
        IMAGE_NAME = "localhost:5001/node-pipeline-poc"
        SONAR_HOST_URL = "http://sonarqube:9000"
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

        stage('Install, Lint & Test') {
            steps {
                sh 'npm install'
                sh 'npm run lint'
                sh 'npm test -- --coverage'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('MySonarServer') {
                    script {
                        def scannerHome = tool 'SonarScanner'
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=node-pipeline-poc \
                            -Dsonar.sources=. \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        """
                    }
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
            when { expression { return params.DEPLOY } }
            steps {
                input message: "Do you want to deploy this build now?", ok: "Deploy Now"
                script {
                    echo "Starting deployment..."
                    sh 'docker rm -f node-poc || true'
                    sh 'docker run -d --name node-poc -p 3000:3000 ${IMAGE_NAME}:latest'

                    // Wait for the app to be healthy
                    def retries = 10
                    def wait = 3
                    for (int i = 0; i < retries; i++) {
                        try {
                            sh "curl --fail http://localhost:3000/health"
                            echo "Application is up and running!"
                            break
                        } catch (Exception e) {
                            echo "Waiting for app to start... (${i+1}/${retries})"
                            sleep(wait)
                        }
                    }
                }
            }
        }
    }
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
