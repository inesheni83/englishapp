export const dailyContent = {
  1: {
    title: "Version Control & Collaboration",
    vocab: [
      { word: 'Deployment', translation: 'Déploiement', category: 'Engineering', example: 'The deployment to the production server is scheduled for midnight.', exampleTranslation: 'Le déploiement sur le serveur de production est prévu pour minuit.' },
      { word: 'Framework', translation: 'Cadre de travail', category: 'Engineering', example: 'We decided to use the React framework for the new front-end.', exampleTranslation: 'Nous avons décidé d\'utiliser le framework React pour le nouveau front-end.' },
      { word: 'Refactoring', translation: 'Remaniement du code', category: 'Engineering', example: 'This legacy code needs major refactoring before we add new features.', exampleTranslation: 'Ce code hérité nécessite un remaniement majeur avant d\'ajouter de nouvelles fonctionnalités.' },
      { word: 'Bandwidth', translation: 'Bande passante', category: 'Engineering', example: 'The new image optimization reduced our bandwidth usage by 30%.', exampleTranslation: 'La nouvelle optimisation d\'image a réduit notre utilisation de la bande passante de 30%.' },
      { word: 'To debug', translation: 'Déboguer', category: 'Engineering', example: 'I spent three hours trying to debug this memory leak.', exampleTranslation: 'J\'ai passé trois heures à essayer de déboguer cette fuite de mémoire.' },
      { word: 'Deadline', translation: 'Date limite', category: 'Project', example: 'We must finish the API integration before Friday\'s deadline.', exampleTranslation: 'Nous devons terminer l\'intégration de l\'API avant la date limite de vendredi.' },
      { word: 'To touch base', translation: 'Faire le point', category: 'Teamwork', example: 'Let\'s touch base tomorrow morning to discuss the sprint progress.', exampleTranslation: 'Faisons le point demain matin pour discuter de l\'avancement du sprint.' },
      { word: 'Stand-up meeting', translation: 'Réunion de suivi', category: 'Teamwork', example: 'During the daily stand-up meeting, I\'ll explain what I did yesterday.', exampleTranslation: 'Pendant la réunion de suivi quotidienne, j\'expliquerai ce que j\'ai fait hier.' },
      { word: 'Peer review', translation: 'Revue de code par les pairs', category: 'Teamwork', example: 'Your pull request is currently pending peer review.', exampleTranslation: 'Votre pull request est actuellement en attente de revue par les pairs.' },
      { word: 'To get along', translation: 'Bien s\'entendre', category: 'Teamwork', example: 'The back-end and front-end teams get along very well.', exampleTranslation: 'Les équipes back-end et front-end s\'entendent très bien.' },
      { word: 'Bottleneck', translation: 'Goulot d\'étranglement', category: 'Engineering', example: 'The database query is the main bottleneck in our application\'s performance.', exampleTranslation: 'La requête de la base de données est le principal goulot d\'étranglement des performances de notre application.' },
      { word: 'Keynote', translation: 'Présentation principale', category: 'Conferences', example: 'The keynote at the conference introduced a new JavaScript runtime.', exampleTranslation: 'La présentation principale de la conférence a introduit un nouvel environnement d\'exécution JavaScript.' },
      { word: 'Networking', translation: 'Réseautage', category: 'Conferences', example: 'Conferences are a great opportunity for networking with other developers.', exampleTranslation: 'Les conférences sont une excellente occasion de faire du réseautage avec d\'autres développeurs.' },
      { word: 'Time zone', translation: 'Fuseau horaire', category: 'Remote Work', example: 'Working across different time zones can make scheduling meetings tricky.', exampleTranslation: 'Travailler sur différents fuseaux horaires peut rendre la planification des réunions difficile.' },
      { word: 'To roll back', translation: 'Revenir à une version précédente', category: 'Engineering', example: 'The update crashed the app, so we had to roll back to the previous version.', exampleTranslation: 'La mise à jour a fait planter l\'application, nous avons donc dû revenir à la version précédente.' }
    ],
    grammarTitle: "Present Perfect",
    grammarDesc: "Le Present Perfect fait le pont entre le passé et le présent. Indispensable pour les Daily Stand-ups.",
    grammarSyntax: "Sujet + have / has + Participe Passé",
    grammarRules: [
      { title: "1. To deploy (Déployer)", example: '"We have deployed the new microservice."', translation: "Nous avons déployé le nouveau microservice." },
      { title: "2. To fix (Corriger)", example: '"I have fixed the memory leak."', translation: "J'ai corrigé la fuite de mémoire." },
      { title: "3. To commit (Soumettre)", example: '"She has committed the changes."', translation: "Elle a soumis les modifications." }
    ]
  },
  2: {
    title: "Coding & Architecture",
    vocab: [
      { word: 'Scalability', translation: 'Évolutivité', category: 'Architecture', example: 'Microservices improve the scalability of our system.', exampleTranslation: 'Les microservices améliorent l\'évolutivité de notre système.' },
      { word: 'Latency', translation: 'Latence', category: 'Performance', example: 'We need to reduce the latency of our API calls.', exampleTranslation: 'Nous devons réduire la latence de nos appels d\'API.' },
      { word: 'Boilerplate', translation: 'Code générique', category: 'Coding', example: 'This framework generates a lot of boilerplate code.', exampleTranslation: 'Ce framework génère beaucoup de code générique.' },
      { word: 'Snippet', translation: 'Extrait de code', category: 'Coding', example: 'I found a useful code snippet on StackOverflow.', exampleTranslation: 'J\'ai trouvé un extrait de code utile sur StackOverflow.' },
      { word: 'Deprecated', translation: 'Obsolète', category: 'Engineering', example: 'Do not use this package, it is deprecated.', exampleTranslation: 'N\'utilisez pas ce paquet, il est obsolète.' },
      { word: 'Monolithic', translation: 'Monolithique', category: 'Architecture', example: 'We are breaking down our monolithic application.', exampleTranslation: 'Nous décomposons notre application monolithique.' },
      { word: 'Endpoint', translation: 'Point d\'accès', category: 'API', example: 'The new user endpoint returns a JSON payload.', exampleTranslation: 'Le nouveau point d\'accès utilisateur retourne une charge utile JSON.' },
      { word: 'Payload', translation: 'Charge utile', category: 'API', example: 'The request payload is missing the authentication token.', exampleTranslation: 'La charge utile de la requête ne contient pas le jeton d\'authentification.' },
      { word: 'Middleware', translation: 'Intergiciel', category: 'Architecture', example: 'We added a middleware to handle CORS.', exampleTranslation: 'Nous avons ajouté un intergiciel pour gérer les CORS.' },
      { word: 'To parse', translation: 'Analyser (du code/texte)', category: 'Coding', example: 'The server failed to parse the JSON response.', exampleTranslation: 'Le serveur n\'a pas réussi à analyser la réponse JSON.' },
      { word: 'To serialize', translation: 'Sérialiser', category: 'Coding', example: 'We serialize the object before saving it to the database.', exampleTranslation: 'Nous sérialisons l\'objet avant de le sauvegarder dans la base de données.' },
      { word: 'Hardcoded', translation: 'Codé en dur', category: 'Coding', example: 'Do not leave hardcoded credentials in the repository.', exampleTranslation: 'Ne laissez pas d\'identifiants codés en dur dans le dépôt.' },
      { word: 'Tech debt', translation: 'Dette technique', category: 'Engineering', example: 'We need a sprint dedicated to paying off tech debt.', exampleTranslation: 'Nous avons besoin d\'un sprint dédié pour rembourser la dette technique.' },
      { word: 'Workaround', translation: 'Solution de contournement', category: 'Troubleshooting', example: 'This is just a temporary workaround until the library is patched.', exampleTranslation: 'Ceci n\'est qu\'une solution de contournement temporaire jusqu\'à ce que la bibliothèque soit corrigée.' },
      { word: 'Mock', translation: 'Bouchon / Faux', category: 'Testing', example: 'We use mock data for our unit tests.', exampleTranslation: 'Nous utilisons des données factices pour nos tests unitaires.' }
    ],
    grammarTitle: "Past Simple vs Present Perfect",
    grammarDesc: "Savoir quand utiliser le passé simple (action terminée à un moment précis) vs Present Perfect (conséquence présente).",
    grammarSyntax: "Past Simple: Sujet + Verbe-ed | Present Perfect: Sujet + have/has + Participe",
    grammarRules: [
      { title: "1. Past Simple (Action datée)", example: '"I fixed the bug yesterday."', translation: "J'ai corrigé le bug hier." },
      { title: "2. Present Perfect (Bilan actuel)", example: '"I have fixed the bug."', translation: "J'ai corrigé le bug (c'est fait maintenant)." },
      { title: "3. Différence en réunion", example: '"Did you deploy it on Monday? Yes, I have just checked it."', translation: "L'as-tu déployé lundi ? Oui, je viens juste de vérifier." }
    ]
  },
  3: {
    title: "Bug Fixing & Troubleshooting",
    vocab: [
      { word: 'To reproduce', translation: 'Reproduire', category: 'Testing', example: 'I cannot reproduce the bug on my local machine.', exampleTranslation: 'Je n\'arrive pas à reproduire le bug sur ma machine locale.' },
      { word: 'Stack trace', translation: 'Trace de la pile', category: 'Debugging', example: 'Check the stack trace to see where the error originated.', exampleTranslation: 'Vérifiez la trace de la pile pour voir d\'où vient l\'erreur.' },
      { word: 'Hotfix', translation: 'Correction à chaud', category: 'Deployment', example: 'We need to push a hotfix immediately.', exampleTranslation: 'Nous devons déployer un correctif à chaud immédiatement.' },
      { word: 'Edge case', translation: 'Cas limite', category: 'Testing', example: 'That bug only happens in a very rare edge case.', exampleTranslation: 'Ce bug ne se produit que dans un cas limite très rare.' },
      { word: 'To triage', translation: 'Trier (les tickets)', category: 'Management', example: 'Let\'s triage the incoming bugs before the sprint planning.', exampleTranslation: 'Trions les bugs entrants avant la planification du sprint.' },
      { word: 'Memory leak', translation: 'Fuite de mémoire', category: 'Performance', example: 'The app crashes after 1 hour due to a memory leak.', exampleTranslation: 'L\'application plante après 1 heure à cause d\'une fuite de mémoire.' },
      { word: 'To mitigate', translation: 'Atténuer', category: 'Security', example: 'We added rate limiting to mitigate the DDoS attack.', exampleTranslation: 'Nous avons ajouté une limitation de débit pour atténuer l\'attaque DDoS.' },
      { word: 'Timeout', translation: 'Délai d\'attente', category: 'Network', example: 'The connection closed because of a network timeout.', exampleTranslation: 'La connexion s\'est fermée à cause d\'un délai d\'attente réseau.' },
      { word: 'Flaky', translation: 'Instable', category: 'Testing', example: 'This flaky test fails 10% of the time.', exampleTranslation: 'Ce test instable échoue 10% du temps.' },
      { word: 'Log file', translation: 'Fichier journal', category: 'Debugging', example: 'I am investigating the server log files.', exampleTranslation: 'J\'étudie les fichiers journaux du serveur.' },
      { word: 'To override', translation: 'Surcharger / Écraser', category: 'Coding', example: 'You need to override the default configuration.', exampleTranslation: 'Vous devez surcharger la configuration par défaut.' },
      { word: 'Fallback', translation: 'Solution de repli', category: 'Architecture', example: 'If the main API fails, we use a fallback server.', exampleTranslation: 'Si l\'API principale échoue, nous utilisons un serveur de repli.' },
      { word: 'Null pointer', translation: 'Pointeur nul', category: 'Debugging', example: 'A null pointer exception crashed the thread.', exampleTranslation: 'Une exception de pointeur nul a fait planter le fil d\'exécution.' },
      { word: 'Thread', translation: 'Fil d\'exécution', category: 'Performance', example: 'JavaScript runs on a single thread.', exampleTranslation: 'JavaScript s\'exécute sur un seul fil d\'exécution.' },
      { word: 'Patch', translation: 'Correctif', category: 'Deployment', example: 'The security patch will be applied tonight.', exampleTranslation: 'Le correctif de sécurité sera appliqué ce soir.' }
    ],
    grammarTitle: "Conditionals (Zero & First)",
    grammarDesc: "Utilisés pour exprimer des vérités générales (Zero) et des situations futures probables (First) en programmation.",
    grammarSyntax: "Zero: If + Present, Present | First: If + Present, will + Verbe",
    grammarRules: [
      { title: "1. Zero Conditional (Vérité logique)", example: '"If the API fails, the app throws an error."', translation: "Si l'API échoue, l'application renvoie une erreur." },
      { title: "2. First Conditional (Prédiction)", example: '"If we deploy this now, the server will crash."', translation: "Si nous déployons cela maintenant, le serveur plantera." },
      { title: "3. Unless (À moins que)", example: '"The code won\'t merge unless tests pass."', translation: "Le code ne sera pas fusionné à moins que les tests ne réussissent." }
    ]
  },
  4: {
    title: "Security & Performance",
    vocab: [
      { word: 'Encryption', translation: 'Chiffrement', category: 'Security', example: 'End-to-end encryption protects user data.', exampleTranslation: 'Le chiffrement de bout en bout protège les données des utilisateurs.' },
      { word: 'Vulnerability', translation: 'Vulnérabilité', category: 'Security', example: 'A critical vulnerability was found in the package.', exampleTranslation: 'Une vulnérabilité critique a été trouvée dans le paquet.' },
      { word: 'Brute force', translation: 'Force brute', category: 'Security', example: 'They attempted a brute force attack on the login page.', exampleTranslation: 'Ils ont tenté une attaque par force brute sur la page de connexion.' },
      { word: 'To spoof', translation: 'Usurper', category: 'Security', example: 'The attacker tried to spoof the IP address.', exampleTranslation: 'L\'attaquant a essayé d\'usurper l\'adresse IP.' },
      { word: 'Handshake', translation: 'Échange de signaux', category: 'Network', example: 'The SSL handshake failed.', exampleTranslation: 'L\'échange de signaux SSL a échoué.' },
      { word: 'Throughput', translation: 'Débit', category: 'Performance', example: 'We increased the database throughput by adding read replicas.', exampleTranslation: 'Nous avons augmenté le débit de la base de données en ajoutant des répliques de lecture.' },
      { word: 'Caching', translation: 'Mise en cache', category: 'Performance', example: 'Caching the responses reduced server load.', exampleTranslation: 'La mise en cache des réponses a réduit la charge du serveur.' },
      { word: 'Asynchronous', translation: 'Asynchrone', category: 'Coding', example: 'Use asynchronous functions for non-blocking I/O.', exampleTranslation: 'Utilisez des fonctions asynchrones pour les entrées/sorties non bloquantes.' },
      { word: 'Concurrency', translation: 'Concurrence', category: 'Architecture', example: 'Handling concurrency in distributed systems is hard.', exampleTranslation: 'Gérer la concurrence dans les systèmes distribués est difficile.' },
      { word: 'To throttle', translation: 'Limiter (le débit)', category: 'Performance', example: 'We throttle requests from the same IP.', exampleTranslation: 'Nous limitons les requêtes provenant de la même adresse IP.' },
      { word: 'Obfuscation', translation: 'Obfuscation', category: 'Security', example: 'Code obfuscation makes reverse engineering harder.', exampleTranslation: 'L\'obfuscation du code rend la rétro-ingénierie plus difficile.' },
      { word: 'Malware', translation: 'Logiciel malveillant', category: 'Security', example: 'The server was infected by malware.', exampleTranslation: 'Le serveur a été infecté par un logiciel malveillant.' },
      { word: 'Load balancer', translation: 'Répartiteur de charge', category: 'Architecture', example: 'The load balancer distributes traffic evenly.', exampleTranslation: 'Le répartiteur de charge distribue le trafic uniformément.' },
      { word: 'Lazy loading', translation: 'Chargement différé', category: 'Performance', example: 'Lazy loading images improves the initial page load time.', exampleTranslation: 'Le chargement différé des images améliore le temps de chargement initial de la page.' },
      { word: 'Sanitization', translation: 'Nettoyage (de données)', category: 'Security', example: 'Input sanitization prevents SQL injection.', exampleTranslation: 'Le nettoyage des entrées empêche les injections SQL.' }
    ],
    grammarTitle: "Passive Voice",
    grammarDesc: "Très utilisé dans la doc technique pour mettre l'accent sur l'action (le système) plutôt que sur la personne (le développeur).",
    grammarSyntax: "Sujet + Be (conjugué) + Participe Passé",
    grammarRules: [
      { title: "1. Focus sur le résultat", example: '"The data is encrypted before transmission."', translation: "Les données sont chiffrées avant la transmission." },
      { title: "2. Action passée (Past Passive)", example: '"The bug was reported by a user."', translation: "Le bug a été signalé par un utilisateur." },
      { title: "3. Avec un modal", example: '"Passwords must be hashed."', translation: "Les mots de passe doivent être hachés." }
    ]
  },
  5: {
    title: "Databases & State Management",
    vocab: [
      { word: 'Schema', translation: 'Schéma', category: 'Database', example: 'We need to update the database schema for the new table.', exampleTranslation: 'Nous devons mettre à jour le schéma de la base de données pour la nouvelle table.' },
      { word: 'Query', translation: 'Requête', category: 'Database', example: 'This SQL query is too slow and needs optimization.', exampleTranslation: 'Cette requête SQL est trop lente et a besoin d\'optimisation.' },
      { word: 'Indexing', translation: 'Indexation', category: 'Database', example: 'Adding an index significantly sped up the search.', exampleTranslation: 'L\'ajout d\'un index a considérablement accéléré la recherche.' },
      { word: 'Normalization', translation: 'Normalisation', category: 'Database', example: 'Database normalization reduces data redundancy.', exampleTranslation: 'La normalisation de la base de données réduit la redondance des données.' },
      { word: 'Redundancy', translation: 'Redondance', category: 'Architecture', example: 'We added server redundancy for high availability.', exampleTranslation: 'Nous avons ajouté une redondance des serveurs pour une haute disponibilité.' },
      { word: 'To fetch', translation: 'Récupérer', category: 'API', example: 'We fetch the user profile from the backend on load.', exampleTranslation: 'Nous récupérons le profil de l\'utilisateur depuis le backend au chargement.' },
      { word: 'State', translation: 'État', category: 'Frontend', example: 'React uses a virtual DOM to manage application state.', exampleTranslation: 'React utilise un DOM virtuel pour gérer l\'état de l\'application.' },
      { word: 'Immutable', translation: 'Immuable', category: 'Coding', example: 'State should always be treated as immutable.', exampleTranslation: 'L\'état doit toujours être traité comme immuable.' },
      { word: 'To mutate', translation: 'Muter / Modifier', category: 'Coding', example: 'Do not mutate the array directly, create a copy.', exampleTranslation: 'Ne modifiez pas le tableau directement, créez une copie.' },
      { word: 'Deadlock', translation: 'Interblocage', category: 'Database', example: 'Two transactions caused a deadlock in the database.', exampleTranslation: 'Deux transactions ont causé un interblocage dans la base de données.' },
      { word: 'Transaction', translation: 'Transaction', category: 'Database', example: 'Wrap those SQL statements in a single transaction.', exampleTranslation: 'Enveloppez ces instructions SQL dans une seule transaction.' },
      { word: 'Replication', translation: 'Réplication', category: 'Database', example: 'Database replication ensures our data is backed up.', exampleTranslation: 'La réplication de la base de données garantit que nos données sont sauvegardées.' },
      { word: 'Cache hit', translation: 'Succès de cache', category: 'Performance', example: 'A high cache hit ratio means our caching is effective.', exampleTranslation: 'Un ratio de succès de cache élevé signifie que notre mise en cache est efficace.' },
      { word: 'Primary key', translation: 'Clé primaire', category: 'Database', example: 'The email address is used as the primary key.', exampleTranslation: 'L\'adresse e-mail est utilisée comme clé primaire.' },
      { word: 'Props', translation: 'Propriétés (React)', category: 'Frontend', example: 'Pass the data down to child components via props.', exampleTranslation: 'Passez les données aux composants enfants via les propriétés.' }
    ],
    grammarTitle: "Relative Clauses",
    grammarDesc: "Indispensables pour décrire le fonctionnement de fonctions, de classes ou de composants.",
    grammarSyntax: "Who (personnes), Which/That (choses), Where (lieux)",
    grammarRules: [
      { title: "1. That / Which (Les choses)", example: '"The function that handles authentication is broken."', translation: "La fonction qui gère l'authentification est cassée." },
      { title: "2. Who (Les personnes)", example: '"The developer who wrote this left the company."', translation: "Le développeur qui a écrit cela a quitté l'entreprise." },
      { title: "3. Where (Le code/lieu)", example: '"This is the file where the bug occurs."', translation: "C'est le fichier où le bug se produit." }
    ]
  },
  6: {
    title: "Cloud & DevOps",
    vocab: [
      { word: 'Container', translation: 'Conteneur', category: 'DevOps', example: 'Docker makes it easy to run apps in a container.', exampleTranslation: 'Docker facilite l\'exécution d\'applications dans un conteneur.' },
      { word: 'Orchestration', translation: 'Orchestration', category: 'DevOps', example: 'Kubernetes handles container orchestration.', exampleTranslation: 'Kubernetes gère l\'orchestration des conteneurs.' },
      { word: 'Pipeline', translation: 'Pipeline', category: 'DevOps', example: 'The CI/CD pipeline deploys the app automatically.', exampleTranslation: 'Le pipeline CI/CD déploie l\'application automatiquement.' },
      { word: 'Provisioning', translation: 'Approvisionnement', category: 'DevOps', example: 'Terraform is used for infrastructure provisioning.', exampleTranslation: 'Terraform est utilisé pour l\'approvisionnement de l\'infrastructure.' },
      { word: 'Autoscaling', translation: 'Mise à l\'échelle automatique', category: 'Cloud', example: 'Autoscaling adds more servers during peak hours.', exampleTranslation: 'La mise à l\'échelle automatique ajoute plus de serveurs pendant les heures de pointe.' },
      { word: 'Downtime', translation: 'Temps d\'arrêt', category: 'Operations', example: 'We scheduled the maintenance to minimize downtime.', exampleTranslation: 'Nous avons planifié la maintenance pour minimiser le temps d\'arrêt.' },
      { word: 'Uptime', translation: 'Temps de disponibilité', category: 'Operations', example: 'Our service has an uptime of 99.99%.', exampleTranslation: 'Notre service a un temps de disponibilité de 99,99 %.' },
      { word: 'To scale up', translation: 'Augmenter la capacité', category: 'Cloud', example: 'We need to scale up the database instance.', exampleTranslation: 'Nous devons augmenter la capacité de l\'instance de base de données.' },
      { word: 'Serverless', translation: 'Sans serveur', category: 'Architecture', example: 'AWS Lambda allows us to run serverless functions.', exampleTranslation: 'AWS Lambda nous permet d\'exécuter des fonctions sans serveur.' },
      { word: 'Instance', translation: 'Instance', category: 'Cloud', example: 'The EC2 instance ran out of memory.', exampleTranslation: 'L\'instance EC2 a manqué de mémoire.' },
      { word: 'Artifact', translation: 'Artéfact', category: 'DevOps', example: 'The build artifact is pushed to the registry.', exampleTranslation: 'L\'artéfact de build est poussé vers le registre.' },
      { word: 'Telemetry', translation: 'Télémétrie', category: 'Monitoring', example: 'We collect telemetry data to monitor app health.', exampleTranslation: 'Nous collectons des données de télémétrie pour surveiller la santé de l\'application.' },
      { word: 'To trigger', translation: 'Déclencher', category: 'DevOps', example: 'Pushing to main will trigger a new build.', exampleTranslation: 'Un push sur main déclenchera un nouveau build.' },
      { word: 'Environment', translation: 'Environnement', category: 'DevOps', example: 'The bug is only reproducible in the staging environment.', exampleTranslation: 'Le bug n\'est reproductible que dans l\'environnement de pré-production (staging).' },
      { word: 'Cluster', translation: 'Grappe (Cluster)', category: 'Cloud', example: 'Our database cluster consists of three nodes.', exampleTranslation: 'Notre grappe de bases de données est composée de trois nœuds.' }
    ],
    grammarTitle: "Modals of Probability",
    grammarDesc: "Très utiles lors du débogage ou d'une panne pour exprimer des hypothèses sur la source d'un problème.",
    grammarSyntax: "Must (Sûr), Might/May/Could (Possible), Can't (Impossible)",
    grammarRules: [
      { title: "1. Must (Très probable)", example: '"The server must be down."', translation: "Le serveur doit être en panne." },
      { title: "2. Might / Could (Possibilité)", example: '"It might be a network issue."', translation: "Cela pourrait être un problème de réseau." },
      { title: "3. Can't (Impossibilité logique)", example: '"It can\'t be the frontend, I checked."', translation: "Ce ne peut pas être le front-end, j'ai vérifié." }
    ]
  },
  7: {
    title: "Soft Skills & Tech Meetings",
    vocab: [
      { word: 'Alignment', translation: 'Alignement', category: 'Management', example: 'We need alignment between tech and business teams.', exampleTranslation: 'Nous avons besoin d\'alignement entre les équipes techniques et commerciales.' },
      { word: 'To brainstorm', translation: 'Faire un remue-méninges', category: 'Teamwork', example: 'Let\'s brainstorm some ideas for the new architecture.', exampleTranslation: 'Faisons un remue-méninges pour trouver des idées pour la nouvelle architecture.' },
      { word: 'To iterate', translation: 'Itérer', category: 'Agile', example: 'We will build a simple MVP and then iterate on it.', exampleTranslation: 'Nous allons construire un MVP simple puis itérer dessus.' },
      { word: 'Stakeholder', translation: 'Partie prenante', category: 'Management', example: 'The stakeholders want this feature next month.', exampleTranslation: 'Les parties prenantes veulent cette fonctionnalité le mois prochain.' },
      { word: 'Trade-off', translation: 'Compromis', category: 'Engineering', example: 'Choosing NoSQL over SQL is a performance trade-off.', exampleTranslation: 'Choisir NoSQL plutôt que SQL est un compromis sur les performances.' },
      { word: 'Roadmap', translation: 'Feuille de route', category: 'Management', example: 'This feature is on our product roadmap for Q3.', exampleTranslation: 'Cette fonctionnalité est sur notre feuille de route produit pour le T3.' },
      { word: 'Backlog', translation: 'Carnet de commandes (Backlog)', category: 'Agile', example: 'Add that low-priority bug to the backlog.', exampleTranslation: 'Ajoutez ce bug de faible priorité au carnet de commandes.' },
      { word: 'To estimate', translation: 'Estimer', category: 'Agile', example: 'How many story points do you estimate for this task?', exampleTranslation: 'À combien de points d\'effort estimez-vous cette tâche ?' },
      { word: 'Milestone', translation: 'Jalon', category: 'Project', example: 'Releasing the beta version was a huge milestone.', exampleTranslation: 'Publier la version bêta était un énorme jalon.' },
      { word: 'To push back', translation: 'Repousser / S\'opposer', category: 'Management', example: 'We had to push back the release date due to critical bugs.', exampleTranslation: 'Nous avons dû repousser la date de sortie à cause de bugs critiques.' },
      { word: 'To wrap up', translation: 'Conclure', category: 'Teamwork', example: 'Let\'s wrap up the meeting, we are out of time.', exampleTranslation: 'Concluons la réunion, nous n\'avons plus de temps.' },
      { word: 'Consensus', translation: 'Consensus', category: 'Teamwork', example: 'The team reached a consensus on the coding standards.', exampleTranslation: 'L\'équipe est parvenue à un consensus sur les normes de codage.' },
      { word: 'Deliverable', translation: 'Livrable', category: 'Project', example: 'The API documentation is a key deliverable for this sprint.', exampleTranslation: 'La documentation de l\'API est un livrable clé pour ce sprint.' },
      { word: 'Proof of Concept', translation: 'Preuve de concept (PoC)', category: 'Engineering', example: 'I built a small Proof of Concept to test the library.', exampleTranslation: 'J\'ai construit une petite preuve de concept pour tester la bibliothèque.' },
      { word: 'To scope out', translation: 'Définir la portée', category: 'Project', example: 'We need to scope out the requirements before coding.', exampleTranslation: 'Nous devons définir la portée des exigences avant de coder.' }
    ],
    grammarTitle: "Gerunds vs Infinitives",
    grammarDesc: "Savoir utiliser le verbe en -ing ou en to+Verbe, fréquent dans les instructions et suggestions.",
    grammarSyntax: "Certains verbes sont suivis de l'infinitif, d'autres du gérondif (-ing)",
    grammarRules: [
      { title: "1. Gerund après suggestions/risques", example: '"I suggest testing the API first."', translation: "Je suggère de tester l'API en premier." },
      { title: "2. Infinitive pour un but/besoin", example: '"We need to test the API."', translation: "Nous devons tester l'API." },
      { title: "3. Après une préposition", example: '"Before deploying, run the tests."', translation: "Avant de déployer, exécutez les tests." }
    ]
  }
};

export const dialogues = [
  {
    title: "1. Daily Stand-up Meeting",
    situation: "Monday morning, the team is doing a quick online stand-up meeting.",
    context: "Mark is the project manager. Sara and Tom are web developers. They use Zoom every morning for 15 minutes.",
    lines: [
      { speaker: "Mark (PM)", text: "Good morning everyone! Let's get started. Sara, can you tell us what you worked on last week?", translation: "Bonjour tout le monde ! Commençons. Sara, peux-tu nous dire sur quoi tu as travaillé la semaine dernière ?" },
      { speaker: "Sara (Dev)", text: "Sure. I've been working on the login page. I finished the design, but I'm still having trouble with the API connection.", translation: "Bien sûr. J'ai travaillé sur la page de connexion. J'ai terminé le design, mais j'ai encore des problèmes avec la connexion à l'API." },
      { speaker: "Mark (PM)", text: "Okay. How long do you think it will take to fix that?", translation: "D'accord. Combien de temps penses-tu qu'il faudra pour corriger cela ?" },
      { speaker: "Sara (Dev)", text: "Probably about two days, if I can get some help from Tom.", translation: "Probablement environ deux jours, si je peux obtenir l'aide de Tom." },
      { speaker: "Tom (Dev)", text: "No problem. I can help you with that this afternoon. I just need to finish the dashboard first.", translation: "Pas de problème. Je peux t'aider avec ça cet après-midi. Je dois juste finir le tableau de bord en premier." },
      { speaker: "Mark (PM)", text: "Great. Let's make sure the API issue is resolved by Wednesday. Any blockers I should know about?", translation: "Super. Assurons-nous que le problème d'API soit résolu d'ici mercredi. Y a-t-il des blocages que je devrais connaître ?" },
      { speaker: "Tom (Dev)", text: "Actually, yes. I'm waiting for the design files from the client. I sent them an email yesterday but haven't heard back.", translation: "En fait, oui. J'attends les fichiers de design du client. Je leur ai envoyé un email hier mais je n'ai pas eu de réponse." },
      { speaker: "Mark (PM)", text: "I'll follow up with them today. Thanks everyone — good work!", translation: "Je vais les relancer aujourd'hui. Merci tout le monde — bon travail !" }
    ],
    keyExpressions: [
      { expression: "I've been working on...", translation: "J'ai travaillé sur...", explanation: "Present perfect continuous — ongoing task" },
      { expression: "I'm still having trouble with...", translation: "J'ai encore des problèmes avec...", explanation: "Expressing a current difficulty" },
      { expression: "Probably about... days", translation: "Probablement environ... jours", explanation: "Estimating time — very useful in IT" },
      { expression: "I'm waiting for...", translation: "J'attends...", explanation: "Describing a dependency or blocker" },
      { expression: "I'll follow up with...", translation: "Je vais relancer...", explanation: "Promising an action — future simple" },
      { expression: "Let's make sure...", translation: "Assurons-nous que...", explanation: "Giving instructions politely" }
    ],
    languageFocus: {
      title: "Present Perfect Continuous",
      explanation: "Use have/has + been + verb-ing to talk about actions that started in the past and are still continuing now.",
      examples: "'I've been working on the login page.' / 'He has been waiting for the files.'"
    },
    tip: "British Council tip: In tech meetings, avoid saying 'I did nothing' for blockers. Instead, say 'I was blocked by...' or 'I'm waiting for...' — it sounds more professional."
  },
  {
    title: "2. Client Requirements Meeting",
    situation: "A video call with a client to discuss the new website features.",
    context: "Alex is a web developer and project manager. Linda is the client. They are discussing new features for an e-commerce website.",
    lines: [
      { speaker: "Alex (PM/Dev)", text: "Hello Linda! Thanks for joining. Could you explain what kind of changes you'd like for the homepage?", translation: "Bonjour Linda ! Merci de vous joindre à nous. Pourriez-vous m'expliquer quel genre de changements vous aimeriez pour la page d'accueil ?" },
      { speaker: "Linda (Client)", text: "Of course. I was thinking we could add a big banner with our promotions. Also, it would be great if customers could filter products by price.", translation: "Bien sûr. Je pensais que nous pourrions ajouter une grande bannière avec nos promotions. De plus, ce serait super si les clients pouvaient filtrer les produits par prix." },
      { speaker: "Alex (PM/Dev)", text: "That sounds good. Just to confirm — you want a promotional banner at the top and a price filter on the product page, right?", translation: "Cela semble bien. Juste pour confirmer — vous voulez une bannière promotionnelle en haut et un filtre de prix sur la page produit, n'est-ce pas ?" },
      { speaker: "Linda (Client)", text: "Exactly! And if possible, I'd also like to add a live chat feature.", translation: "Exactement ! Et si possible, j'aimerais aussi ajouter une fonctionnalité de chat en direct." },
      { speaker: "Alex (PM/Dev)", text: "A live chat is definitely possible. However, I should mention that it will add about a week to the timeline.", translation: "Un chat en direct est tout à fait possible. Cependant, je devrais mentionner que cela ajoutera environ une semaine au délai." },
      { speaker: "Linda (Client)", text: "That's fine with me. How much extra will it cost?", translation: "Cela me convient. Combien cela coûtera-t-il en plus ?" },
      { speaker: "Alex (PM/Dev)", text: "I'll need to check with the team and send you a quote by tomorrow. Does that work for you?", translation: "Je devrai vérifier avec l'équipe et vous envoyer un devis d'ici demain. Est-ce que cela vous convient ?" },
      { speaker: "Linda (Client)", text: "Perfect. I look forward to hearing from you!", translation: "Parfait. J'attends de vos nouvelles avec impatience !" }
    ],
    keyExpressions: [
      { expression: "I was thinking we could...", translation: "Je pensais que nous pourrions...", explanation: "Suggesting an idea politely (past continuous)" },
      { expression: "It would be great if...", translation: "Ce serait super si...", explanation: "Making a polite request (conditional 2)" },
      { expression: "Just to confirm...", translation: "Juste pour confirmer...", explanation: "Checking understanding — essential in client calls" },
      { expression: "However, I should mention that...", translation: "Cependant, je devrais mentionner que...", explanation: "Introducing a complication diplomatically" },
      { expression: "I'll need to check with the team", translation: "Je devrai vérifier avec l'équipe", explanation: "Deferring — professional and honest" },
      { expression: "I look forward to hearing from you", translation: "J'attends de vos nouvelles avec impatience", explanation: "Formal closing expression" }
    ],
    languageFocus: {
      title: "Conditional type 2 (polite requests)",
      explanation: "Use It would be great/nice/helpful if + past simple to make polite suggestions or requests in a professional context.",
      examples: "'It would be great if you could send us the logo files.' / 'It would be nice if the button were blue.'"
    },
    tip: "British Council tip: Always summarise what the client said ('Just to confirm...') before you agree. This avoids misunderstandings and shows you are listening carefully."
  },
  {
    title: "3. Code Review Feedback",
    situation: "Two developers discuss a pull request during a code review session.",
    context: "Ryan is a senior developer reviewing David's code. They are on a Teams call looking at a shared screen.",
    lines: [
      { speaker: "Ryan (Senior)", text: "Hi David. I've had a look at your pull request. Overall, it looks quite good!", translation: "Salut David. J'ai jeté un coup d'œil à ta pull request. Dans l'ensemble, ça a l'air plutôt bien !" },
      { speaker: "David (Dev)", text: "Thanks! Were there any issues I should fix?", translation: "Merci ! Y a-t-il des problèmes que je devrais corriger ?" },
      { speaker: "Ryan (Senior)", text: "Just a few small things. I noticed that the function on line 45 is a bit long. It might be better to split it into two smaller functions.", translation: "Juste quelques petites choses. J'ai remarqué que la fonction à la ligne 45 est un peu longue. Il serait peut-être préférable de la diviser en deux fonctions plus petites." },
      { speaker: "David (Dev)", text: "I see what you mean. I was trying to keep everything in one place, but you're right — it's harder to read.", translation: "Je vois ce que tu veux dire. J'essayais de tout garder au même endroit, mais tu as raison — c'est plus difficile à lire." },
      { speaker: "Ryan (Senior)", text: "Exactly. Also, have you thought about adding error handling for the API calls? At the moment, if the server is down, the app will crash.", translation: "Exactement. Aussi, as-tu pensé à ajouter une gestion des erreurs pour les appels d'API ? Pour le moment, si le serveur est en panne, l'application va planter." },
      { speaker: "David (Dev)", text: "Good point. I hadn't considered that. I'll add try-catch blocks straight away.", translation: "Bon point. Je n'y avais pas pensé. Je vais ajouter des blocs try-catch tout de suite." },
      { speaker: "Ryan (Senior)", text: "Great. Once you've made those changes, I'll approve the PR. Let me know if you need help.", translation: "Super. Une fois que tu auras fait ces changements, j'approuverai la PR. Fais-moi savoir si tu as besoin d'aide." },
      { speaker: "David (Dev)", text: "Will do. Thanks for the feedback — it's really helpful!", translation: "Je le ferai. Merci pour les retours — c'est vraiment utile !" }
    ],
    keyExpressions: [
      { expression: "I've had a look at...", translation: "J'ai jeté un coup d'œil à...", explanation: "Informal way to say 'I reviewed/examined'" },
      { expression: "It might be better to...", translation: "Il serait peut-être préférable de...", explanation: "Giving suggestions diplomatically" },
      { expression: "I see what you mean", translation: "Je vois ce que tu veux dire", explanation: "Showing you understand — avoids conflict" },
      { expression: "Have you thought about...?", translation: "As-tu pensé à... ?", explanation: "Suggesting an idea as a question" },
      { expression: "At the moment...", translation: "Pour le moment...", explanation: "Referring to the current state" },
      { expression: "Once you've made those changes...", translation: "Une fois que tu auras fait ces changements...", explanation: "Future time clause — very useful in reviews" }
    ],
    languageFocus: {
      title: "Modal verbs for suggestions",
      explanation: "Use might/could/should + base verb to give feedback without sounding aggressive. 'Might' is the softest option.",
      examples: "'It might be better to split this function.' / 'You could use a map() here instead.' / 'You should add error handling.'"
    },
    tip: "British Council tip: In code reviews, always start with something positive before giving criticism. This is called the 'sandwich technique' and makes feedback easier to accept."
  },
  {
    title: "4. Dealing with a Bug",
    situation: "A developer calls the project manager to report a critical bug before launch.",
    context: "Nadia is a front-end developer. James is the project manager. They have a product launch tomorrow.",
    lines: [
      { speaker: "Nadia (Dev)", text: "James, I'm afraid there's a problem. I've just discovered a serious bug in the checkout page.", translation: "James, je crains qu'il n'y ait un problème. Je viens de découvrir un bug grave sur la page de paiement." },
      { speaker: "James (PM)", text: "Oh no. Can you describe what's happening exactly?", translation: "Oh non. Peux-tu décrire exactement ce qui se passe ?" },
      { speaker: "Nadia (Dev)", text: "When users click 'Pay now', the page freezes and they get an error message. It seems to happen only on mobile devices.", translation: "Lorsque les utilisateurs cliquent sur 'Payer maintenant', la page se fige et ils reçoivent un message d'erreur. Cela semble ne se produire que sur les appareils mobiles." },
      { speaker: "James (PM)", text: "How serious is it? Can users still complete their purchase?", translation: "Est-ce grave à quel point ? Les utilisateurs peuvent-ils toujours finaliser leur achat ?" },
      { speaker: "Nadia (Dev)", text: "No, they can't. It's a blocker. I think it might be a JavaScript compatibility issue.", translation: "Non, ils ne peuvent pas. C'est un point bloquant. Je pense que cela pourrait être un problème de compatibilité JavaScript." },
      { speaker: "James (PM)", text: "Right. How long do you need to fix it?", translation: "D'accord. De combien de temps as-tu besoin pour le corriger ?" },
      { speaker: "Nadia (Dev)", text: "I'd say about 3 to 4 hours, as long as I can reproduce it on a test device.", translation: "Je dirais environ 3 à 4 heures, à condition que je puisse le reproduire sur un appareil de test." },
      { speaker: "James (PM)", text: "Okay. Let's push the launch back by half a day. Better to delay than to go live with a broken checkout. Keep me posted.", translation: "D'accord. Repoussons le lancement d'une demi-journée. Il vaut mieux retarder que de mettre en ligne avec un paiement défectueux. Tiens-moi au courant." },
      { speaker: "Nadia (Dev)", text: "Absolutely. I'll send you an update in two hours.", translation: "Absolument. Je t'enverrai une mise à jour dans deux heures." }
    ],
    keyExpressions: [
      { expression: "I'm afraid there's a problem", translation: "Je crains qu'il n'y ait un problème", explanation: "Introducing bad news politely" },
      { expression: "It seems to happen when...", translation: "Cela semble se produire quand...", explanation: "Describing a bug — reporting a pattern" },
      { expression: "It's a blocker", translation: "C'est un point bloquant", explanation: "Tech term: issue that stops progress completely" },
      { expression: "I think it might be...", translation: "Je pense que ça pourrait être...", explanation: "Cautious hypothesis — not 100% certain" },
      { expression: "As long as...", translation: "A condition que...", explanation: "Conditional: 'if this condition is met'" },
      { expression: "Keep me posted", translation: "Tiens-moi au courant", explanation: "'Update me regularly' — informal but professional" }
    ],
    languageFocus: {
      title: "Reporting problems with modal verbs",
      explanation: "Use seem / appear / might be when you are not 100% sure of a cause. This sounds careful and professional, not careless.",
      examples: "'It seems to happen on mobile.' / 'It might be a caching issue.' / 'The problem appears to be in the API.'"
    },
    tip: "British Council tip: When reporting a problem, always bring a solution or a plan. Saying 'I need 4 hours to fix it' immediately makes you sound competent and proactive."
  },
  {
    title: "5. Negotiating a Deadline",
    situation: "The project manager tells the client the deadline needs to change.",
    context: "Chris is the project manager. Ms. Holt is the client. The original deadline was Friday, but the team needs more time.",
    lines: [
      { speaker: "Chris (PM)", text: "Hello Ms. Holt. I'm calling because I need to discuss our delivery timeline with you.", translation: "Bonjour Mme Holt. Je vous appelle car j'ai besoin de discuter de notre calendrier de livraison avec vous." },
      { speaker: "Ms. Holt (Client)", text: "Of course, Chris. Is everything alright?", translation: "Bien sûr, Chris. Est-ce que tout va bien ?" },
      { speaker: "Chris (PM)", text: "We're making good progress, but unfortunately, we've encountered an unexpected issue with the payment gateway integration. It's taking longer than we anticipated.", translation: "Nous progressons bien, mais malheureusement, nous avons rencontré un problème inattendu avec l'intégration de la passerelle de paiement. Cela prend plus de temps que prévu." },
      { speaker: "Ms. Holt (Client)", text: "I see. How much longer are we talking about?", translation: "Je vois. De combien de temps supplémentaire parlons-nous ?" },
      { speaker: "Chris (PM)", text: "We'd like to request an extension of three working days. Instead of Friday, we'd deliver on Wednesday next week.", translation: "Nous aimerions demander une prolongation de trois jours ouvrables. Au lieu de vendredi, nous livrerions mercredi de la semaine prochaine." },
      { speaker: "Ms. Holt (Client)", text: "That's a bit inconvenient. Is there any way to deliver at least part of the project on Friday?", translation: "C'est un peu gênant. Y a-t-il un moyen de livrer au moins une partie du projet vendredi ?" },
      { speaker: "Chris (PM)", text: "That's a great idea. We could deliver the front-end on Friday and the payment system on Wednesday. Would that be acceptable?", translation: "C'est une excellente idée. Nous pourrions livrer le front-end vendredi et le système de paiement mercredi. Est-ce que cela serait acceptable ?" },
      { speaker: "Ms. Holt (Client)", text: "Yes, I think we can work with that. Please make sure there are no more delays after that.", translation: "Oui, je pense que nous pouvons faire avec ça. S'il vous plaît, assurez-vous qu'il n'y aura pas d'autres retards après cela." },
      { speaker: "Chris (PM)", text: "You have my word. I'll send you a revised schedule today. Thank you for your understanding, Ms. Holt.", translation: "Vous avez ma parole. Je vous enverrai un calendrier révisé aujourd'hui. Merci de votre compréhension, Mme Holt." }
    ],
    keyExpressions: [
      { expression: "I'm calling because...", translation: "Je vous appelle car...", explanation: "Clear, direct opening — professional phone/call manner" },
      { expression: "An unexpected issue", translation: "Un problème inattendu", explanation: "Neutral phrase for a problem — not 'a disaster'" },
      { expression: "It's taking longer than anticipated", translation: "Cela prend plus de temps que prévu", explanation: "Diplomatic way to say 'we are late'" },
      { expression: "We'd like to request...", translation: "Nous aimerions demander...", explanation: "Formal and polite request structure" },
      { expression: "Would that be acceptable?", translation: "Est-ce que cela serait acceptable ?", explanation: "Checking agreement — very professional" },
      { expression: "You have my word", translation: "Vous avez ma parole", explanation: "Strong, formal promise — builds trust" }
    ],
    languageFocus: {
      title: "Conditionals and polite structures",
      explanation: "Use We could... / We would be able to... instead of 'We will' when negotiating. It sounds flexible and collaborative, not demanding.",
      examples: "'We could deliver the front-end by Friday.' / 'We would be able to finish by Wednesday if...'"
    },
    tip: "British Council tip: When negotiating a deadline, always offer a compromise before the client asks for one. This shows leadership and keeps the relationship positive."
  }
];

export const discussionExpressions = [
  // Giving opinion (Blue - #3B82F6)
  { id: 1, category: "Giving opinion", color: "#3B82F6", phrase: "In my opinion...", description: "Introduces your personal view clearly.", example: "In my opinion, the new design is much better.", translation: "À mon avis, le nouveau design est bien meilleur." },
  { id: 2, category: "Giving opinion", color: "#3B82F6", phrase: "I think that...", description: "Everyday way to share an opinion.", example: "I think that we should update the homepage first.", translation: "Je pense que nous devrions mettre à jour la page d'accueil en premier." },
  { id: 3, category: "Giving opinion", color: "#3B82F6", phrase: "From my point of view...", description: "More formal — great in meetings.", example: "From my point of view, the deadline is too short.", translation: "De mon point de vue, le délai est trop court." },
  { id: 4, category: "Giving opinion", color: "#3B82F6", phrase: "As far as I'm concerned...", description: "Signals a strong personal stance.", example: "As far as I'm concerned, the client should decide.", translation: "En ce qui me concerne, le client devrait décider." },
  { id: 5, category: "Giving opinion", color: "#3B82F6", phrase: "It seems to me that...", description: "Softer opinion — open to discussion.", example: "It seems to me that the bug is in the API layer.", translation: "Il me semble que le bug se trouve dans la couche API." },
  
  // Agreeing (Green - #22C55E)
  { id: 6, category: "Agreeing", color: "#22C55E", phrase: "I completely agree with you.", description: "Strong agreement — use when 100% on board.", example: "I completely agree with you — we need more testing.", translation: "Je suis tout à fait d'accord avec vous — nous avons besoin de plus de tests." },
  { id: 7, category: "Agreeing", color: "#22C55E", phrase: "That's a good point.", description: "Validates the other person's idea.", example: "That's a good point. I hadn't thought about that.", translation: "C'est un bon point. Je n'y avais pas pensé." },
  { id: 8, category: "Agreeing", color: "#22C55E", phrase: "Exactly! / Absolutely!", description: "Short, enthusiastic agreement.", example: "Absolutely! That's exactly what the client asked for.", translation: "Absolument ! C'est exactement ce que le client a demandé." },
  { id: 9, category: "Agreeing", color: "#22C55E", phrase: "I see what you mean.", description: "Shows you understand — even before agreeing.", example: "I see what you mean. The layout is confusing.", translation: "Je vois ce que tu veux dire. La mise en page est confuse." },
  { id: 10, category: "Agreeing", color: "#22C55E", phrase: "You're right about that.", description: "Concedes a specific point politely.", example: "You're right about that — the font is too small.", translation: "Tu as raison sur ce point — la police est trop petite." },
  
  // Disagreeing (Orange - #EA580C)
  { id: 11, category: "Disagreeing", color: "#EA580C", phrase: "I'm not sure I agree with that.", description: "Polite disagreement — avoids conflict.", example: "I'm not sure I agree — the user flow seems clear to me.", translation: "Je ne suis pas sûr d'être d'accord — le parcours utilisateur me semble clair." },
  { id: 12, category: "Disagreeing", color: "#EA580C", phrase: "Actually, I think...", description: "Introduces a contrasting opinion smoothly.", example: "Actually, I think we should use React, not Vue.", translation: "En fait, je pense que nous devrions utiliser React, pas Vue." },
  { id: 13, category: "Disagreeing", color: "#EA580C", phrase: "I see your point, but...", description: "Acknowledge + disagree — very diplomatic.", example: "I see your point, but the timeline is too tight.", translation: "Je vois ton point de vue, mais le délai est trop serré." },
  { id: 14, category: "Disagreeing", color: "#EA580C", phrase: "That's true, however...", description: "Agrees partially, then redirects.", example: "That's true, however the cost is a big factor.", translation: "C'est vrai, cependant le coût est un facteur important." },
  { id: 15, category: "Disagreeing", color: "#EA580C", phrase: "I'm afraid I don't agree.", description: "Formal, respectful disagreement.", example: "I'm afraid I don't agree with that approach.", translation: "Je crains de ne pas être d'accord avec cette approche." },
  
  // Clarifying (Purple - #8B5CF6)
  { id: 16, category: "Clarifying", color: "#8B5CF6", phrase: "Could you explain what you mean by...?", description: "Asks for clarification on a specific term.", example: "Could you explain what you mean by 'scalable'?", translation: "Pourriez-vous expliquer ce que vous entendez par 'évolutif' ?" },
  { id: 17, category: "Clarifying", color: "#8B5CF6", phrase: "Sorry, I didn't quite catch that.", description: "Asks politely to repeat — natural in calls.", example: "Sorry, I didn't quite catch that — could you repeat?", translation: "Désolé, je n'ai pas bien saisi — pourriez-vous répéter ?" },
  { id: 18, category: "Clarifying", color: "#8B5CF6", phrase: "Do you mean...?", description: "Checks your understanding of their words.", example: "Do you mean we should redesign the whole page?", translation: "Voulez-vous dire que nous devrions refaire toute la page ?" },
  { id: 19, category: "Clarifying", color: "#8B5CF6", phrase: "Just to clarify...", description: "Confirms a point before moving forward.", example: "Just to clarify — the launch date is Friday, right?", translation: "Juste pour clarifier — la date de lancement est vendredi, n'est-ce pas ?" },
  { id: 20, category: "Clarifying", color: "#8B5CF6", phrase: "If I understand correctly...", description: "Rephrases what was said to confirm.", example: "If I understand correctly, you want a dark mode option.", translation: "Si je comprends bien, vous voulez une option de mode sombre." },
  
  // Suggesting (Teal - #10B981)
  { id: 21, category: "Suggesting", color: "#10B981", phrase: "What if we...?", description: "Informal, open suggestion — invites discussion.", example: "What if we split the task between two developers?", translation: "Et si nous divisions la tâche entre deux développeurs ?" },
  { id: 22, category: "Suggesting", color: "#10B981", phrase: "How about + verb-ing...?", description: "Casual suggestion — very common in teams.", example: "How about using Tailwind CSS for the styling?", translation: "Que diriez-vous d'utiliser Tailwind CSS pour le style ?" },
  { id: 23, category: "Suggesting", color: "#10B981", phrase: "It might be a good idea to...", description: "Soft suggestion — not pushy.", example: "It might be a good idea to test on mobile first.", translation: "Ce serait peut-être une bonne idée de tester sur mobile en premier." },
  { id: 24, category: "Suggesting", color: "#10B981", phrase: "Have you thought about...?", description: "Suggests while respecting the other's autonomy.", example: "Have you thought about adding lazy loading?", translation: "Avez-vous pensé à ajouter le chargement différé ?" },
  { id: 25, category: "Suggesting", color: "#10B981", phrase: "Why don't we...?", description: "Collaborative suggestion — includes the team.", example: "Why don't we schedule a demo before the launch?", translation: "Pourquoi ne pas planifier une démo avant le lancement ?" },
  
  // Buying time (Brown - #B45309)
  { id: 26, category: "Buying time", color: "#B45309", phrase: "That's a good question. Let me think...", description: "Buys time to formulate a clear answer.", example: "That's a good question. Let me think for a moment.", translation: "C'est une bonne question. Laissez-moi réfléchir un instant." },
  { id: 27, category: "Buying time", color: "#B45309", phrase: "Let me get back to you on that.", description: "Delays answer when you need more info.", example: "Let me get back to you on that — I need to check.", translation: "Laissez-moi vous revenir là-dessus — je dois vérifier." },
  { id: 28, category: "Buying time", color: "#B45309", phrase: "I'll need to check with the team.", description: "Professional pause — shows responsibility.", example: "I'll need to check with the team before I confirm.", translation: "Je devrai vérifier avec l'équipe avant de confirmer." },
  { id: 29, category: "Buying time", color: "#B45309", phrase: "Can I just finish my point?", description: "Politely holds the floor when interrupted.", example: "Can I just finish my point? Then you can respond.", translation: "Puis-je juste terminer mon idée ? Ensuite vous pourrez répondre." },
  { id: 30, category: "Buying time", color: "#B45309", phrase: "Going back to what I was saying...", description: "Returns to your idea after an interruption.", example: "Going back to what I was saying — the API is the issue.", translation: "Pour revenir à ce que je disais — l'API est le problème." }
];
