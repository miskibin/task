"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { RMAEnriched } from "@/lib/types"
import { DataTable, FilterableColumn } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { useState, useMemo } from "react"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1']

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
  const [filteredData, setFilteredData] = useState<RMAEnriched[]>(data)

  const chartData = useMemo(() => {
    const reasonCounts = filteredData.reduce((acc, item) => {
      const reason = item.reason_code || 'UNKNOWN'
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const vendorCounts = filteredData.reduce((acc, item) => {
      const vendor = item.vendor || 'UNKNOWN'
      acc[vendor] = (acc[vendor] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const reasons = Object.entries(reasonCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const vendors = Object.entries(vendorCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    return { reasons, vendors }
  }, [filteredData])

  const filterableColumns: FilterableColumn[] = [
    { id: "sku_id", title: "SKU ID" },
    { id: "site_id", title: "Site ID" },
    { 
      id: "reason_code", 
      title: "Reason Code", 
      options: Array.from(new Set(data.map(d => d.reason_code))).map(code => ({ label: code, value: code })) 
    },
    { 
      id: "vendor", 
      title: "Vendor", 
      options: Array.from(new Set(data.map(d => d.vendor))).map(v => ({ label: v, value: v })) 
    },
    { 
      id: "region", 
      title: "Region", 
      options: Array.from(new Set(data.map(d => d.region))).map(r => ({ label: r, value: r })) 
    },
    { 
      id: "technology", 
      title: "Technology", 
      options: Array.from(new Set(data.map(d => d.technology))).map(t => ({ label: t, value: t })) 
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>RMAs by Reason Code</CardTitle>
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
            <CardTitle>RMAs by Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData.vendors} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {chartData.vendors.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <DataTable columns={columns} data={data} filterableColumns={filterableColumns} onFilteredDataChange={setFilteredData} />
    </div>
  )
}
