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
}

post {
    always {
        cleanWs()
    }
}

}
