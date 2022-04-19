pipeline {
  agent any
  stages {
    stage('Dependencies') {
      steps {
        sh 'npm install --no-progress'
        sh 'npm run generate:api'
      }
    }

    stage('Lint') {
      steps {
        sh 'npm run lint'
      }
    }

    stage('Test') {
      steps {
        withEnv(overrides: ["CHROME_BIN=/usr/bin/chromium-browser"]) {
          sh 'npm run test:ci'
        }

      }
    }

    stage('SonarQube') {
      steps {
        sh 'npm run sonar'
      }
    }

    stage('Build: dist files') {
      steps {
        sh "npm run --silent build -- --configuration=${params.ENV} --no-progress"
        script {
          zip archive: true, dir: 'dist/Concenet_Front', glob: '', zipFile: 'Concenet_Front.zip'
        }
      }
    }

    stage('Build: Docker image') {
        steps {
            script {
              GIT_COMMIT_HASH = sh (script: "echo -n `git rev-parse --short HEAD`", returnStdout: true)
              APP_VERSION = sh (script: "node -p \"require('./package.json').version\"", returnStdout: true)

              sh "docker build --build-arg APP=Concenet_Front --build-arg ENV=${params.ENV} -t webfront/Concenet_Front:${GIT_COMMIT_HASH} ."
              sh "docker tag webfront/Concenet_Front:${GIT_COMMIT_HASH} webfront/Concenet_Front:${APP_VERSION}"
              sh "docker tag webfront/Concenet_Front:${GIT_COMMIT_HASH} webfront/Concenet_Front:latest"
            }
        }
    }

  }
  post {
    cleanup {
      deleteDir()
    }

  }
  parameters {
    string(name: 'ENV', defaultValue: 'production', description: 'Environment to build the Angular app')
  }
}