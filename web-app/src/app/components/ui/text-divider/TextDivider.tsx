import { Separator } from '../separator';

interface TextDividerProps {
  text: string;
  className?: string;
}

export function TextDivider({ text, className = '' }: TextDividerProps) {
  return (
    <section className={`flex items-center gap-4 my-6 ${className}`}>
      <Separator className="flex-1" style={{ background: 'rgba(4, 9, 12, 0.1)' }} />
      <span className="font-['Outfit'] text-xs" style={{ color: 'rgba(4, 9, 12, 0.4)' }}>
        {text}
      </span>
      <Separator className="flex-1" style={{ background: 'rgba(4, 9, 12, 0.1)' }} />
    </section>
  );
}
