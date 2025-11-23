export const months = [
  {
    month: 'Bulan 1 — Fondasi & Infrastruktur',
    items: [
      'Virtualization & Lab: Proxmox, jaringan VM, storage dasar',
      'SCM: GitLab server + runner (basic), permission, project template',
      'Registry: Harbor (project, retention, tag immutability)',
      'Container runtime: Docker & Docker Compose (build, push, deploy)',
      'Fundamental Linux: systemd, journald, user/group, firewall dasar',
    ],
  },
  {
    month: 'Bulan 2 — Workflow Tim & Otomasi',
    items: [
      'Kolaborasi: alur PR/MR, code review, branch protection',
      'Git Flow/Trunk Based: release, hotfix, versioning semver',
      'Pipeline dasar: lint, test, build image, push ke Harbor',
      'Template CI/CD reuse: variables, artifacts, caching, matrix',
      'Deploy preview/staging dengan Compose + env per stage',
    ],
  },
  {
    month: 'Bulan 3 — Orkestrasi Kubernetes (Dasar)',
    items: [
      'Rancher/RKE/K3s: cluster bootstrap, node roles, CNI',
      'Kubernetes resource: Pod, Deployment, Service, Ingress',
      'Manajemen config: ConfigMap, Secret, env & volume',
      'Packaging: Helm chart & values; repo chart internal',
      'GitOps (opsional): Argo CD/Flux untuk sync state',
    ],
  },
  {
    month: 'Bulan 4 — Observability & High Availability',
    items: [
      'Metrics: Prometheus + Grafana (dashboarding, alert dasar)',
      'Logs & Security: Wazuh (collector, rule basic, alerting)',
      'Tracing (opsional): OpenTelemetry + tempo/jaeger',
      'HA: Nginx LB/Ingress HA, control-plane/worker HA',
      'Backup/Restore: snapshot etcd, PVC backup (Velero/Restic)',
    ],
  },
  {
    month: 'Bulan 5 — Security Engineering',
    items: [
      'SAST: jalankan code scan di pipeline (Semgrep/CodeQL)',
      'DAST: scan aplikasi berjalan (OWASP ZAP) di staging',
      'IAST: instrumentation (opsional) untuk test dinamis',
      'SBOM & Image Scan: Trivy/Grype, policy gate sebelum release',
      'Gateway/Policy: Envoy/Nginx gateway, Rate limit, mTLS (opsional)',
    ],
  },
  {
    month: 'Bulan 6 — SRE, Scaling & Capstone',
    items: [
      'Autoscaling: HPA/VPA, resource request/limit yang tepat',
      'Reliability: SLO/SLI, alert routing & on-call handbook',
      'DR & Incident: runbook, disaster recovery drill',
      'Cost & Perf: profiling dasar, caching, CDN (opsional)',
      'Capstone: rancang, deploy, observasi & amankan aplikasi end-to-end',
    ],
  },
];