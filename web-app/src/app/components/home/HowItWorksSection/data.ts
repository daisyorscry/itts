export interface Project {
  id: number
  track: string
  accent: string
  rgb: string
  name: string
  tagline: string
  desc: string
  tech: string[]
  status: string
  image: string
}

export const projects: Project[] = [
  {
    id: 1,
    track: "Networking",
    accent: "#38BDF8",
    rgb: "56,189,248",
    name: "NETVIZ",
    tagline: "Real-Time Network Topology Visualizer",
    desc: "Platform mapping dan monitoring topologi jaringan yang dibangun komunitas Networking ITTS. Visualisasi live traffic, deteksi anomali, dan analisis konektivitas dari browser — tanpa software mahal.",
    tech: ["Cisco IOS", "Wireshark", "Python", "D3.js", "SNMP"],
    status: "IN DEVELOPMENT",
    image:
      "https://images.unsplash.com/photo-1599949104055-2d04026aee1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXR3b3JrJTIwaW5mcmFzdHJ1Y3R1cmUlMjB0ZWNobm9sb2d5JTIwZGF0YSUyMGNlbnRlcnxlbnwxfHx8fDE3NzM2NTIxOTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 2,
    track: "DevSecOps",
    accent: "#F472B6",
    rgb: "244,114,182",
    name: "SECSHIELD",
    tagline: "Automated Security Pipeline Gate",
    desc: "CI/CD security scanner yang otomatis mendeteksi CVE, secret leaks, dan misconfiguration di setiap commit. Open-source security gate yang bisa dipasang di pipeline manapun.",
    tech: ["Docker", "GitLab CI", "Trivy", "OWASP ZAP", "Semgrep"],
    status: "BETA",
    image:
      "https://images.unsplash.com/photo-1768839720936-87ce3adf2d08?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwZGlnaXRhbCUyMHNlY3VyaXR5JTIwcHJvdGVjdGlvbnxlbnwxfHx8fDE3NzM2NTIxOTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    id: 3,
    track: "Programming",
    accent: "#29E68C",
    rgb: "41,230,140",
    name: "DEVHUB",
    tagline: "Community Developer Portal",
    desc: "Platform kolaborasi eksklusif anggota ITTS — showcase project, peer code review, job board dari mitra industri, dan leaderboard kontribusi. Satu dashboard, seluruh ekosistem.",
    tech: ["React", "Node.js", "PostgreSQL", "Redis", "WebSocket"],
    status: "LIVE",
    image:
      "https://images.unsplash.com/photo-1607971422532-73f9d45d7a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGUlMjBkZXZlbG9wZXIlMjBsYXB0b3B8ZW58MXx8fHwxNzczNTk3OTEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
]
