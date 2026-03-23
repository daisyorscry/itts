import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6">
      <div className="max-w-lg text-center">
        <div className="mb-4 text-7xl font-bold text-accent sm:text-8xl md:text-9xl">404</div>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Page Not Found</h1>
        <p className="mb-8 text-base text-foreground/70 sm:text-lg">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-8 py-3 bg-accent text-black rounded-full font-semibold hover:bg-accent/90 transition-colors"
          >
            <Home className="mr-2" size={20} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-8 py-3 bg-card border border-border rounded-full font-semibold hover:border-accent hover:text-accent transition-colors"
          >
            <ArrowLeft className="mr-2" size={20} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
