// features/registrations.ts
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const PROGRAMS = ["networking", "devsecops", "programming"] as const;
export type Program = (typeof PROGRAMS)[number];

export type RegisterInput = {
  fullName: string;
  email: string;
  program: Program | string;
  studentId: string;
  intakeYear: string;
  motivation: string;
};

type ApiPayload = {
  full_name: string;
  email: string;
  program: string;
  student_id: string;
  intake_year: number;
  motivation: string;
};

function pickImportantMessage(raw?: string): string | null {
  if (!raw) return null;
  const msg = raw.toLowerCase();

  // penting #1: email sudah terdaftar / duplicate
  if (
    msg.includes("email") &&
    (msg.includes("already") ||
      msg.includes("registered") ||
      msg.includes("exists") ||
      msg.includes("duplicate") ||
      msg.includes("unique"))
  ) {
    return "Email sudah terdaftar";
  }

  // penting #2: intake year invalid / melanggar constraint
  if (
    msg.includes("intake") &&
    (msg.includes("between") ||
      msg.includes("gte") ||
      msg.includes("lte") ||
      msg.includes("invalid") ||
      msg.includes("constraint"))
  ) {
    return "Tahun angkatan tidak valid";
  }

  // penting #3: validasi umum
  if (
    msg.includes("validation") ||
    msg.includes("invalid") ||
    msg.includes("bad request") ||
    msg.includes("payload")
  ) {
    return "Data tidak valid";
  }

  return null;
}

async function extractError(res: Response): Promise<string> {
  // urutan: coba JSON.error/message/detail → teks → status
  const fallback =
    res.status >= 500
      ? "Gagal melakukan pendaftaran (server bermasalah)"
      : "Gagal melakukan pendaftaran";

  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await res.json().catch(() => ({} as any));
      const raw =
        (typeof data?.error === "string" && data.error) ||
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.detail === "string" && data.detail) ||
        "";

      const important = pickImportantMessage(raw);
      if (important) return important;

      // kalau ada array errors, ambil yang pertama
      if (Array.isArray(data?.errors) && data.errors.length) {
        const first = data.errors[0];
        const firstMsg =
          (typeof first === "string" && first) ||
          (typeof first?.message === "string" && first.message) ||
          (typeof first?.msg === "string" && first.msg) ||
          "";
        const imp2 = pickImportantMessage(firstMsg);
        if (imp2) return imp2;
        if (firstMsg) return "Data tidak valid";
      }

      if (raw) {
        // kalau ada raw tapi tidak dianggap penting, tetap generic
        return fallback;
      }

      return fallback;
    }

    // non-JSON
    const text = (await res.text().catch(() => "")) || "";
    const important = pickImportantMessage(text);
    if (important) return important;

    // beberapa status common
    if (res.status === 409) return "Email sudah terdaftar";
    if (res.status === 422 || res.status === 400) return "Data tidak valid";

    return fallback;
  } catch {
    return fallback;
  }
}

async function postRegistration(input: RegisterInput) {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  const url = `${base}/api/v1/auth/register`;

  const payload: ApiPayload = {
    full_name: input.fullName,
    email: input.email,
    program: String(input.program),
    student_id: input.studentId,
    intake_year: Number(input.intakeYear),
    motivation: input.motivation,
  };

  let res: Response;
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 30000);
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: ac.signal,
    });
    clearTimeout(t);
  } catch (e: any) {
    if (e?.name === "AbortError")
      throw new Error("Koneksi timeout, coba lagi.");
    throw new Error("Tidak dapat terhubung ke server.");
  }

  if (!res.ok) {
    const msg = await extractError(res);
    throw new Error(msg);
  }

  try {
    return (await res.json()) as unknown;
  } catch {
    return {};
  }
}

type UseRegisterOpts = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export function useRegisterRegistration(opts?: UseRegisterOpts) {
  const mutation = useMutation({
    mutationFn: postRegistration,
    onSuccess: () => {
      toast.success(
        "Pendaftaran berhasil. Cek email untuk verifikasi dan langkah selanjutnya."
      );
      opts?.onSuccess?.();
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error && err.message
          ? err.message
          : "Gagal melakukan pendaftaran";
      toast.error(msg);
      opts?.onError?.(err);
    },
  });

  return {
    register: (input: RegisterInput) => mutation.mutate(input),
    isPending: mutation.isPending,
  };
}
