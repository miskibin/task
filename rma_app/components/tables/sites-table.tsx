"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { SiteEnriched } from "@/lib/types"
import { DataTable, FilterableColumn } from "@/components/data-table"
import { Button } from "@/components/ui/button"

const columns: ColumnDef<SiteEnriched>[] = [
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
    accessorKey: "operator",
    header: "Operator",
  },
  {
    accessorKey: "latitude",
    header: "Latitude",
    cell: ({ row }) => parseFloat(row.getValue("latitude")).toFixed(4),
  },
  {
    accessorKey: "longitude",
    header: "Longitude",
    cell: ({ row }) => parseFloat(row.getValue("longitude")).toFixed(4),
  },
  {
    accessorKey: "DOA",
    header: "DOA",
  },
  {
    accessorKey: "FIRMWARE",
    header: "Firmware",
  },
  {
    accessorKey: "INTERMITTENT",
    header: "Intermittent",
  },
  {
    accessorKey: "MECH_DAMAGE",
    header: "Mech Damage",
  },
  {
    accessorKey: "NO_POWER",
    header: "No Power",
  },
  {
    accessorKey: "OTHER",
    header: "Other",
  },
  {
    accessorKey: "OVERHEAT",
    header: "Overheat",
  },
  {
    accessorKey: "RF_FAULT",
    header: "RF Fault",
  },
]

interface SitesTableProps {
  data: SiteEnriched[]
}

export function SitesTable({ data }: SitesTableProps) {
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
