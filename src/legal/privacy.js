// Politique de confidentialite (RGPD)
// REMPLACEZ les placeholders [ENTRE_CROCHETS] avant mise en production.
// Derniere mise a jour : modifiez la constante LAST_UPDATED ci-dessous.

export const PRIVACY_LAST_UPDATED = '[A_REMPLIR_DATE_DE_PUBLICATION]';

export const PRIVACY_POLICY_MARKDOWN = `
# Politique de confidentialité

**Derniere mise a jour : ${'[A_REMPLIR_DATE_DE_PUBLICATION]'}**

La presente politique de confidentialite decrit la maniere dont **[NOM_OU_RAISON_SOCIALE]**
("nous", "notre service") collecte, utilise et protege vos donnees a caractere personnel
lorsque vous utilisez l'application **Fluent** (ci-apres, "le Service").

Nous nous engageons a respecter le Reglement General sur la Protection des Donnees
(RGPD - Reglement UE 2016/679) et la loi Informatique et Libertes.

## 1. Responsable du traitement

- **Responsable de traitement** : [NOM_OU_RAISON_SOCIALE]
- **Adresse** : [ADRESSE_POSTALE]
- **Email de contact RGPD** : [EMAIL_RGPD]
- **Statut juridique** : [STATUT - particulier / auto-entrepreneur / EURL / SAS / etc.]

## 2. Donnees collectees

Nous collectons et traitons les categories de donnees suivantes :

### 2.1 Donnees de compte
- Adresse email (identifiant de connexion)
- Mot de passe (stocke de facon hachee par Supabase, jamais en clair)

### 2.2 Donnees d'apprentissage
- Niveau CEFR evalue (A1 a C2)
- Profil d'onboarding (objectif, role, temps disponible, echeance)
- Progression : jour actuel, jours debloques, scores aux tests
- Historique des simulations d'entretien (questions, reponses, feedback IA)
- Defis quotidiens : reponses, scores, streak

### 2.3 Donnees techniques
- Adresse IP (logs Vercel, conservee 30 jours)
- Type de navigateur, systeme d'exploitation
- Pages visitees, fonctionnalites utilisees

## 3. Finalites et bases legales

| Finalite | Base legale |
|---|---|
| Fournir le service d'apprentissage personnalise | Execution du contrat (art. 6.1.b RGPD) |
| Gerer votre compte et l'authentification | Execution du contrat |
| Generer du contenu pedagogique adapte | Execution du contrat |
| Securite et prevention des abus (rate limiting) | Interet legitime (art. 6.1.f) |
| Respect des obligations legales | Obligation legale (art. 6.1.c) |

## 4. Sous-traitants

Vos donnees sont traitees par les sous-traitants suivants :

| Prestataire | Finalite | Localisation | Garanties |
|---|---|---|---|
| **Supabase Inc.** | Authentification, stockage des donnees | UE (Frankfurt) ou US selon configuration | DPA Supabase, CCT |
| **Vercel Inc.** | Hebergement et execution des fonctions | US/UE | DPA Vercel, CCT |
| **Google LLC (Gemini API)** | Generation de contenu IA | US | DPA Google Cloud, CCT |
| **ElevenLabs Inc.** | Synthese vocale (text-to-speech) | US | CCT |
| **Upstash Inc.** | Rate limiting (compteurs ephemeres) | UE/US | CCT |

**Important** : lorsque vous interagissez avec l'AI Coach ou les simulations d'entretien,
le contenu de vos messages est transmis a Google Gemini pour generer une reponse.
Ne saisissez **jamais** d'informations confidentielles (mots de passe, donnees
financieres, donnees medicales, secrets professionnels) dans ces interactions.

## 5. Duree de conservation

- **Donnees de compte** : tant que votre compte est actif, puis supprimees sous 30 jours apres demande
- **Donnees d'apprentissage** : tant que votre compte est actif
- **Logs techniques** : 30 jours
- **Compteurs de rate limiting** : 24h maximum

## 6. Vos droits

Conformement au RGPD, vous disposez des droits suivants :

- **Acces** : obtenir une copie de vos donnees
- **Rectification** : corriger des donnees inexactes
- **Effacement** ("droit a l'oubli") : suppression de votre compte et de vos donnees
- **Limitation** du traitement
- **Portabilite** : recevoir vos donnees dans un format structure (JSON)
- **Opposition** au traitement
- **Retrait du consentement** a tout moment

Pour exercer ces droits, contactez-nous a : **[EMAIL_RGPD]**.
Reponse sous 30 jours maximum.

Vous avez egalement le droit d'introduire une reclamation aupres de la **CNIL**
(www.cnil.fr) si vous estimez que vos droits ne sont pas respectes.

## 7. Securite

Nous mettons en oeuvre les mesures techniques et organisationnelles suivantes :
- Chiffrement TLS pour toutes les communications
- Mots de passe haches (bcrypt via Supabase)
- Politiques Row Level Security (RLS) en base : un utilisateur ne peut acceder qu'a ses propres donnees
- Authentification JWT pour les endpoints API
- Rate limiting pour prevenir les abus
- Acces aux donnees limite aux personnes autorisees

## 8. Cookies et stockage local

Le Service utilise :
- **Cookies de session** (Supabase Auth) - necessaires au fonctionnement, exempts de consentement
- **localStorage** pour conserver votre session de connexion

Aucun cookie de tracking publicitaire ou analytique tiers n'est utilise par defaut.

## 9. Transferts hors UE

Certains sous-traitants (Google, Vercel selon configuration) traitent les donnees
aux Etats-Unis. Ces transferts sont encadres par les **Clauses Contractuelles Types**
(CCT) approuvees par la Commission europeenne.

## 10. Modifications

Cette politique peut etre modifiee. Les modifications substantielles vous seront
notifiees par email et/ou via une banniere dans l'application.

## 11. Contact

Pour toute question : **[EMAIL_RGPD]**
`;
