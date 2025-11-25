"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { SKUHealth } from "@/lib/types"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"

const columns: ColumnDef<SKUHealth>[] = [
  {
    accessorKey: "sku_id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        SKU ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
    accessorKey: "total_returns",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Total Returns
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "avg_inventory",
    header: "Avg Inventory",
    cell: ({ row }) => parseFloat(row.getValue("avg_inventory")).toFixed(2),
  },
  {
    accessorKey: "total_shipped_qty",
    header: "Total Shipped",
  },
  {
    accessorKey: "failure_rate",
    header: "Failure Rate",
    cell: ({ row }) =>
      `${(parseFloat(row.getValue("failure_rate")) * 100).toFixed(2)}%`,
  },
  {
    accessorKey: "unit_weight_kg",
    header: "Weight (kg)",
    cell: ({ row }) => parseFloat(row.getValue("unit_weight_kg")).toFixed(2),
  },
  {
    accessorKey: "unit_volume_m3",
    header: "Volume (m³)",
    cell: ({ row }) => parseFloat(row.getValue("unit_volume_m3")).toFixed(4),
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
  {
    accessorKey: "supplier_nominal_lead_time_days",
    header: "Lead Time (days)",
  },
]

interface SKUHealthTableProps {
  data: SKUHealth[]
}

export function SKUHealthTable({ data }: SKUHealthTableProps) {
  return <DataTable columns={columns} data={data} filterColumn="sku_id" filterPlaceholder="Filter by SKU ID..." />
}
