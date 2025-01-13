pipeline {
  agent any
  tools {
    nodejs 'node 16.15.0'
  }
  parameters {
    string(name: 'DEPLOY_BRANCH', defaultValue: 'develop', description: 'Branch to deploy')
    string(name: 'ENV', defaultValue: 'dev', description: 'Environment for build')
  }
  stages {
    stage('Dependencies') {
      steps {
        sh 'npm cache clean --force && export NODE_OPTIONS="--max-old-space-size=4096" && npm install --force'
      }
    }

    stage('Build: dist files') {
      steps {
        sh "npm run --silent build -- --configuration=${params.ENV}"
      }
    }

    stage('Deploy: clean and upload') {
      steps {
        script {
          sh """
          echo "Cleaning and uploading files using SFTP..."
          export SSHPASS=\$SFTP_PASSWORD
          sshpass -e sftp -o StrictHostKeyChecking=no \$SFTP_USER@${DEPLOY_HOST} <<EOF
          cd ${DEPLOY_DIR}
          mkdir assets
          mrm *
          lcd dist
          put -r *
          bye
          EOF
          """
        }
      }
    }

  }
  post {
    always {
        // echo 'One way or another, I have finished'
        deleteDir() 
    }
    success {
        echo 'I succeeded!'
    }
    unstable {
        echo 'I am unstable :/'
    }
    failure {
        echo 'I failed :('
    }
    changed {
        echo 'Things were different before...'
    }
  }
}