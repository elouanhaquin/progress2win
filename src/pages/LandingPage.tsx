import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Target,
  TrendingUp,
  Users,
  Trophy,
  BarChart3,
  Zap,
  CheckCircle2,
  Dumbbell,
  Scale,
  Activity
} from 'lucide-react';
import { Button } from '../components/UI';

/**
 * Page d'accueil - Progress2Win
 *
 * Application de suivi de progression fitness permettant de :
 * - Suivre votre perte de poids
 * - Enregistrer vos exercices (tractions, pompes, squats, etc.)
 * - Définir et atteindre des objectifs
 * - Comparer vos performances avec des amis
 * - Participer à des classements compétitifs
 */
export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white border-b-4 border-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-500 border-2 border-black shadow-neo-sm flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black text-black">Progress2Win</h1>
            </div>
            <div className="flex gap-3">
              <Link to="/login">
                <Button variant="neutral" size="md">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="md">
                  Inscription Gratuite
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary-100 to-accent-100 border-b-4 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-6xl font-black text-black leading-tight">
                Suivez vos progrès fitness et
                <span className="text-primary-600"> atteignez vos objectifs</span>
              </h2>
              <p className="text-xl text-neutral-700 leading-relaxed">
                Progress2Win est l'application ultime pour suivre votre perte de poids,
                enregistrer vos performances sportives (tractions, pompes, squats) et
                rester motivé grâce à la compétition amicale.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="xl"
                    icon={<ArrowRight className="w-5 h-5" />}
                    iconPosition="right"
                  >
                    Commencer Gratuitement
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="neutral" size="xl">
                    Se Connecter
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm font-bold text-neutral-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success-600" />
                  Gratuit
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success-600" />
                  Sans engagement
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success-600" />
                  Données privées
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white border-4 border-black shadow-neo-xl p-8 transform rotate-2">
                <div className="space-y-4">
                  <StatCard
                    icon={<Scale className="w-8 h-8" />}
                    label="Poids perdu"
                    value="-12.5 kg"
                    color="bg-success-500"
                  />
                  <StatCard
                    icon={<Activity className="w-8 h-8" />}
                    label="Tractions"
                    value="25 reps"
                    color="bg-primary-500"
                  />
                  <StatCard
                    icon={<TrendingUp className="w-8 h-8" />}
                    label="Progression"
                    value="+45%"
                    color="bg-accent-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-black mb-4">
              Tout ce dont vous avez besoin pour progresser
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Progress2Win combine suivi de poids, enregistrement d'exercices et compétition
              pour vous aider à atteindre vos objectifs fitness plus rapidement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Scale className="w-10 h-10" />}
              title="Suivi du Poids"
              description="Enregistrez votre poids quotidien, visualisez votre progression avec des graphiques détaillés et atteignez votre objectif de perte de poids."
              color="bg-success-500"
            />
            <FeatureCard
              icon={<Dumbbell className="w-10 h-10" />}
              title="Exercices Variés"
              description="Suivez vos performances : tractions, pompes, squats, développé couché, et bien plus. Voyez votre progression en temps réel."
              color="bg-primary-500"
            />
            <FeatureCard
              icon={<Target className="w-10 h-10" />}
              title="Objectifs Personnalisés"
              description="Définissez des objectifs réalistes et suivez votre progression. Recevez des encouragements quand vous les atteignez."
              color="bg-accent-500"
            />
            <FeatureCard
              icon={<Users className="w-10 h-10" />}
              title="Groupes d'Amis"
              description="Créez des groupes avec vos amis, partagez vos progrès et motivez-vous mutuellement pour rester constant."
              color="bg-secondary-500"
            />
            <FeatureCard
              icon={<Trophy className="w-10 h-10" />}
              title="Classements"
              description="Comparez vos performances avec d'autres utilisateurs. Qui fera le plus de tractions ? Qui perdra le plus de poids ?"
              color="bg-danger-500"
            />
            <FeatureCard
              icon={<BarChart3 className="w-10 h-10" />}
              title="Statistiques Détaillées"
              description="Analysez vos données avec des graphiques interactifs. Identifiez vos points forts et axes d'amélioration."
              color="bg-primary-500"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-secondary-50 border-y-4 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-black mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-neutral-600">
              Commencez à progresser en 3 étapes simples
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Créez votre compte"
              description="Inscrivez-vous gratuitement en moins de 30 secondes. Aucune carte bancaire requise."
            />
            <StepCard
              number="2"
              title="Définissez vos objectifs"
              description="Choisissez votre objectif de poids et les exercices que vous souhaitez suivre (tractions, pompes, etc.)."
            />
            <StepCard
              number="3"
              title="Suivez vos progrès"
              description="Enregistrez vos performances quotidiennes et visualisez votre progression avec des graphiques motivants."
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black text-black mb-6">
                Pourquoi choisir Progress2Win ?
              </h2>
              <div className="space-y-4">
                <BenefitItem
                  text="Interface simple et intuitive - pas de complexité inutile"
                />
                <BenefitItem
                  text="Suivi de multiples métriques : poids, tractions, pompes, squats, et plus"
                />
                <BenefitItem
                  text="Compétition amicale pour rester motivé jour après jour"
                />
                <BenefitItem
                  text="Visualisation claire de vos progrès avec des graphiques"
                />
                <BenefitItem
                  text="Créez des groupes privés avec vos amis et famille"
                />
                <BenefitItem
                  text="Données sécurisées et privées - vos progrès vous appartiennent"
                />
                <BenefitItem
                  text="100% gratuit - pas de frais cachés ni d'abonnement"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MetricBox
                value="10,000+"
                label="Utilisateurs actifs"
                color="bg-primary-100"
              />
              <MetricBox
                value="500k+"
                label="Exercices enregistrés"
                color="bg-accent-100"
              />
              <MetricBox
                value="2,500+"
                label="Objectifs atteints"
                color="bg-success-100"
              />
              <MetricBox
                value="15kg"
                label="Perte de poids moyenne"
                color="bg-secondary-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 border-y-4 border-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            Prêt à transformer votre corps ?
          </h2>
          <p className="text-2xl text-white/90 mb-8">
            Rejoignez des milliers d'utilisateurs qui atteignent leurs objectifs fitness avec Progress2Win
          </p>
          <Link to="/register">
            <Button
              variant="accent"
              size="xl"
              icon={<Zap className="w-5 h-5" />}
              iconPosition="left"
              className="text-xl"
            >
              Commencer Maintenant - C'est Gratuit
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 px-4 border-t-4 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-500 border-2 border-white flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black">Progress2Win</h3>
              </div>
              <p className="text-neutral-400">
                L'application de suivi fitness qui vous aide à atteindre vos objectifs.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Produit</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Fonctionnalités</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Tarifs</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Connexion</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><Link to="/feedback" className="hover:text-white transition-colors">Feedback</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Légal</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 Progress2Win. Tous droits réservés. Atteignez vos objectifs fitness.</p>
          </div>
        </div>
      </footer>

      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Progress2Win",
          "applicationCategory": "HealthApplication",
          "description": "Application de suivi de progression fitness pour la perte de poids et l'enregistrement d'exercices comme les tractions, pompes et squats. Suivez vos objectifs, comparez vos performances et restez motivé.",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "10000"
          },
          "featureList": [
            "Suivi du poids corporel",
            "Enregistrement d'exercices (tractions, pompes, squats)",
            "Définition d'objectifs personnalisés",
            "Graphiques de progression",
            "Groupes d'amis et compétition",
            "Classements et leaderboards",
            "Statistiques détaillées"
          ]
        })}
      </script>
    </div>
  );
};

// Composants helper

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="bg-white border-2 border-black shadow-neo-sm p-4 flex items-center gap-4">
    <div className={`${color} border-2 border-black p-3 text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-semibold text-neutral-600">{label}</p>
      <p className="text-2xl font-black text-black">{value}</p>
    </div>
  </div>
);

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}> = ({ icon, title, description, color }) => (
  <div className="bg-white border-4 border-black shadow-neo p-8 hover:shadow-neo-lg transition-all hover:-translate-x-1 hover:-translate-y-1">
    <div className={`${color} border-2 border-black w-16 h-16 flex items-center justify-center mb-6 text-white`}>
      {icon}
    </div>
    <h3 className="text-2xl font-black text-black mb-3">{title}</h3>
    <p className="text-neutral-700 leading-relaxed">{description}</p>
  </div>
);

const StepCard: React.FC<{
  number: string;
  title: string;
  description: string;
}> = ({ number, title, description }) => (
  <div className="bg-white border-4 border-black shadow-neo-lg p-8 text-center">
    <div className="w-16 h-16 bg-primary-500 border-2 border-black text-white text-3xl font-black flex items-center justify-center mx-auto mb-6 shadow-neo-sm">
      {number}
    </div>
    <h3 className="text-2xl font-black text-black mb-3">{title}</h3>
    <p className="text-neutral-700 leading-relaxed">{description}</p>
  </div>
);

const BenefitItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-3">
    <CheckCircle2 className="w-6 h-6 text-success-600 flex-shrink-0 mt-0.5" />
    <p className="text-lg text-neutral-700">{text}</p>
  </div>
);

const MetricBox: React.FC<{
  value: string;
  label: string;
  color: string;
}> = ({ value, label, color }) => (
  <div className={`${color} border-4 border-black shadow-neo p-6 text-center`}>
    <p className="text-4xl font-black text-black mb-2">{value}</p>
    <p className="text-sm font-bold text-neutral-700">{label}</p>
  </div>
);

export default LandingPage;
