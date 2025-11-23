"use client";

import type React from "react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterRegistration } from "@/feature/registration";
import {
  HiOutlineMail,
  HiOutlineUser,
  HiOutlineBookOpen,
  HiOutlineIdentification,
  HiOutlineCalendar,
} from "react-icons/hi";
import Dropdown, { Option } from "@/components/ui/Dropdown";

const schema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  program: z.enum(["networking", "devsecops", "programming"]),
  studentId: z.coerce
    .number()
    .int("Harus angka")
    .min(1, "NIM minimal 1")
    .refine((val) => String(val).length >= 3, {
      message: "NIM minimal 3 digit",
    }),
  intakeYear: z.coerce
    .number()
    .int()
    .min(2000, "Min 2000")
    .max(2100, "Max 2100"),
  motivation: z.string().min(10, "Motivasi minimal 10 karakter"),
});


type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>; // intakeYear: number

const programOptions: Option<"networking" | "devsecops" | "programming">[] = [
  { value: "networking", label: "Networking" },
  { value: "devsecops", label: "DevSecOps" },
  { value: "programming", label: "Programming" },
];

// Input helper dgn ikon
function InputWithIcon({
  icon: Icon,
  invalid = false,
  className = "",
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  invalid?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/60" />
      <input
        {...props}
        aria-invalid={invalid || undefined}
        className={`input ${
          invalid ? "ring-1 ring-red-500 focus:ring-red-500" : ""
        } ${className}`}
        style={{ ...(style as any), ["--inset-left" as any]: "2.25rem" }}
      />
    </div>
  );
}

export default function RegisterDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      fullName: "",
      email: "",
      program: "" as any,
      studentId: "",
      intakeYear: "" as any,
      motivation: "",
    },
  });

  const { register: submitRegister, isPending } = useRegisterRegistration({
    onSuccess: () => {
      reset();
      onClose?.();
    },
  });

  const onValid = (values: FormInput) => {
    const parsed = schema.parse(values); 

    submitRegister(parsed as any);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    if (open) {
      window.addEventListener("keydown", onKey);
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("modal-open");
    };
  }, [open, onClose]);

  const err = useMemo(
    () => (name: keyof FormValues) =>
      errors[name as keyof FormInput]?.message
        ? String(errors[name as keyof FormInput]?.message)
        : "",
    [errors]
  );

  if (!open) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-title"
        className="modal-shell"
      >
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <form className="m-0" onSubmit={(e) => e.preventDefault()}>
            <header className="border-b border-border p-5">
              <h3 id="register-title" className="text-lg font-semibold">
                Form Pendaftaran Anggota
              </h3>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid gap-3">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">Nama Lengkap</span>
                  <InputWithIcon
                    icon={HiOutlineUser}
                    placeholder="Nama Lengkap"
                    {...register("fullName")}
                    autoComplete="name"
                    invalid={!!errors.fullName}
                    aria-describedby={
                      errors.fullName ? "err-fullName" : undefined
                    }
                  />
                  {err("fullName") && (
                    <small id="err-fullName" className="text-sm text-red-600">
                      {err("fullName")}
                    </small>
                  )}
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">Email Kampus</span>
                  <InputWithIcon
                    icon={HiOutlineMail}
                    placeholder="nama@itts.ac.id"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    {...register("email")}
                    invalid={!!errors.email}
                    aria-describedby={errors.email ? "err-email" : undefined}
                  />
                  {err("email") && (
                    <small id="err-email" className="text-sm text-red-600">
                      {err("email")}
                    </small>
                  )}
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">Pilih Program</span>
                  <Controller
                    name="program"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <Dropdown
                          id="program"
                          value={field.value as any}
                          onChange={field.onChange}
                          options={programOptions}
                          placeholder="-- pilih --"
                          leftIcon={HiOutlineBookOpen}
                          aria-describedby={
                            fieldState.error ? "err-program" : undefined
                          }
                        />
                        {fieldState.error && (
                          <small
                            id="err-program"
                            className="text-sm text-red-600"
                          >
                            {fieldState.error.message}
                          </small>
                        )}
                      </>
                    )}
                  />
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px]">
                  <label className="grid gap-1">
                    <span className="text-sm font-medium">NIM</span>
                    <InputWithIcon
                      icon={HiOutlineIdentification}
                      placeholder="Contoh: 2312345"
                      autoComplete="off"
                      {...register("studentId")}
                      invalid={!!errors.studentId}
                      aria-describedby={
                        errors.studentId ? "err-studentId" : undefined
                      }
                    />
                    {err("studentId") && (
                      <small
                        id="err-studentId"
                        className="text-sm text-red-600"
                      >
                        {err("studentId")}
                      </small>
                    )}
                  </label>

                  <label className="grid gap-1">
                    <span className="text-sm font-medium">Angkatan</span>
                    <InputWithIcon
                      icon={HiOutlineCalendar}
                      placeholder="2025"
                      type="number"
                      inputMode="numeric"
                      {...register("intakeYear")}
                      invalid={!!errors.intakeYear}
                      aria-describedby={
                        errors.intakeYear ? "err-intakeYear" : undefined
                      }
                    />
                    {err("intakeYear") && (
                      <small
                        id="err-intakeYear"
                        className="text-sm text-red-600"
                      >
                        {err("intakeYear")}
                      </small>
                    )}
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">
                    Motivasi Bergabung
                  </span>
                  <textarea
                    {...register("motivation")}
                    placeholder="Ceritakan motivasi kamu..."
                    rows={4}
                    className={`textarea ${
                      errors.motivation
                        ? "ring-1 ring-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    aria-invalid={errors.motivation ? true : undefined}
                    aria-describedby={
                      errors.motivation ? "err-motivation" : undefined
                    }
                  />
                  {err("motivation") && (
                    <small id="err-motivation" className="text-sm text-red-600">
                      {err("motivation")}
                    </small>
                  )}
                </label>
              </div>
            </div>

            <footer className="flex justify-end gap-2 border-t border-border p-5">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-outline"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(onValid)()}
                disabled={isSubmitting || isPending}
                className="btn btn-primary disabled:opacity-60"
              >
                {isPending ? "Mengirim..." : "Daftar"}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </>
  );
}
