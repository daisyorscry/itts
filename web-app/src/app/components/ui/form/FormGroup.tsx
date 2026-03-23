import { type ReactNode } from "react";

interface FormGroupProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormGroup({
  children,
  columns = 1,
  className = "",
}: FormGroupProps) {
  const gridCols = {
    1: "",
    2: "grid grid-cols-1 md:grid-cols-2 gap-4",
    3: "grid grid-cols-1 md:grid-cols-3 gap-4",
    4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
  };

  return (
    <fieldset
      className={`border-0 p-0 m-0 my-5 ${gridCols[columns]} ${className}`}
    >
      {children}
    </fieldset>
  );
}