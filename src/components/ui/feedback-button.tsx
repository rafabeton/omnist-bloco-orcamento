'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface FeedbackButtonProps {
  context?: string; // Contexto onde o feedback está sendo coletado
  className?: string;
}

export default function FeedbackButton({ context = 'general', className = '' }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim() || rating === null) return;

    setIsSubmitting(true);

    try {
      // Salvar feedback localmente
      const feedbackData = {
        context,
        feedback: feedback.trim(),
        email: email.trim(),
        rating,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Salvar no localStorage
      const existingFeedback = JSON.parse(localStorage.getItem('user_feedback') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('user_feedback', JSON.stringify(existingFeedback));

      // Aqui poderia enviar para um serviço de feedback (ex: Typeform, Google Forms, etc.)
      // await sendFeedbackToService(feedbackData);

      setIsSubmitted(true);
      
      // Fechar após 2 segundos
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setFeedback('');
        setEmail('');
        setRating(null);
      }, 2000);

    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className={`fixed bottom-4 right-4 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 shadow-lg z-50 ${className}`}
      >
        💬 Feedback
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-xl z-50 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Feedback</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Como podemos melhorar sua experiência?
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isSubmitted ? (
          <div className="text-center py-4">
            <div className="text-green-600 text-2xl mb-2">✅</div>
            <p className="text-green-700 font-medium">Obrigado pelo feedback!</p>
            <p className="text-sm text-gray-600">Sua opinião é muito importante para nós.</p>
          </div>
        ) : (
          <>
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Como avalia esta funcionalidade?
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleRatingClick(value)}
                    className={`text-2xl transition-colors ${
                      rating && value <= rating
                        ? 'text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentários ou sugestões
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Conte-nos sua experiência ou sugestões de melhoria..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {feedback.length}/500 caracteres
              </p>
            </div>

            {/* Email (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (opcional)
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Para respondermos ao seu feedback
              </p>
            </div>

            {/* Context Badge */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                Contexto: {context}
              </Badge>
              
              <Button
                onClick={handleSubmit}
                disabled={!feedback.trim() || rating === null || isSubmitting}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

