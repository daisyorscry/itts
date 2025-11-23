export default function ThemeSSRSafeScript() {
  const code = `
  (function() {
    try {
      var stored = localStorage.getItem('theme'); // 'light' | 'dark' | null
      var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = stored === 'light' || stored === 'dark' ? stored : (systemDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {}
  })();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
