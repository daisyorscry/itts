import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  themeVariables: {
    primaryColor: '#2563eb',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#1d4ed8',
    background: 'transparent',
    mainBkg: 'transparent',
    secondBkg: 'transparent',
    tertiaryBkg: 'transparent',
    textColor: '#0f172a',
  },
});

const code = `flowchart LR\nA[Source Code]-->B[Interpreter]`;
const { svg } = await mermaid.render('m1', code);
console.log(svg);
