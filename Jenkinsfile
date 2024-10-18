pipeline {
    agent any
    environment {
        IMAGE_REPO_NAME="db-inventory-service"
        BUCKET_NAME="gobimbel-spin"
        HELM_STORE_PATH="services/db-inventory"
        AWS_CREDENTIALS_ID="jenkins-aws"
        APP_NAME="db-inventory"
        ARGOCD_CREDENTIALS_ID="argocd-token"
        ARGOCD_SERVER_URL="https://103.165.194.77:8080"
    }
    stages {
        stage('Cloning Git') {
            steps {
                script {
                    checkout scm
                }
            }
        }

        stage('Code Scan'){
            when {
                branch 'staging'
            }
            environment {
                scannerHome = tool 'sonar-scanner'
            }
            steps {

                withSonarQubeEnv('sonar-staging'){
                    sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=${APP_NAME} -Dsonar.sources=src/,package.json -Dsonar.exclusions=node_modules/**,dist/** -Dsonar.languages=ts"
                }
            }
        }

        stage('Push values to S3') {
            when { 
                branch 'main'
                changeset 'helm/**/*.yaml'
             }
            steps {
                script {
                    withAWS(region: "ap-southeast-1", credentials: "${AWS_CREDENTIALS_ID}"){
                        s3Upload(file: './helm', bucket: "${BUCKET_NAME}", path: "${HELM_STORE_PATH}")
                    }
                }
            }
        }

        stage('Building Image') {
            when {
                anyOf {
                    branch 'staging'
                    buildingTag()
                }
            }
            steps {
                container('dind') {
                    script {
                        app = docker.build("${IMAGE_REPO_NAME}")
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch 'staging'
                    buildingTag()
                }
            }
            steps {
                container('dind') {
                    script {
                        withCredentials([string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID')]) {
                            def tagName = ''
                            if (env.BRANCH_NAME == 'staging') {
                                tagName = 'staging'
                            } else if (buildingTag()) {
                                tagName = "${TAG_NAME}"
                            } else {
                                tagName = 'latest'
                            }

                            docker.withRegistry("https://${AWS_ACCOUNT_ID}.dkr.ecr.ap-southeast-1.amazonaws.com", "ecr:ap-southeast-1:${AWS_CREDENTIALS_ID}") {
                                app.push(tagName)
                            }
                        }
                    }
                }
            }
        }

        stage('Sync ArgoCD') {
            when {
                branch 'staging'
            }
            steps {                
                container('dind') {
                    script {
                        withCredentials([string(credentialsId: "${ARGOCD_CREDENTIALS_ID}", variable: 'ARGOCD_TOKEN')]) {
                            // Construct the API endpoint URL for syncing application
                            def syncUrl = "${ARGOCD_SERVER_URL}/api/v1/applications/${APP_NAME}/sync"

                            // Authorization header with bearer token
                            def authorizationHeader = "Bearer ${ARGOCD_TOKEN}"

                            // Send a POST request to sync the application
                            sh """
                            curl --insecure -X POST \\
                                -H "Authorization: ${authorizationHeader}" \\
                                -H "Content-Type: application/json" \\
                                ${syncUrl}
                            """
                        }
                    }
                }
            }
        }
    }
}