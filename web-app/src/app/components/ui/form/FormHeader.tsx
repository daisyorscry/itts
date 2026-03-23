import { Text } from '../text';

interface FormHeaderProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const alignMap = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function FormHeader({ title, subtitle, align = 'center', className = '' }: FormHeaderProps) {
  return (
    <header className={`mb-8 ${alignMap[align]} ${className}`}>
      <Text 
        as="h1" 
        className="font-['Sora'] font-bold text-3xl mb-2" 
        style={{ color: '#04090C' }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text 
          as="span" 
          className="font-['Outfit'] text-sm block" 
          style={{ color: 'rgba(4, 9, 12, 0.6)' }}
        >
          {subtitle}
        </Text>
      )}
    </header>
  );
}
