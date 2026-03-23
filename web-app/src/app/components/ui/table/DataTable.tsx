"use client";

import * as React from "react";
import { cn } from "../utils";
import { Table } from "./Table";
import { TableBody } from "./TableBody";
import { TableCell } from "./TableCell";
import { TableHead } from "./TableHead";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";

type DataTableAlign = "left" | "center" | "right";

const alignClassMap: Record<DataTableAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const defaultHeaderClassName = "px-6 py-4 text-sm font-semibold";
const defaultCellClassName = "px-6 py-2";

export interface DataTableHeaderContext<T> {
  column: DataTableColumn<T>;
  columnIndex: number;
}

export interface DataTableCellContext<T> {
  column: DataTableColumn<T>;
  row: T;
  rowIndex: number;
  value: React.ReactNode;
}

export interface DataTableColumn<T> {
  id?: string;
  header: React.ReactNode | ((context: DataTableHeaderContext<T>) => React.ReactNode);
  accessorKey?: keyof T;
  cell?: (context: DataTableCellContext<T>) => React.ReactNode;
  align?: DataTableAlign;
  width?: string;
  headerClassName?: string;
  cellClassName?: string | ((context: DataTableCellContext<T>) => string | undefined);
}

interface DataTableProps<T> {
  data: T[];
  columns: Array<DataTableColumn<T>>;
  rowKey?: keyof T | ((row: T, index: number) => React.Key);
  emptyMessage?: React.ReactNode;
  className?: string;
  tableClassName?: string;
  headerRowClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string | undefined);
  onRowClick?: (row: T, index: number, event: React.MouseEvent<HTMLTableRowElement>) => void;
  emptyStateClassName?: string;
}

function resolveRowKey<T>(row: T, index: number, rowKey?: DataTableProps<T>["rowKey"]) {
  if (typeof rowKey === "function") {
    return rowKey(row, index);
  }

  if (rowKey) {
    return row[rowKey] as React.Key;
  }

  return index;
}

function renderHeader<T>(column: DataTableColumn<T>, columnIndex: number) {
  return typeof column.header === "function"
    ? column.header({ column, columnIndex })
    : column.header;
}

function getCellValue<T>(row: T, column: DataTableColumn<T>) {
  if (!column.accessorKey) {
    return undefined;
  }

  return row[column.accessorKey] as React.ReactNode;
}

function DataTable<T>({
  data,
  columns,
  rowKey,
  emptyMessage = "No data found.",
  className,
  tableClassName,
  headerRowClassName,
  rowClassName,
  onRowClick,
  emptyStateClassName,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow className={cn("border-b border-black/10 hover:bg-transparent", headerRowClassName)}>
            {columns.map((column, columnIndex) => (
              <TableHead
                key={column.id ?? String(column.accessorKey ?? columnIndex)}
                className={cn(
                  defaultHeaderClassName,
                  "text-black/60",
                  alignClassMap[column.align ?? "left"],
                  column.headerClassName,
                )}
                style={column.width ? { width: column.width } : undefined}
              >
                {renderHeader(column, columnIndex)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length === 0 ? (
            <TableRow className="border-black/10">
              <TableCell
                colSpan={columns.length || 1}
                className={cn("py-10 text-center text-black/60", emptyStateClassName)}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={resolveRowKey(row, rowIndex, rowKey)}
                className={cn(
                  "border-b border-black/10 hover:bg-black/5",
                  onRowClick && "cursor-pointer",
                  typeof rowClassName === "function" ? rowClassName(row, rowIndex) : rowClassName,
                )}
                onClick={onRowClick ? (event) => onRowClick(row, rowIndex, event) : undefined}
              >
                {columns.map((column, columnIndex) => {
                  const value = getCellValue(row, column);
                  const context = {
                    column,
                    row,
                    rowIndex,
                    value,
                  };

                  return (
                    <TableCell
                      key={column.id ?? String(column.accessorKey ?? columnIndex)}
                      className={cn(
                        defaultCellClassName,
                        alignClassMap[column.align ?? "left"],
                        typeof column.cellClassName === "function"
                          ? column.cellClassName(context)
                          : column.cellClassName,
                      )}
                    >
                      {column.cell ? column.cell(context) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export { DataTable };
