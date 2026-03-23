import { Network, Shield, Code } from "lucide-react";

export interface Track {
  icon: typeof Network;
  title: string;
  subtitle: string;
  description: string;
  gradientFrom: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  image: string;
  tags: string[];
  tagColor: string;
  accent: string;
}

export const tracks: Track[] = [
  {
    icon: Network,
    title: "Networking",
    subtitle: "Infrastructure & System Admin",
    description:
      "Master network protocols, infrastructure design, and system administration from basics to enterprise-level.",
    gradientFrom: "#38BDF8",
    bgColor: "rgba(56,189,248,0.1)",
    borderColor: "rgba(56,189,248,0.2)",
    iconBg: "linear-gradient(135deg, #38BDF8, #0EA5E9)",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    tags: ["OSI Model", "Cisco/MikroTik", "Cloud Networking"],
    tagColor: "#38BDF8",
    accent: "#38BDF8",
  },
  {
    icon: Shield,
    title: "DevSecOps",
    subtitle: "Security-First Operations",
    description:
      "Build, deploy, and secure applications with modern CI/CD pipelines, containerization, and cloud platforms.",
    gradientFrom: "#F472B6",
    bgColor: "rgba(244,114,182,0.1)",
    borderColor: "rgba(244,114,182,0.2)",
    iconBg: "linear-gradient(135deg, #F472B6, #A855F7)",
    image:
      "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    tags: ["Docker & K8s", "CI/CD Pipelines", "Cloud Security"],
    tagColor: "#F472B6",
    accent: "#F472B6",
  },
  {
    icon: Code,
    title: "Programming",
    subtitle: "Full-Stack Development",
    description:
      "Create production-ready applications with modern frameworks, databases, and industry best practices.",
    gradientFrom: "#29E68C",
    bgColor: "rgba(41,230,140,0.1)",
    borderColor: "rgba(41,230,140,0.2)",
    iconBg: "linear-gradient(135deg, #29E68C, #059669)",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14431b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    tags: ["React/Node.js", "REST APIs", "Database Design"],
    tagColor: "#29E68C",
    accent: "#29E68C",
  },
];
