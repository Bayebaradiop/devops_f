// Pipeline CI/CD du front MediShop.
//
// Declenche a chaque push sur la branche suivie :
//   1. BUILD  : construit l'image Docker (build Vite -> nginx)
//   2. PUSH   : l'envoie sur Docker Hub
//   3. DEPLOY : se connecte en SSH a la VM Front et remplace le conteneur
//              (avec rollback automatique, voir deploy/deploy.sh)
//
// Difference avec le backend : la VM Front a une IP publique, donc PAS de rebond.
//
// AUCUN SECRET N'EST ECRIT ICI : le token Docker Hub et la cle SSH viennent
// des Credentials de Jenkins.

pipeline {
    agent any

    environment {
        IMAGE    = 'bayebara01012000/medishop_f'
        FRONT_IP = '20.199.183.9'
        VM_USER  = 'azureuser'
    }

    triggers {
        // Deux declencheurs, volontairement redondants :
        //
        // 1. githubPush() : declenchement INSTANTANE par webhook. GitHub doit
        //    pouvoir joindre Jenkins, ce qui exige un tunnel (Jenkins tourne en
        //    local, sur une adresse que l'Internet ne connait pas).
        //
        // 2. pollSCM : filet de securite. Jenkins interroge lui-meme GitHub
        //    toutes les minutes. Fonctionne meme sans tunnel.
        githubPush()
        pollSCM('* * * * *')
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {

        stage('Preparation') {
            steps {
                script {
                    env.TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                }
                echo "Version a deployer : ${env.TAG}"
            }
        }

        stage('Build') {
            steps {
                // VITE_API_URL reste VIDE : le front appelle l'API en URL relative
                // (/api/tasks). C'est le Nginx de la VM qui relaie vers le Back.
                // La meme image marche donc derriere une IP ou un nom de domaine,
                // en HTTP comme en HTTPS, sans etre reconstruite.
                sh 'docker build --build-arg VITE_API_URL="" -t $IMAGE:$TAG -t $IMAGE:latest .'
            }
        }

        stage('Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS')]) {
                    // --password-stdin : le token ne passe pas en argument de
                    // commande, il n'apparait donc pas dans la liste des processus.
                    sh '''
                        echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
                        docker push $IMAGE:$TAG
                        docker push $IMAGE:latest
                        docker logout
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'azure-ssh',
                    keyFileVariable: 'SSH_KEY')]) {
                    // La VM Front a une IP publique : connexion directe, pas de rebond.
                    sh '''
                        OPTS="-i $SSH_KEY -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=20"

                        scp $OPTS deploy/deploy.sh $VM_USER@$FRONT_IP:/tmp/deploy.sh

                        ssh $OPTS $VM_USER@$FRONT_IP \
                            "chmod +x /tmp/deploy.sh && /tmp/deploy.sh $IMAGE $TAG"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Front deploye : $IMAGE:${env.TAG} -- http://20.199.183.9"
        }
        failure {
            echo "Echec du pipeline. Si le deploiement a echoue, deploy.sh a deja"
            echo "tente un rollback vers la version precedente : verifier les logs."
        }
        always {
            sh 'docker logout 2>/dev/null || true'
        }
    }
}
