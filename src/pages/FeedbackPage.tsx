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
    <div className="w-full bg-[#FFF5E1]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-display text-black">Ton avis compte!</h1>
          <p className="text-base sm:text-lg text-black/70 mt-1">
            Aide-nous à améliorer Progress2Win
          </p>
        </div>

        {/* Success message */}
        {submitted && (
          <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#9D4EDD] border-2 border-black rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-black">Merci pour ton feedback!</h3>
                <p className="text-sm text-black/70">Ton feedback a été envoyé avec succès.</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating */}
          <div className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <label className="block text-lg font-semibold text-black mb-4">
              Comment évalues-tu l'application ?
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-2 transition-all duration-200 hover:scale-110 border-2 border-transparent hover:border-black rounded-lg"
                >
                  <Star
                    className={`w-10 h-10 sm:w-12 sm:h-12 transition-all ${
                      star <= (hoveredRating || rating)
                        ? 'fill-[#FFD93D] text-black'
                        : 'text-black/20'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-black/70 mt-3">
              {rating === 0 && 'Clique pour noter'}
              {rating === 1 && '😞 Pas terrible'}
              {rating === 2 && '😐 Peut mieux faire'}
              {rating === 3 && '🙂 Correct'}
              {rating === 4 && '😊 Très bien'}
              {rating === 5 && '🤩 Excellent !'}
            </p>
          </div>

          {/* General feedback */}
          <div className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <label className="block text-lg font-semibold text-black mb-4">
              <MessageSquare className="inline w-6 h-6 mr-2 mb-1" />
              Qu'en penses-tu ?
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Partage ton expérience avec Progress2Win..."
              className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white min-h-[120px] resize-y"
              rows={4}
            />
            <p className="text-xs text-black/60 mt-2">
              Qu'est-ce qui te plaît ? Qu'est-ce qui pourrait être amélioré ?
            </p>
          </div>

          {/* Suggestions */}
          <div className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
            <label className="block text-lg font-semibold text-black mb-4">
              <Lightbulb className="inline w-6 h-6 mr-2 mb-1" />
              Des idées de fonctionnalités ?
            </label>
            <textarea
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="Quelles fonctionnalités aimerais-tu voir dans l'application ?"
              className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[3px_3px_0_0_rgba(0,0,0,1)] focus:outline-none transition-all bg-white min-h-[120px] resize-y"
              rows={4}
            />
            <p className="text-xs text-black/60 mt-2">
              Nouvelles fonctionnalités, améliorations, intégrations...
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-white border-3 border-black rounded-2xl p-5 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
              <p className="font-semibold text-black">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="w-full sm:w-auto bg-[#9D4EDD] border-2 border-black rounded-xl font-semibold text-white py-3 px-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[3px_3px_0_0_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer mon feedback
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info box */}
        <div className="bg-white border-3 border-black rounded-2xl p-5 sm:p-6 shadow-[5px_5px_0_0_rgba(0,0,0,1)]">
          <h3 className="font-semibold text-black mb-3">
            Pourquoi ton avis est important ?
          </h3>
          <ul className="text-sm text-black/70 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#9D4EDD] font-semibold">✓</span>
              <span>Nous lisons chaque feedback attentivement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#9D4EDD] font-semibold">✓</span>
              <span>Tes suggestions influencent nos priorités de développement</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#9D4EDD] font-semibold">✓</span>
              <span>Tu nous aides à créer la meilleure app de fitness possible</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
