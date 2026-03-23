export interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  track: string
  trackColor: string
  avatar: string
  quote: string
}

export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Rafi Ananda",
    role: "Network Engineer",
    company: "Telkom Indonesia",
    track: "Networking",
    trackColor: "#3B82F6",
    avatar: "https://images.unsplash.com/photo-1771555290865-73c6572fbd75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMEluZG9uZXNpYW4lMjBkZXZlbG9wZXIlMjBwcm9ncmFtbWVyJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczNTE5MTc5fDA&ixlib=rb-4.1.0&q=80&w=200",
    quote: "Dari nol networking, 8 bulan di ITTS langsung dapat offer dari Telkom. Materinya beneran industry-ready, bukan cuma teori doang.",
  },
  {
    id: 2,
    name: "Dina Safitri",
    role: "Security Analyst",
    company: "BCA Digital",
    track: "DevSecOps",
    trackColor: "#A855F7",
    avatar: "https://images.unsplash.com/photo-1729337531424-198f880cb6c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMEFzaWFuJTIwd29tYW4lMjB0ZWNoJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzczNTE5MTgwfDA&ixlib=rb-4.1.0&q=80&w=200",
    quote: "DevSecOps track-nya luar biasa. Mentor-nya praktikal banget dan real project yang gw bikin jadi portfolio utama waktu interview di BCA.",
  },
  {
    id: 3,
    name: "Kevin Pratama",
    role: "Backend Developer",
    company: "Tokopedia",
    track: "Programming",
    trackColor: "#29E68C",
    avatar: "https://images.unsplash.com/photo-1758518727984-17b37f2f0562?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMG1hbiUyMHNtaWxpbmclMjBwcm9mZXNzaW9uYWwlMjBvZmZpY2UlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzM1MTkxODJ8MA&ixlib=rb-4.1.0&q=80&w=200",
    quote: "Community-nya solid banget. Bisa diskusi kapan aja, peer review tiap project, dan mentor langsung kasih feedback yang actionable. 10/10.",
  },
  {
    id: 4,
    name: "Mega Rahayu",
    role: "DevOps Engineer",
    company: "GoTo Group",
    track: "DevSecOps",
    trackColor: "#A855F7",
    avatar: "https://images.unsplash.com/photo-1765005204058-10418f5123c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc21pbGluZyUyMGNvbmZpZGVudCUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc3MzUxOTE4Mnww&ixlib=rb-4.1.0&q=80&w=200",
    quote: "Struktur belajarnya jelas dan progresif. Tiap step ada checkpoint yang bikin kamu sadar progress kamu sendiri. Gak pernah ngerasa lost.",
  },
  {
    id: 5,
    name: "Arif Hidayat",
    role: "SysAdmin",
    company: "Indosat Ooredoo",
    track: "Networking",
    trackColor: "#3B82F6",
    avatar: "https://images.unsplash.com/photo-1512484776495-a09d92e87c3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBjYXN1YWwlMjBwb3J0cmFpdCUyMHRlY2glMjBkZXZlbG9wZXIlMjBzbWlsZXxlbnwxfHx8fDE3NzM1MTkxODV8MA&ixlib=rb-4.1.0&q=80&w=200",
    quote: "Belajar CCNA lewat ITTS jauh lebih ngerti dibanding belajar sendiri. Ada simulasi lab, ada mentor, ada community yang aktif. Passed first try!",
  },
  {
    id: 6,
    name: "Bima Tanujaya",
    role: "Cloud Engineer",
    company: "AWS Partner",
    track: "DevSecOps",
    trackColor: "#A855F7",
    avatar: "https://images.unsplash.com/photo-1738566061505-556830f8b8f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGJ1c2luZXNzJTIwcG9ydHJhaXQlMjBjb25maWRlbnR8ZW58MXx8fHwxNzczNTE5MTg1fDA&ixlib=rb-4.1.0&q=80&w=200",
    quote: "ITTS kasih gw confidence buat tackle cloud infrastructure. Real project langsung di AWS, bukan simulasi. Sekarang gw handle produksi skala enterprise.",
  },
  {
    id: 7,
    name: "Nadia Kusuma",
    role: "Network Admin",
    company: "XL Axiata",
    track: "Networking",
    trackColor: "#3B82F6",
    avatar: "https://images.unsplash.com/photo-1729337531424-198f880cb6c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMEFzaWFuJTIwd29tYW4lMjB0ZWNoJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzczNTE5MTgwfDA&ixlib=rb-4.1.0&q=80&w=200",
    quote: "Gak nyangka 6 bulan bisa sampai sini. Dari yang takut command line, sekarang manage network infrastructure buat 500+ user setiap harinya.",
  },
  {
    id: 8,
    name: "Sinta Widodo",
    role: "Frontend Developer",
    company: "Shopee Indonesia",
    track: "Programming",
    trackColor: "#29E68C",
    avatar: "https://images.unsplash.com/photo-1765005204058-10418f5123c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwc21pbGluZyUyMGNvbmZpZGVudCUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc3MzUxOTE4Mnww&ixlib=rb-4.1.0&q=80&w=200",
    quote: "Programming track ITTS beda banget. Mereka ngajarin cara berpikir kayak engineer, bukan cuma syntax. Itu yang bikin gw bisa adaptasi cepat di Shopee.",
  },
]

export const row1 = testimonials.slice(0, 4)
export const row2 = testimonials.slice(4, 8)
