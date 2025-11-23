import {
  HiMiniHome,
  HiMiniInformationCircle,
  HiMiniBookOpen,
  HiMiniCalendarDays,
  HiMiniTicket,
  HiMiniUserGroup,
  HiMiniBuildingOffice2,
  HiMiniRocketLaunch,
} from "react-icons/hi2";

export const HOME_SECTIONS = [
  {
    id: "hero",
    title: "Beranda",
    desc: "Gambaran ITTS Community",
    icon: HiMiniHome,
  },
  {
    id: "about",
    title: "Tentang",
    desc: "Apa itu ITTS Community",
    icon: HiMiniInformationCircle,
  },
  {
    id: "program",
    title: "Program",
    desc: "Networking/DevSecOps/Prog",
    icon: HiMiniBookOpen,
  },
  {
    id: "routine",
    title: "Kegiatan Rutin",
    desc: "Weekly class & mentoring",
    icon: HiMiniCalendarDays,
  },
  {
    id: "events",
    title: "Event Terdekat",
    desc: "Workshop & meetup",
    icon: HiMiniTicket,
  },
  {
    id: "mentors",
    title: "Mentor",
    desc: "Pembimbing & coach",
    icon: HiMiniUserGroup,
  },
  {
    id: "partners",
    title: "Partner & Lab",
    desc: "Kolaborasi & fasilitas",
    icon: HiMiniBuildingOffice2,
  },
  {
    id: "cta",
    title: "Daftar",
    desc: "Gabung sebagai anggota",
    icon: HiMiniRocketLaunch,
  },
] as const;
