import React, { useState } from 'react';
import { Star, Send, MessageSquare, Lightbulb } from 'lucide-react';
import { api } from '../services/api';

export const FeedbackPage: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Merci de donner une note');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/feedback', {
        rating,
        feedback,
        suggestions,
      });

      setSubmitted(true);
      setRating(0);
      setFeedback('');
      setSuggestions('');

      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError('Une erreur s\'est produite. Réessaie.');
      console.error('Feedback error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary-100 to-accent-100 border-2 border-black p-8 shadow-neo">
            <h1 className="text-4xl font-black text-black mb-3">
              Your Feedback Matters! 💭
            </h1>
            <p className="text-lg text-neutral-700">
              Help us improve Progress2Win by sharing your experience
            </p>
          </div>

      {/* Success message */}
      {submitted && (
        <div className="alert-neo-success mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-success-500 border-2 border-black rounded-full flex items-center justify-center mr-4">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-success-800">Merci pour ton feedback!</h3>
              <p className="text-sm text-success-700">Ton feedback a été envoyé avec succès.</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div className="card-neo">
          <label className="block text-lg font-bold text-black mb-4">
            Comment évaluez-vous l'application ?
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-2 transition-all duration-200 hover:scale-110"
              >
                <Star
                  className={`w-12 h-12 transition-all ${
                    star <= (hoveredRating || rating)
                      ? 'fill-accent-400 text-accent-600'
                      : 'text-neutral-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-neutral-600 mt-2">
            {rating === 0 && 'Cliquez pour noter'}
            {rating === 1 && '😞 Pas terrible'}
            {rating === 2 && '😐 Peut mieux faire'}
            {rating === 3 && '🙂 Correct'}
            {rating === 4 && '😊 Très bien'}
            {rating === 5 && '🤩 Excellent !'}
          </p>
        </div>

        {/* General feedback */}
        <div className="card-neo">
          <label className="block text-lg font-bold text-black mb-4">
            <MessageSquare className="inline w-6 h-6 mr-2 mb-1" />
            Qu'en pensez-vous ?
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Partagez votre expérience avec Progress2Win..."
            className="input-neo min-h-[120px] resize-y"
            rows={4}
          />
          <p className="text-xs text-neutral-500 mt-2">
            Qu'est-ce qui vous plaît ? Qu'est-ce qui pourrait être amélioré ?
          </p>
        </div>

        {/* Suggestions */}
        <div className="card-neo">
          <label className="block text-lg font-bold text-black mb-4">
            <Lightbulb className="inline w-6 h-6 mr-2 mb-1" />
            Des idées de fonctionnalités ?
          </label>
          <textarea
            value={suggestions}
            onChange={(e) => setSuggestions(e.target.value)}
            placeholder="Quelles fonctionnalités aimeriez-vous voir dans l'application ?"
            className="input-neo min-h-[120px] resize-y"
            rows={4}
          />
          <p className="text-xs text-neutral-500 mt-2">
            Nouvelles fonctionnalités, améliorations, intégrations...
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="alert-neo-danger">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="btn-neo-primary btn-neo-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="loading-neo mr-3" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Envoyer mon feedback
              </>
            )}
          </button>
        </div>
      </form>

          {/* Info box */}
          <div className="p-6 bg-secondary-50 border-2 border-secondary-700 shadow-neo">
            <h3 className="font-bold text-secondary-900 mb-2">
              Pourquoi votre avis est important ?
            </h3>
            <ul className="text-sm text-secondary-800 space-y-1">
              <li>✅ Nous lisons chaque feedback attentivement</li>
              <li>✅ Vos suggestions influencent nos priorités de développement</li>
              <li>✅ Vous nous aidez à créer la meilleure app de fitness possible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
