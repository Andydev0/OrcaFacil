import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export interface DataTableColumn<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => any);
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  onSearch?: (query: string) => void;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  className?: string;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  onSearch,
  onRowClick,
  searchPlaceholder = "Buscar...",
  className = "",
  emptyState
}: DataTableProps<T>) {
  // Função para obter o valor da célula
  const getValue = (row: T, column: DataTableColumn<T>) => {
    if (typeof column.accessorKey === "function") {
      return column.accessorKey(row);
    } else {
      return row[column.accessorKey as keyof T];
    }
  };

  // Função para renderizar a célula
  const renderCell = (row: T, column: DataTableColumn<T>) => {
    if (column.cell) {
      return column.cell(row);
    } else {
      const value = getValue(row, column);
      return value !== null && value !== undefined ? String(value) : "-";
    }
  };

  return (
    <div className={className}>
      {data.length === 0 && emptyState ? (
        emptyState
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>{column.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nenhum resultado encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={onRowClick ? "cursor-pointer hover:bg-accent" : ""}
                  >
                    {columns.map((column, columnIndex) => (
                      <TableCell key={columnIndex}>
                        {renderCell(row, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}