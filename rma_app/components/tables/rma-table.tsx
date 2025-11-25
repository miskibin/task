"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { RMAEnriched } from "@/lib/types"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"

const columns: ColumnDef<RMAEnriched>[] = [
  {
    accessorKey: "rma_id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        RMA ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "sku_id",
    header: "SKU ID",
  },
  {
    accessorKey: "site_id",
    header: "Site ID",
  },
  {
    accessorKey: "reason_code",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Reason Code
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
    accessorKey: "under_warranty",
    header: "Under Warranty",
    cell: ({ row }) => (row.getValue("under_warranty") ? "Yes" : "No"),
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "technology",
    header: "Technology",
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
  {
    accessorKey: "std_cost_usd",
    header: () => <div className="text-right">Cost (USD)</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("std_cost_usd"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
]

interface RMATableProps {
  data: RMAEnriched[]
}

export function RMATable({ data }: RMATableProps) {
  return <DataTable columns={columns} data={data} filterColumn="sku_id" filterPlaceholder="Filter by SKU ID..." />
}
