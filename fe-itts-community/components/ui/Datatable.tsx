// components/table/DataTable.tsx
"use client";

import React, { useMemo, useState } from "react";
import {
  Column,
  DataTableProps,
  getValue,
  Table,
  TableSkeleton,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "./Table";
import { motion, AnimatePresence } from "framer-motion";

function sortData<T>(rows: T[], col: Column<T> | null, dir: "asc" | "desc") {
  if (!col || (!col.sortable && !col.sortFn)) return rows;
  const sorted = [...rows].sort((a, b) => {
    if (col.sortFn) return col.sortFn(a, b);
    const va = getValue(a, col.accessor);
    const vb = getValue(b, col.accessor);
    if (va == null && vb == null) return 0;
    if (va == null) return -1;
    if (vb == null) return 1;
    if (typeof va === "number" && typeof vb === "number") return va - vb;
    return String(va).localeCompare(String(vb));
  });
  return dir === "asc" ? sorted : sorted.reverse();
}

export default function DataTable<T>({
  data,
  columns,
  loading,
  emptyText = "Tidak ada data",
  skeletonRows = 5,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sortCol = useMemo(
    () => columns.find((c) => c.key === sortKey) || null,
    [columns, sortKey]
  );

  const rows = useMemo(
    () => sortData(data, sortCol, sortDir),
    [data, sortCol, sortDir]
  );

  return (
    <Table className="shadow-sm">
      <Thead>
        <Tr>
          {columns.map((c) => {
            const clickable = c.sortable || c.sortFn;
            const widthStyle = c.width ? { width: c.width } : undefined;
            const isActive = c.key === sortKey;

            return (
              <Th
                key={c.key}
                align={c.align}
                className={`bg-surface/80 ${
                  clickable
                    ? "cursor-pointer select-none hover:bg-surface/90"
                    : ""
                } transition-colors`}
              >
                <div
                  style={widthStyle}
                  onClick={() => {
                    if (!clickable) return;
                    if (sortKey !== c.key) {
                      setSortKey(c.key);
                      setSortDir("asc");
                    } else {
                      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                    }
                  }}
                  className="inline-flex items-center gap-1"
                >
                  <span>{c.header}</span>
                  {clickable && (
                    <motion.span
                      key={c.key + sortDir}
                      initial={{ opacity: 0, rotate: 0 }}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        rotate: sortDir === "asc" ? 0 : 180,
                      }}
                      transition={{ duration: 0.2 }}
                      className={`text-xs ${
                        isActive ? "opacity-70" : "opacity-0"
                      }`}
                    >
                      ▲
                    </motion.span>
                  )}
                </div>
              </Th>
            );
          })}
        </Tr>
      </Thead>

      <Tbody>
        {loading ? (
          <TableSkeleton rows={skeletonRows} cols={columns.length} />
        ) : rows.length === 0 ? (
          <Tr>
            <Td colSpan={columns.length} align="center">
              <div className="py-10 text-center text-sm opacity-70">
                {emptyText}
              </div>
            </Td>
          </Tr>
        ) : (
          <AnimatePresence>
            {rows.map((row, i) => (
              <motion.tr
                key={i}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="border-t border-gray-100 dark:border-gray-800 hover:bg-surface/40 transition-colors"
              >
                {columns.map((c) => {
                  const content =
                    c.render?.(row, i) ??
                    String(getValue(row, c.accessor) ?? "—");
                  return (
                    <Td key={c.key} align={c.align}>
                      {content}
                    </Td>
                  );
                })}
              </motion.tr>
            ))}
          </AnimatePresence>
        )}
      </Tbody>
    </Table>
  );
}
