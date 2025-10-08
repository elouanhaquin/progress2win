# Audit de Sécurité v2 - Progress2Win Application

**Date de l'audit:** 2025-10-08
**Auditeur:** Claude Code
**Version:** Après corrections CRIT-002 à CRIT-006

---

## Résumé Exécutif

Suite aux corrections appliquées, **5 vulnérabilités critiques ont été corrigées** avec succès.

**Statut actuel:**
- ✅ **CRIT-002 à CRIT-006:** Corrigées
- 🔴 **1 vulnérabilité CRITIQUE nouvelle** découverte
- 🟠 **6 vulnérabilités MAJEURES** restantes
- 🟡 **8 vulnérabilités MOYENNES** restantes

**Niveau de risque global: ÉLEVÉ** (à cause du bug SQL critique et des vulnérabilités majeures)

---

## ✅ Vulnérabilités Corrigées

### CRIT-002: Injection SQL ✅ CORRIGÉ
- Tous les placeholders `$${paramCount++}` remplacés par `?`
- Fichiers: `compare.ts`, `groups.ts`, `progress.ts`

### CRIT-003: IDOR sur profils utilisateurs ✅ CORRIGÉ
- Protection ajoutée: profil complet uniquement pour soi-même
- Autres profils: données publiques uniquement
- Fichier: `users.ts:9-42`

### CRIT-004: Rate Limiting insuffisant ✅ CORRIGÉ
- Login: 5 tentatives / 15 minutes
- Forgot password: 3 tentatives / 1 heure
- Register: 3 comptes / 24 heures
- Fichier: `index.ts:47-90`

### CRIT-005: Rotation des refresh tokens ✅ CORRIGÉ
- Suppression immédiate de l'ancien token lors du refresh
- Nettoyage automatique des tokens expirés
- Limite de 5 tokens actifs par utilisateur
- Fichiers: `auth.ts:90-109, 158-224`

### CRIT-006: XSS dans emails ✅ CORRIGÉ
- Échappement HTML de tout contenu utilisateur
- Utilisation de `html-escaper`
- Fichiers: `feedback.ts:4,11-13,93,100`, `email.ts:3,61,109,145`

---

## 🔴 Vulnérabilité CRITIQUE Nouvelle

### ❌ CRIT-NEW-001: Bug SQL dans vérification d'amitié

**Sévérité:** CRITIQUE
**CWE:** CWE-89 (SQL Injection / Logic Error)
**Localisation:** `backend/src/routes/compare.ts:107-110`

**Description:**
Requête SQL avec 4 placeholders `?` mais seulement 2 paramètres fournis. Cela cause une erreur et permet potentiellement de contourner la vérification.

```typescript
// Code actuel BUGUÉ:
const existingFriendship = await query(
  'SELECT * FROM user_friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
  [req.userId, friendId]  // ⚠️ Seulement 2 paramètres au lieu de 4!
);
```

**Impact:**
- L'application crashe ou retourne des résultats incorrects
- Possible bypass de la vérification d'amitié existante
- Création de doublons d'invitations

**Exploitation:**
```bash
# Envoyer plusieurs invitations au même ami
POST /api/compare/invite
{
  "friendEmail": "victim@example.com"
}
# Crée plusieurs invitations car la vérification échoue
```

**Solution:**
```typescript
const existingFriendship = await query(
  'SELECT * FROM user_friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
  [req.userId, friendId, friendId, req.userId]  // ✅ 4 paramètres
);
```

---

## 🟠 Vulnérabilités Majeures Restantes

### MAJ-001: Politique de mots de passe faible

**Sévérité:** MAJEURE
**CWE:** CWE-521 (Weak Password Requirements)
**Localisation:** `backend/src/routes/auth.ts:22-53, 327`

**Description:**
Aucune validation de force de mot de passe:
- Register: aucune vérification (peut être "123")
- Change password: seulement 6 caractères minimum
- Pas de complexité requise
- Pas de blacklist

```typescript
// Register - ligne 26-28
if (!email || !password || !firstName || !lastName) {
  return res.status(400).json({ error: 'All fields are required' });
}
// ⚠️ password peut être "a" ou "123"

// Change password - ligne 327
if (newPassword.length < 6) {
  return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
}
// ⚠️ "aaaaaa" est accepté
```

**Recommandation:**
Implémenter validation stricte avec `zxcvbn` ou similaire (voir exploit.md MAJ-001).

---

### MAJ-002: Énumération d'utilisateurs (toujours présente)

**Sévérité:** MAJEURE
**CWE:** CWE-204 (Observable Response Discrepancy)
**Localisation:** `backend/src/routes/auth.ts:31-34`, `compare.ts:96-98`

**Description:**
Plusieurs endpoints révèlent l'existence d'emails:

```typescript
// Register - ligne 31-34
const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
if (existingUser.rows.length > 0) {
  return res.status(409).json({ error: 'Email already registered' }); // ⚠️
}

// Invite friend - ligne 96-98
if (friendResult.rows.length === 0) {
  return res.status(404).json({ error: 'User not found' }); // ⚠️
}
```

**Impact:**
- Énumération complète de la base d'emails
- Cible pour phishing
- Violation RGPD

**Recommandation:**
Retourner des messages génériques + timing constant (voir exploit.md MAJ-002).

---

### MAJ-NEW-001: Exposition d'emails dans le leaderboard

**Sévérité:** MAJEURE
**CWE:** CWE-359 (Exposure of Private Information)
**Localisation:** `backend/src/routes/compare.ts:139-187`

**Description:**
Le leaderboard expose les emails de TOUS les utilisateurs actifs:

```typescript
// Ligne 139-142
let leaderboardQuery = `
  SELECT
    u.id, u.email, u.first_name, u.last_name, u.avatar_url,  // ⚠️ email exposé
    COUNT(p.id) as total_entries,
    SUM(p.value) as total_progress
  FROM users u
  ...
`;

// Ligne 175-182
const leaderboard = result.rows.map((row, index) => ({
  user: {
    id: row.id,
    email: row.email,  // ⚠️ Retourné dans la réponse
    first_name: row.first_name,
    ...
  },
  ...
}));
```

**Impact:**
- Tous les emails de l'application sont accessibles
- Violation RGPD majeure
- Source pour spam/phishing

**Exploitation:**
```bash
GET /api/compare/leaderboard?limit=1000
# Récupère jusqu'à 1000 emails d'utilisateurs
```

**Solution:**
```typescript
// NE PAS inclure email dans le SELECT
let leaderboardQuery = `
  SELECT
    u.id, u.first_name, u.last_name, u.avatar_url,  // ✅ Sans email
    COUNT(p.id) as total_entries,
    SUM(p.value) as total_progress
  FROM users u
  ...
`;
```

---

### MAJ-NEW-002: Exposition d'emails dans compare

**Sévérité:** MAJEURE
**CWE:** CWE-359 (Exposure of Private Information)
**Localisation:** `backend/src/routes/compare.ts:54-61`

**Description:**
L'endpoint de comparaison expose les emails des deux utilisateurs:

```typescript
// Ligne 54-57
const usersResult = await query(
  'SELECT id, email, first_name, last_name, avatar_url FROM users WHERE id IN (?, ?)',  // ⚠️ email
  [req.userId, friendId]
);
```

**Impact:**
- Email de l'ami révélé même s'il ne devrait pas l'être
- Peut être utilisé pour énumérer des emails via des invitations

**Solution:**
```typescript
// Option 1: Ne pas inclure email
const usersResult = await query(
  'SELECT id, first_name, last_name, avatar_url FROM users WHERE id IN (?, ?)',
  [req.userId, friendId]
);

// Option 2: Email uniquement pour soi-même
// Faire 2 requêtes séparées avec conditions différentes
```

---

### MAJ-003: Manque de vérification d'email

**Sévérité:** MAJEURE
**Statut:** Non implémenté
**Description:** Voir exploit.md MAJ-003

---

### MAJ-004: Pas de protection CSRF

**Sévérité:** MAJEURE
**Statut:** Non implémenté
**Description:** Voir exploit.md MAJ-004

---

### MAJ-005: Exposition d'informations dans les erreurs

**Sévérité:** MAJEURE
**Statut:** Non corrigé
**Description:** Voir exploit.md MAJ-005

---

## 🟡 Vulnérabilités Moyennes Restantes

### MOY-001: parseInt sans validation NaN

**Sévérité:** MOYENNE
**CWE:** CWE-20 (Improper Input Validation)
**Localisation:** Multiples fichiers

**Description:**
`parseInt()` est utilisé sans vérifier `NaN`:

```typescript
// users.ts:11
const userId = parseInt(req.params.userId);
// Si userId = "abc", userId = NaN
// Puis: WHERE id = ? avec [NaN] → requête échoue silencieusement

// compare.ts:10
const friendId = parseInt(req.params.friendId);

// groups.ts:155, 199, 256
const groupId = parseInt(req.params.groupId);

// progress.ts:72, 92, 160
const progressId = parseInt(req.params.progressId);
```

**Impact:**
- Comportement imprévisible
- Erreurs 404 au lieu de 400
- Possible DoS via requêtes invalides répétées

**Solution:**
```typescript
const userId = parseInt(req.params.userId);
if (isNaN(userId)) {
  return res.status(400).json({ error: 'Invalid user ID' });
}
```

---

### MOY-002: Timing attack sur forgot-password

**Sévérité:** MOYENNE
**CWE:** CWE-208 (Observable Timing Discrepancy)
**Localisation:** `backend/src/routes/auth.ts:240-243`

**Description:**
Si l'email n'existe pas, la réponse est immédiate. Si l'email existe, il y a:
- Génération de mot de passe temporaire
- Hashing bcrypt (~100ms)
- Envoi d'email (~500-2000ms)

```typescript
// Ligne 240-242
if (userResult.rows.length === 0) {
  return res.json({ message: 'Si cet email existe, un mot de passe temporaire a été envoyé' });
  // ⚠️ Réponse instantanée
}

// Ligne 245-271
// ... génération + hashing + envoi email (1-3 secondes)
res.json({ message: 'Si cet email existe, un mot de passe temporaire a été envoyé' });
// ⚠️ Réponse après 1-3 secondes
```

**Impact:**
- Énumération d'emails via analyse du timing
- Un attaquant peut mesurer le temps de réponse

**Solution:**
```typescript
if (userResult.rows.length === 0) {
  // Simuler le même délai
  await new Promise(resolve => setTimeout(resolve, 2000));
  return res.json({ message: 'Si cet email existe, un mot de passe temporaire a été envoyé' });
}
```

---

### MOY-003: Codes de groupe vulnérables au brute force

**Sévérité:** MOYENNE
**CWE:** CWE-330 (Use of Insufficiently Random Values)
**Localisation:** `backend/src/routes/groups.ts:8-14`

**Description:**
Codes de 6 caractères seulement (32^6 = ~1 milliard):

```typescript
const generateGroupCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 caractères
  let code = '';
  for (let i = 0; i < 6; i++) {  // ⚠️ Seulement 6 caractères
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
```

**Recommandation:**
- Augmenter à 10 caractères (32^10 = ~1.2 * 10^15)
- Ajouter rate limiting strict sur `/groups/join`

---

### MOY-004: Credentials hardcodés

**Sévérité:** MOYENNE
**Localisation:** `feedback.ts:17`, `email.ts:12`, `feedback.ts:129`

**Description:**
```typescript
// feedback.ts:17 et email.ts:12
const MAILGUN_DOMAIN = 'sandboxe620164f1e9441808823e31cf44f06ca.mailgun.org';

// feedback.ts:129
to: ['haquinelouan@gmail.com'],
```

**Solution:**
```typescript
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;
const FEEDBACK_EMAIL = process.env.FEEDBACK_EMAIL;

if (!MAILGUN_DOMAIN || !FEEDBACK_EMAIL) {
  throw new Error('MAILGUN_DOMAIN and FEEDBACK_EMAIL must be set');
}
```

---

### MOY-005: Pas de limite sur taille des requêtes

**Sévérité:** MOYENNE
**Localisation:** `backend/src/index.ts:73-74`

**Description:**
```typescript
app.use(express.json());  // ⚠️ Pas de limite
app.use(express.urlencoded({ extended: true }));  // ⚠️ Pas de limite
```

**Solution:**
```typescript
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ limit: '100kb', extended: true }));
```

---

### MOY-006: CORS trop permissif

**Sévérité:** MOYENNE
**Description:** Voir exploit.md MOY-001

---

### MOY-007: Absence de logging

**Sévérité:** MOYENNE
**Description:** Voir exploit.md MOY-002

---

### MOY-008: Absence de CSP

**Sévérité:** MOYENNE
**Description:** Voir exploit.md MOY-006

---

## Priorisation des Correctifs

### Phase 1 - URGENT (< 24h)
1. ❌ **CRIT-NEW-001:** Corriger la requête SQL d'amitié (4 paramètres)
2. ❌ **MAJ-NEW-001:** Retirer email du leaderboard
3. ❌ **MAJ-NEW-002:** Retirer email du compare
4. ❌ **MOY-001:** Valider parseInt() avec isNaN()

### Phase 2 - HAUTE PRIORITÉ (1 semaine)
1. ❌ **MAJ-001:** Validation stricte des mots de passe
2. ❌ **MAJ-002:** Masquer énumération d'utilisateurs
3. ❌ **MOY-002:** Ajouter délai fixe sur forgot-password
4. ❌ **MOY-004:** Déplacer credentials en env vars
5. ❌ **MOY-005:** Limiter taille des requêtes

### Phase 3 - MOYENNE PRIORITÉ (2-4 semaines)
1. ❌ **MAJ-003:** Implémenter vérification d'email
2. ❌ **MAJ-004:** Protection CSRF
3. ❌ **MAJ-005:** Améliorer gestion des erreurs
4. ❌ **MOY-003:** Augmenter codes de groupe à 10 caractères
5. ❌ **MOY-007:** Implémenter logging structuré

### Phase 4 - AMÉLIO RATIONS (1-2 mois)
1. ❌ **MOY-006:** Durcir CORS
2. ❌ **MOY-008:** Implémenter CSP

---

## Statistiques

### Avant corrections:
- 🔴 Critiques: 6
- 🟠 Majeures: 6
- 🟡 Moyennes: 8
- **Total: 20 vulnérabilités**

### Après corrections (actuel):
- 🔴 Critiques: 1 (nouvelle)
- 🟠 Majeures: 6 (dont 2 nouvelles)
- 🟡 Moyennes: 8
- **Total: 15 vulnérabilités**

### Progrès:
- ✅ **5 vulnérabilités critiques corrigées**
- ❌ **1 vulnérabilité critique introduite (bug)**
- ❌ **2 vulnérabilités majeures découvertes**

---

## Conclusion

**Bon travail sur les corrections initiales !** Les 5 vulnérabilités critiques (CRIT-002 à CRIT-006) ont été correctement corrigées.

**MAIS:** Un bug critique SQL a été découvert et 2 vulnérabilités majeures d'exposition d'emails doivent être corrigées immédiatement.

**Prochaines étapes immédiates:**
1. Corriger le bug SQL dans compare.ts (4 paramètres au lieu de 2)
2. Retirer les emails du leaderboard et du compare
3. Ajouter validation isNaN() sur tous les parseInt()

**Recommandation:** Ne PAS déployer en production sans ces 4 corrections urgentes.

---

**Document confidentiel - À usage interne uniquement**
