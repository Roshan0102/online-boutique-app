pipeline {

agent any

environment {
    DOCKERHUB_USER = "roshan033"
    IMAGE_TAG = "build-${BUILD_NUMBER}"
}

stages {

    stage('Checkout') {
        steps {
            checkout scm
        }
    }

    stage('Detect Changes') {
        steps {
            script {

                def changedFiles = []

                for (changeLog in currentBuild.changeSets) {
                    for (entry in changeLog.items) {
                        for (file in entry.affectedFiles) {
                            changedFiles.add(file.path)
                        }
                    }
                }

                echo "Changed Files:"
                echo changedFiles.join('\n')

                env.BUILD_FRONTEND = "false"
                env.BUILD_USER = "false"
                env.BUILD_PRODUCT = "false"
                env.BUILD_ORDER = "false"

                changedFiles.each { file ->

                    if (file.startsWith("frontend/")) {
                        env.BUILD_FRONTEND = "true"
                    }

                    if (file.startsWith("services/user-service/")) {
                        env.BUILD_USER = "true"
                    }

                    if (file.startsWith("services/product-service/")) {
                        env.BUILD_PRODUCT = "true"
                    }

                    if (file.startsWith("services/order-service/")) {
                        env.BUILD_ORDER = "true"
                    }
                }

                echo "BUILD_FRONTEND=${env.BUILD_FRONTEND}"
                echo "BUILD_USER=${env.BUILD_USER}"
                echo "BUILD_PRODUCT=${env.BUILD_PRODUCT}"
                echo "BUILD_ORDER=${env.BUILD_ORDER}"
            }
        }
    }

    stage('SonarQube Analysis') {
        steps {
            script {

                def scannerHome = tool 'sonar-scanner'

                withSonarQubeEnv('SonarQube') {

                    if (env.BUILD_FRONTEND == "true") {

                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=cloudcart-frontend \
                        -Dsonar.projectName=cloudcart-frontend \
                        -Dsonar.sources=frontend/src
                        """
                    }

                    if (env.BUILD_USER == "true") {

                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=cloudcart-user-service \
                        -Dsonar.projectName=cloudcart-user-service \
                        -Dsonar.sources=services/user-service/src
                        """
                    }

                    if (env.BUILD_PRODUCT == "true") {

                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=cloudcart-product-service \
                        -Dsonar.projectName=cloudcart-product-service \
                        -Dsonar.sources=services/product-service/src
                        """
                    }

                    if (env.BUILD_ORDER == "true") {

                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=cloudcart-order-service \
                        -Dsonar.projectName=cloudcart-order-service \
                        -Dsonar.sources=services/order-service/src
                        """
                    }
                }
            }
        }
    }

    stage('Quality Gate') {

    steps {

            timeout(time: 5, unit: 'MINUTES') {

                waitForQualityGate abortPipeline: true

            }
        }
    }

    stage('Build Frontend') {
        when {
            expression { env.BUILD_FRONTEND == "true" }
        }

        steps {
            sh """
            docker build \
            --build-arg VITE_USER_SERVICE_URL= \
            --build-arg VITE_PRODUCT_SERVICE_URL= \
            --build-arg VITE_ORDER_SERVICE_URL= \
            -t ${DOCKERHUB_USER}/cloudcart-frontend:${IMAGE_TAG} \
            frontend
            """
        }
    }

    stage('Build User Service') {
        when {
            expression { env.BUILD_USER == "true" }
        }

        steps {
            sh """
            docker build \
            -t ${DOCKERHUB_USER}/cloudcart-user-service:${IMAGE_TAG} \
            services/user-service
            """
        }
    }

    stage('Build Product Service') {
        when {
            expression { env.BUILD_PRODUCT == "true" }
        }

        steps {
            sh """
            docker build \
            -t ${DOCKERHUB_USER}/cloudcart-product-service:${IMAGE_TAG} \
            services/product-service
            """
        }
    }

    stage('Build Order Service') {
        when {
            expression { env.BUILD_ORDER == "true" }
        }

        steps {
            sh """
            docker build \
            -t ${DOCKERHUB_USER}/cloudcart-order-service:${IMAGE_TAG} \
            services/order-service
            """
        }
    }
    stage('Trivy Scan') {

        steps {

            script {

                sh "mkdir -p trivy-reports"

                if (env.BUILD_FRONTEND == "true") {

                    sh """
                    trivy image \
                    --severity HIGH,CRITICAL \
                    --format table \
                    -o trivy-reports/frontend-report.txt \
                    ${DOCKERHUB_USER}/cloudcart-frontend:${IMAGE_TAG}
                    """
                }

                if (env.BUILD_USER == "true") {

                    sh """
                    trivy image \
                    --severity HIGH,CRITICAL \
                    --format table \
                    -o trivy-reports/user-service-report.txt \
                    ${DOCKERHUB_USER}/cloudcart-user-service:${IMAGE_TAG}
                    """
                }

                if (env.BUILD_PRODUCT == "true") {

                    sh """
                    trivy image \
                    --severity HIGH,CRITICAL \
                    --format table \
                    -o trivy-reports/product-service-report.txt \
                    ${DOCKERHUB_USER}/cloudcart-product-service:${IMAGE_TAG}
                    """
                }

                if (env.BUILD_ORDER == "true") {

                    sh """
                    trivy image \
                    --severity HIGH,CRITICAL \
                    --format table \
                    -o trivy-reports/order-service-report.txt \
                    ${DOCKERHUB_USER}/cloudcart-order-service:${IMAGE_TAG}
                    """
                }
            }
        }
    }

    stage('Push Frontend') {

    when {
        expression { env.BUILD_FRONTEND == "true" }
    }

    steps {

        withCredentials([usernamePassword(
            credentialsId: 'dockerhub-creds',
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
        )]) {

            sh """
            echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin

            docker push ${DOCKERHUB_USER}/cloudcart-frontend:${IMAGE_TAG}

            docker tag ${DOCKERHUB_USER}/cloudcart-frontend:${IMAGE_TAG} \
                       ${DOCKERHUB_USER}/cloudcart-frontend:latest

            docker push ${DOCKERHUB_USER}/cloudcart-frontend:latest
            """
        }
    }
}

    stage('Push User Service') {
        when {
            expression { env.BUILD_USER == "true" }
        }
        steps {
            withCredentials([usernamePassword(
                credentialsId: 'dockerhub-creds',
                usernameVariable: 'DOCKER_USER',
                passwordVariable: 'DOCKER_PASS'
            )]) {

                sh """
                echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin

                docker push ${DOCKERHUB_USER}/cloudcart-user-service:${IMAGE_TAG}

                docker tag ${DOCKERHUB_USER}/cloudcart-user-service:${IMAGE_TAG} \
                        ${DOCKERHUB_USER}/cloudcart-user-service:latest

                docker push ${DOCKERHUB_USER}/cloudcart-user-service:latest
                """
            }
        }
    }

stage('Push Product Service') {

    when {
        expression { env.BUILD_PRODUCT == "true" }
    }

    steps {

        withCredentials([usernamePassword(
            credentialsId: 'dockerhub-creds',
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
        )]) {

            sh """
            echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin

            docker push ${DOCKERHUB_USER}/cloudcart-product-service:${IMAGE_TAG}

            docker tag ${DOCKERHUB_USER}/cloudcart-product-service:${IMAGE_TAG} \
                       ${DOCKERHUB_USER}/cloudcart-product-service:latest

            docker push ${DOCKERHUB_USER}/cloudcart-product-service:latest
            """
        }
    }
}

stage('Push Order Service') {

    when {
        expression { env.BUILD_ORDER == "true" }
    }

    steps {

        withCredentials([usernamePassword(
            credentialsId: 'dockerhub-creds',
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
        )]) {

            sh """
            echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin

            docker push ${DOCKERHUB_USER}/cloudcart-order-service:${IMAGE_TAG}

            docker tag ${DOCKERHUB_USER}/cloudcart-order-service:${IMAGE_TAG} \
                       ${DOCKERHUB_USER}/cloudcart-order-service:latest

            docker push ${DOCKERHUB_USER}/cloudcart-order-service:latest
            """
        }
    }
}

stage('Update GitOps Repo') {

    steps {

        script {

            dir('gitops') {
                deleteDir()
            }

            withCredentials([
                usernamePassword(
                    credentialsId: 'github-creds',
                    usernameVariable: 'GITHUB_USER',
                    passwordVariable: 'GITHUB_TOKEN'
                )
            ]) {

                sh """
                git clone https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/Roshan0102/online-boutique-gitops.git gitops
                """

                dir('gitops') {

                    sh '''
                    git config user.name "Jenkins"
                    git config user.email "jenkins@cloudcart.local"
                    '''

                    if (env.BUILD_FRONTEND == "true") {
                        sh """
                        sed -i 's|image: roshan033/cloudcart-frontend:.*|image: roshan033/cloudcart-frontend:${IMAGE_TAG}|' apps/cloudcart/frontend/frontend-deployment.yaml
                        """
                    }

                    if (env.BUILD_USER == "true") {
                        sh """
                        sed -i 's|image: roshan033/cloudcart-user-service:.*|image: roshan033/cloudcart-user-service:${IMAGE_TAG}|' apps/cloudcart/user-service/user-service-deployment.yaml
                        """
                    }

                    if (env.BUILD_PRODUCT == "true") {
                        sh """
                        sed -i 's|image: roshan033/cloudcart-product-service:.*|image: roshan033/cloudcart-product-service:${IMAGE_TAG}|' apps/cloudcart/product-service/product-service-deployment.yaml
                        """
                    }

                    if (env.BUILD_ORDER == "true") {
                        sh """
                        sed -i 's|image: roshan033/cloudcart-order-service:.*|image: roshan033/cloudcart-order-service:${IMAGE_TAG}|' apps/cloudcart/order-service/order-service-deployment.yaml
                        """
                    }

                    sh """
                    git status
                    git add .
                    git commit -m "Update images to ${IMAGE_TAG}" || true
                    git push origin main
                    """
                }
            }
        }
    }
}
}

post {
    always {
        archiveArtifacts artifacts: 'trivy-reports/*', fingerprint: true
        cleanWs()
    }
}

}
