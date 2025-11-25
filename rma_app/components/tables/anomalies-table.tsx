"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Anomaly } from "@/lib/types"
import { DataTable, FilterableColumn } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts"
import { useState, useMemo } from "react"

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
  const [filteredData, setFilteredData] = useState<Anomaly[]>(data)

  const chartData = useMemo(() => {
    const regionCounts = filteredData.reduce((acc, item) => {
      acc[item.region] = (acc[item.region] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const timelineMap = filteredData.reduce((acc, item) => {
      const date = item.rma_date.substring(0, 10)
      if (!acc[date]) {
        acc[date] = { z_score: 0, rma_count: 0, count: 0 }
      }
      acc[date].z_score += Number(item.z_score) || 0
      acc[date].rma_count += Number(item.rma_count) || 0
      acc[date].count += 1
      return acc
    }, {} as Record<string, { z_score: number; rma_count: number; count: number }>)

    const timelineData = Object.entries(timelineMap)
      .map(([date, stats]) => ({
        date,
        z_score: stats.count > 0 ? parseFloat((stats.z_score / stats.count).toFixed(2)) : 0,
        rma_count: stats.count > 0 ? Math.round(stats.rma_count / stats.count) : 0
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return {
      regions: Object.entries(regionCounts).map(([name, value]) => ({ name, value })),
      timeline: timelineData
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
            <CardTitle>Z-Score Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="z_score" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Anomalies by Region</CardTitle>
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
