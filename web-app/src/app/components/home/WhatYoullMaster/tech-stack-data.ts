import type { LucideIcon } from "lucide-react"
import {
  Code,
  Globe,
  Lock,
  Zap,
  Wifi,
  GitBranch,
  Box,
  Layers,
  Cloud,
  Database,
  Network,
  Container,
  Terminal,
  Cpu,
  Shield,
  Server,
} from "lucide-react"

export interface TechItem {
  name: string
  category: string
  icon: LucideIcon
}

export interface TrackStyle {
  color: string
  bg: string
  border: string
}

export function wrapValue(min: number, max: number, v: number): number {
  const range = max - min
  return ((((v - min) % range) + range) % range) + min
}

export const TRACK_STYLE: Record<string, TrackStyle> = {
  Networking: {
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.08)",
    border: "rgba(56,189,248,0.22)",
  },
  Security: {
    color: "#F472B6",
    bg: "rgba(244,114,182,0.08)",
    border: "rgba(244,114,182,0.22)",
  },
  DevOps: {
    color: "#F472B6",
    bg: "rgba(244,114,182,0.08)",
    border: "rgba(244,114,182,0.22)",
  },
  DevSecOps: {
    color: "#F472B6",
    bg: "rgba(244,114,182,0.08)",
    border: "rgba(244,114,182,0.22)",
  },
  Programming: {
    color: "#29E68C",
    bg: "rgba(41,230,140,0.08)",
    border: "rgba(41,230,140,0.22)",
  },
  Cloud: {
    color: "#29E68C",
    bg: "rgba(41,230,140,0.08)",
    border: "rgba(41,230,140,0.22)",
  },
  OS: {
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.08)",
    border: "rgba(56,189,248,0.22)",
  },
}

export const row1: TechItem[] = [
  { name: "Python", category: "Programming", icon: Code },
  { name: "Nginx", category: "Networking", icon: Globe },
  { name: "Vault", category: "Security", icon: Lock },
  { name: "Ansible", category: "DevOps", icon: Zap },
  { name: "Node.js", category: "Programming", icon: Code },
  { name: "Wireshark", category: "Networking", icon: Wifi },
  { name: "CI/CD", category: "DevSecOps", icon: GitBranch },
  { name: "Kubernetes", category: "DevOps", icon: Box },
]

export const row2: TechItem[] = [
  { name: "Terraform", category: "DevOps", icon: Layers },
  { name: "AWS", category: "Cloud", icon: Cloud },
  { name: "Git", category: "DevOps", icon: GitBranch },
  { name: "React", category: "Programming", icon: Code },
  { name: "PostgreSQL", category: "Programming", icon: Database },
  { name: "MikroTik", category: "Networking", icon: Network },
  { name: "Docker", category: "DevOps", icon: Container },
  { name: "Linux", category: "OS", icon: Terminal },
]

export const row3: TechItem[] = [
  { name: "Cisco IOS", category: "Networking", icon: Cpu },
  { name: "Trivy", category: "Security", icon: Shield },
  { name: "Redis", category: "Programming", icon: Database },
  { name: "OWASP ZAP", category: "Security", icon: Lock },
  { name: "Semgrep", category: "DevSecOps", icon: Shield },
  { name: "BGP", category: "Networking", icon: Network },
  { name: "Prometheus", category: "DevOps", icon: Zap },
  { name: "Grafana", category: "DevOps", icon: Server },
]

export const categories = [
  {
    name: "Networking",
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.08)",
    border: "rgba(56,189,248,0.2)",
  },
  {
    name: "DevSecOps",
    color: "#F472B6",
    bg: "rgba(244,114,182,0.08)",
    border: "rgba(244,114,182,0.2)",
  },
  {
    name: "Programming",
    color: "#29E68C",
    bg: "rgba(41,230,140,0.08)",
    border: "rgba(41,230,140,0.2)",
  },
]
