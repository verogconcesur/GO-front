pipeline {
  agent any
  tools {
    nodejs 'node 16.15.0'
  }
  parameters {
    string(name: 'DEPLOY_BRANCH', defaultValue: 'develop', description: 'Branch to deploy')
    string(name: 'ENV', defaultValue: 'dev', description: 'Environment for build (dev, pre or production)')
    string(name: 'DEPLOY_DIR', defaultValue: '/sftp/DEV', description: 'SFTP path to deploy (/sftp/DEV or /sftp/PRE)')
  }
  stages {
    stage('Dependencies') {
      steps {
        sh 'npm cache clean --force && export NODE_OPTIONS="--max-old-space-size=4096" && npm install --force'
      }
    }

    stage('Build: dist files') {
      steps {
        sh """
        node --max_old_space_size=4096 ./node_modules/@angular/cli/bin/ng build --configuration=${params.ENV}
        """
      }
    }

    stage('Deploy: uploading files') {
      steps {
        script {
          sh """
          echo "Uploading files..."
          export SSHPASS=\$SFTP_PASSWORD
          sshpass -e sftp -o StrictHostKeyChecking=no \$SFTP_USER@${DEPLOY_HOST} <<EOF
          cd ${DEPLOY_DIR}/new
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

    stage('Post-Deploy: Backup and Cleanup') {
      steps {
        script {
          def timestamp = new Date().format('yyyyMMdd_HHmm')

          sh """
          echo "Creating backup and reorganizing deployment using SFTP..."
          export SSHPASS=$SFTP_PASSWORD
          sshpass -e sftp -o StrictHostKeyChecking=no $SFTP_USER@${DEPLOY_HOST} <<EOF
          cd ${DEPLOY_DIR}

          # Create a new backup directory with the current timestamp
          mkdir -p backup/${timestamp}

          # Move files except ./config, ./new, and ./backup to the new backup directory
          mget *
          mput -r backup/${timestamp}
          rm -r !('config'|'new'|'backup')

          # Move new deployment files to /sftp/DEV
          cd new
          mput * ../

          # Cleanup backups if more than 3 exist
          cd backup
          ls -1 | sort | head -n -3 | xargs rm -rf
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