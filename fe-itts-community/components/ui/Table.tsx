// components/table/Primitives.tsx
import React from "react";

export function Table({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`overflow-x-auto rounded-md  ${className}`}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-surface/60">{children}</thead>;
}

export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
  return <tr className={` ${className}`}>{children}</tr>;
}

export function Th({
  children,
  className = "",
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}) {
  const alignCls =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th className={`px-3 py-2 text-xs font-medium uppercase ${alignCls} ${className}`}>
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
  align = "left",
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
  colSpan?: number;
}) {
  const alignCls =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <td className={`px-3 py-3 align-top ${alignCls} ${className}`} colSpan={colSpan}>
      {children}
    </td>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
}: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <Tr key={i}>
          {Array.from({ length: cols }).map((__, j) => (
            <Td key={j}>
              <div className="h-4 w-3/5 rounded bg-surface animate-pulse" />
            </Td>
          ))}
        </Tr>
      ))}
    </>
  );
}


export function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  className = "",
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      <button className="btn btn-outline" disabled={page <= 1} onClick={onPrev}>
        Prev
      </button>
      <span className="text-sm opacity-70">
        {page} / {Math.max(1, totalPages)}
      </span>
      <button className="btn btn-outline" disabled={page >= totalPages} onClick={onNext}>
        Next
      </button>
    </div>
  );
}


export type Accessor<T> = keyof T | ((row: T) => any);

export type Column<T> = {
  key: string;                 // unique key per kolom
  header: string | React.ReactNode;
  accessor?: Accessor<T>;      // jika tidak ada, gunakan 'render'
  render?: (row: T, idx: number) => React.ReactNode;
  width?: string;              // mis. "200px" atau "20%"
  align?: "left" | "center" | "right";
  sortable?: boolean;          // client-side sort
  sortFn?: (a: T, b: T) => number; // custom comparator
};

export type DataTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyText?: string;
  skeletonRows?: number;
};

export function getValue<T>(row: T, acc?: Accessor<T>) {
  if (!acc) return undefined;
  if (typeof acc === "function") return acc(row);
  return (row as any)[acc];
}


