import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-5">
      <div className="h-16 w-16 rounded-2xl bg-charcoal-900 border border-charcoal-800 flex items-center justify-center text-lime-400 shadow-glow-lime">
        <Compass className="h-8 w-8 animate-pulse" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-100">404 — Page Not Found</h1>
        <p className="text-sm text-slate-400 max-w-md">
          Looks like this financial route does not exist. Even on a ₹10,000 budget, we don't get lost!
        </p>
      </div>
      <Button variant="primary" onClick={() => navigate('/')}>
        <Home className="h-4 w-4 mr-2" />
        Return to Dashboard
      </Button>
    </div>
  );
}
