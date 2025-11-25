"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { SiteEnriched } from "@/lib/types"
import { DataTable, FilterableColumn } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useState, useMemo } from "react"

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
  const [filteredData, setFilteredData] = useState<SiteEnriched[]>(data)

  const chartData = useMemo(() => {
    const reasonCodes = ['DOA', 'FIRMWARE', 'INTERMITTENT', 'MECH_DAMAGE', 'NO_POWER', 'OTHER', 'OVERHEAT', 'RF_FAULT'] as const
    const totals = reasonCodes.map(code => ({
      name: code,
      value: filteredData.reduce((sum, site) => sum + (site[code] || 0), 0)
    })).filter(item => item.value > 0)

    const regionCounts = filteredData.reduce((acc, item) => {
      acc[item.region] = (acc[item.region] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      reasons: totals,
      regions: Object.entries(regionCounts).map(([name, value]) => ({ name, value }))
    }
  }, [filteredData])

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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Issues by Reason Code</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.reasons}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sites by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.regions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <DataTable columns={columns} data={data} filterableColumns={filterableColumns} onFilteredDataChange={setFilteredData} />
    </div>
  )
}
