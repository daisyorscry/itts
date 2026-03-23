interface FooterLogoProps {
  className?: string;
}

export function FooterLogo({ className = '' }: FooterLogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }} className={className}>
      <div style={{
        width: '52px',
        height: '52px',
        background: '#29E68C',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ color: '#000', fontWeight: 800, fontSize: '22px', fontFamily: "'Sora', sans-serif" }}>IT</span>
      </div>
      <span style={{ 
        fontFamily: "'Sora', sans-serif", 
        fontWeight: 700, 
        fontSize: '20px', 
        color: '#fff',
        letterSpacing: '-0.01em',
      }}>
        ITTS Community
      </span>
    </div>
  );
}
