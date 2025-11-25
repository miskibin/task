"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { SKUHealth } from "@/lib/types"
import { DataTable, FilterableColumn } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useState, useMemo } from "react"

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
  const [filteredData, setFilteredData] = useState<SKUHealth[]>(data)

  const chartData = useMemo(() => {
    const topSKUs = filteredData
      .sort((a, b) => b.failure_rate - a.failure_rate)
      .slice(0, 10)
      .map(item => ({
        name: item.sku_id.substring(0, 8),
        failure_rate: parseFloat((item.failure_rate * 100).toFixed(2))
      }))

    const vendorStats = filteredData.reduce((acc, item) => {
      if (!acc[item.vendor]) {
        acc[item.vendor] = { total_returns: 0, count: 0 }
      }
      acc[item.vendor].total_returns += Number(item.total_returns) || 0
      acc[item.vendor].count += 1
      return acc
    }, {} as Record<string, { total_returns: number; count: number }>)

    const vendors = Object.entries(vendorStats).map(([name, stats]) => ({
      name,
      avg_returns: stats.count > 0 ? Math.round(stats.total_returns / stats.count) : 0
    }))

    return { topSKUs, vendors }
  }, [filteredData])

  const filterableColumns: FilterableColumn[] = [
    { id: "sku_id", title: "SKU ID" },
    { 
      id: "vendor", 
      title: "Vendor", 
      options: Array.from(new Set(data.map(d => d.vendor))).map(v => ({ label: v, value: v })) 
    },
    { 
      id: "category", 
      title: "Category", 
      options: Array.from(new Set(data.map(d => d.category))).map(c => ({ label: c, value: c })) 
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
            <CardTitle>Top 10 SKUs by Failure Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.topSKUs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="failure_rate" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Returns by Vendor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.vendors}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg_returns" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <DataTable columns={columns} data={data} filterableColumns={filterableColumns} onFilteredDataChange={setFilteredData} />
    </div>
  )
}
