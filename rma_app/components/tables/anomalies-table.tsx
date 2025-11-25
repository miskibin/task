"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Anomaly } from "@/lib/types"
import { DataTable, FilterableColumn } from "@/components/data-table"
import { Button } from "@/components/ui/button"

const columns: ColumnDef<Anomaly>[] = [
  {
    accessorKey: "site_id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Site ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "rma_date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        RMA Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "rma_count",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        RMA Count
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "rolling_mean",
    header: "Rolling Mean",
    cell: ({ row }) => parseFloat(row.getValue("rolling_mean")).toFixed(2),
  },
  {
    accessorKey: "rolling_std",
    header: "Rolling Std Dev",
    cell: ({ row }) => parseFloat(row.getValue("rolling_std")).toFixed(2),
  },
  {
    accessorKey: "z_score",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Z-Score
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => parseFloat(row.getValue("z_score")).toFixed(2),
  },
  {
    accessorKey: "region",
    header: "Region",
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "site_type",
    header: "Site Type",
  },
]

interface AnomaliesTableProps {
  data: Anomaly[]
}

export function AnomaliesTable({ data }: AnomaliesTableProps) {
  const filterableColumns: FilterableColumn[] = [
    { id: "site_id", title: "Site ID" },
    { 
      id: "region", 
      title: "Region", 
      options: Array.from(new Set(data.map(d => d.region))).map(r => ({ label: r, value: r })) 
    },
    { 
      id: "country", 
      title: "Country", 
      options: Array.from(new Set(data.map(d => d.country))).map(c => ({ label: c, value: c })) 
    },
    { 
      id: "site_type", 
      title: "Site Type", 
      options: Array.from(new Set(data.map(d => d.site_type))).map(st => ({ label: st, value: st })) 
    },
  ]

  return <DataTable columns={columns} data={data} filterableColumns={filterableColumns} />
}
