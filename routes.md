📦 Routes backend pour Progress2Win
1️⃣ Authentification / Gestion des comptes
Méthode	Endpoint	Description
POST	/auth/register	Créer un compte utilisateur
POST	/auth/login	Connexion avec email/mot de passe
POST	/auth/logout	Déconnexion
POST	/auth/refresh-token	Renouvellement token JWT
POST	/auth/forgot-password	Demande de réinitialisation du mot de passe
POST	/auth/reset-password	Réinitialisation avec token
GET	/auth/me	Récupérer les infos du user connecté