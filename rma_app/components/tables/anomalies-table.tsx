"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, AlertTriangle, AlertCircle, AlertOctagon, X } from "lucide-react"
import { Anomaly } from "@/lib/types"
import { DataTable, FilterableColumn } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Area, AreaChart, ComposedChart, Cell, ScatterChart, Scatter } from "recharts"
import { useState, useMemo } from "react"

const getSeverityBadge = (severity: string) => {
  const config = {
    Critical: { color: "bg-red-600 hover:bg-red-700", icon: AlertOctagon },
    High: { color: "bg-orange-500 hover:bg-orange-600", icon: AlertCircle },
    Medium: { color: "bg-yellow-500 hover:bg-yellow-600", icon: AlertTriangle },
    Normal: { color: "bg-green-500 hover:bg-green-600", icon: AlertTriangle }
  }
  const { color, icon: Icon } = config[severity as keyof typeof config] || config.Normal
  return (
    <Badge className={`${color} text-white`}>
      <Icon className="mr-1 h-3 w-3" />
      {severity}
    </Badge>
  )
}

const columns: ColumnDef<Anomaly>[] = [
  {
    accessorKey: "severity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Severity
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => getSeverityBadge(row.getValue("severity")),
  },
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
        Week Of
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => new Date(row.getValue("rma_date")).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  },
  {
    accessorKey: "rma_count",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        RMAs
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-red-600">{row.getValue("rma_count")}</span>
    ),
  },
  {
    accessorKey: "rolling_mean",
    header: "Baseline",
    cell: ({ row }) => parseFloat(row.getValue("rolling_mean")).toFixed(1),
  },
  {
    accessorKey: "deviation",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Deviation
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dev = parseFloat(row.getValue("deviation"))
      return <span className="font-medium text-orange-600">+{dev.toFixed(1)}</span>
    },
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
    cell: ({ row }) => {
      const z = parseFloat(row.getValue("z_score"))
      const color = z >= 3 ? 'text-red-600' : z >= 2 ? 'text-orange-600' : 'text-yellow-600'
      return <span className={`font-semibold ${color}`}>{z.toFixed(2)}</span>
    },
  },
  {
    accessorKey: "consecutive_count",
    header: "Recurring",
    cell: ({ row }) => {
      const count = row.getValue("consecutive_count") as number
      return count > 0 ? (
        <Badge variant="destructive">{count}x</Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
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
    cell: ({ row }) => row.getValue("operator") || <span className="text-muted-foreground">N/A</span>,
  },
]

interface AnomaliesTableProps {
  data: Anomaly[]
  completeData: Anomaly[]
}

export function AnomaliesTable({ data, completeData }: AnomaliesTableProps) {
  const [filteredData, setFilteredData] = useState<Anomaly[]>(completeData)
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [selectedCardType, setSelectedCardType] = useState<string | null>(null)

  // Get min and max dates from complete data
  const dateRange = useMemo(() => {
    const dates = completeData.map(d => new Date(d.rma_date).getTime())
    const minDate = new Date(Math.min(...dates)).toISOString().split('T')[0]
    const maxDate = new Date(Math.max(...dates)).toISOString().split('T')[0]
    return { minDate, maxDate }
  }, [completeData])

  // Apply date filter to the already table-filtered data
  const dateFilteredData = useMemo(() => {
    if (!startDate && !endDate) return filteredData
    
    return filteredData.filter(item => {
      const itemDate = new Date(item.rma_date).getTime()
      const start = startDate ? new Date(startDate).getTime() : -Infinity
      const end = endDate ? new Date(endDate).getTime() : Infinity
      return itemDate >= start && itemDate <= end
    })
  }, [filteredData, startDate, endDate])

  const { summaryStats, chartData } = useMemo(() => {
    // Summary statistics
    const totalSites = new Set(dateFilteredData.map(d => d.site_id)).size
    const criticalCount = dateFilteredData.filter(d => d.severity === 'Critical').length
    const highCount = dateFilteredData.filter(d => d.severity === 'High').length
    const recurringCount = dateFilteredData.filter(d => d.consecutive_count > 0).length

    // Regional breakdown by severity
    const regionSeverityMap = dateFilteredData.reduce((acc, item) => {
      const key = item.region
      if (!acc[key]) acc[key] = { region: key, Critical: 0, High: 0, Medium: 0 }
      if (item.severity === 'Critical') acc[key].Critical++
      if (item.severity === 'High') acc[key].High++
      if (item.severity === 'Medium') acc[key].Medium++
      return acc
    }, {} as Record<string, { region: string; Critical: number; High: number; Medium: number }>)

    const regionData = Object.values(regionSeverityMap).sort((a, b) => 
      (b.Critical + b.High + b.Medium) - (a.Critical + a.High + a.Medium)
    )

    // Timeline with weekly aggregation using COMPLETE data (all severity levels)
    const weeklyMap = dateFilteredData.reduce((acc, item) => {
      const weekKey = item.rma_date.substring(0, 10)
      if (!acc[weekKey]) {
        acc[weekKey] = { 
          week: weekKey, 
          spikes: 0, 
          critical: 0, 
          high: 0, 
          medium: 0,
          normal: 0,
          avg_z_score: 0,
          total_z: 0,
          total_rmas: 0
        }
      }
      acc[weekKey].spikes++
      acc[weekKey].total_z += item.z_score
      acc[weekKey].total_rmas += item.rma_count
      if (item.severity === 'Critical') acc[weekKey].critical++
      else if (item.severity === 'High') acc[weekKey].high++
      else if (item.severity === 'Medium') acc[weekKey].medium++
      else acc[weekKey].normal++
      return acc
    }, {} as Record<string, any>)

    const timelineData = Object.values(weeklyMap)
      .map(week => ({
        ...week,
        avg_z_score: parseFloat((week.total_z / week.spikes).toFixed(2))
      }))
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())

    // Top sites
    const siteMap = dateFilteredData.reduce((acc, item) => {
      if (!acc[item.site_id]) {
        acc[item.site_id] = { 
          site_id: item.site_id, 
          count: 0, 
          max_z: 0, 
          severity: item.severity,
          region: item.region 
        }
      }
      acc[item.site_id].count++
      acc[item.site_id].max_z = Math.max(acc[item.site_id].max_z, item.z_score)
      return acc
    }, {} as Record<string, any>)

    const topSites = Object.values(siteMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      summaryStats: { totalSites, criticalCount, highCount, recurringCount },
      chartData: { regionData, timelineData, topSites }
    }
  }, [dateFilteredData])

  const filterableColumns: FilterableColumn[] = [
    { id: "site_id", title: "Site ID" },
    { 
      id: "severity", 
      title: "Severity", 
      options: ['Critical', 'High', 'Medium', 'Normal'].map(s => ({ label: s, value: s })) 
    },
    { 
      id: "region", 
      title: "Region", 
      options: Array.from(new Set(completeData.map(d => d.region))).map(r => ({ label: r, value: r })) 
    },
    { 
      id: "country", 
      title: "Country", 
      options: Array.from(new Set(completeData.map(d => d.country))).map(c => ({ label: c, value: c })) 
    },
    { 
      id: "site_type", 
      title: "Site Type", 
      options: Array.from(new Set(completeData.map(d => d.site_type))).map(st => ({ label: st, value: st })) 
    },
  ]

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Date Range Filter</CardTitle>
          <CardDescription>Filter anomalies by week start date</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={dateRange.minDate}
                max={dateRange.maxDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={dateRange.minDate}
                max={dateRange.maxDate}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStartDate("")
                  setEndDate("")
                }}
                disabled={!startDate && !endDate}
              >
                Clear Dates
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const sixMonthsAgo = new Date()
                  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
                  setStartDate(sixMonthsAgo.toISOString().split('T')[0])
                  setEndDate(dateRange.maxDate)
                }}
              >
                Last 6 Months
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const threeMonthsAgo = new Date()
                  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
                  setStartDate(threeMonthsAgo.toISOString().split('T')[0])
                  setEndDate(dateRange.maxDate)
                }}
              >
                Last 3 Months
              </Button>
            </div>
          </div>
          {(startDate || endDate) && (
            <p className="text-sm text-muted-foreground mt-3">
              Showing: {startDate || 'Beginning'} to {endDate || 'End'} ({dateFilteredData.length.toLocaleString()} of {completeData.length.toLocaleString()} records)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedCardType('affected')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Affected Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summaryStats.totalSites}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {dateFilteredData.filter(d => d.severity !== 'Normal').length} anomalous / {dateFilteredData.length} total weeks
            </p>
            <p className="text-xs text-blue-600 mt-2">Click for details →</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedCardType('critical')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Spikes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{summaryStats.criticalCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Require immediate attention
            </p>
            <p className="text-xs text-blue-600 mt-2">Click for details →</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedCardType('high')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{summaryStats.highCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Need investigation
            </p>
            <p className="text-xs text-blue-600 mt-2">Click for details →</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedCardType('recurring')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recurring Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{summaryStats.recurringCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Persistent problems
            </p>
            <p className="text-xs text-blue-600 mt-2">Click for details →</p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={selectedCardType !== null} onOpenChange={(open) => !open && setSelectedCardType(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCardType === 'affected' && 'Affected Sites Details'}
              {selectedCardType === 'critical' && 'Critical Spikes Details'}
              {selectedCardType === 'high' && 'High Priority Details'}
              {selectedCardType === 'recurring' && 'Recurring Issues Details'}
            </DialogTitle>
            <DialogDescription>
              {selectedCardType === 'affected' && `${summaryStats.totalSites} sites with ${dateFilteredData.length} total anomalous weeks`}
              {selectedCardType === 'critical' && `${summaryStats.criticalCount} critical spikes requiring immediate attention (z-score ≥ 3.0)`}
              {selectedCardType === 'high' && `${summaryStats.highCount} high priority anomalies needing investigation (z-score ≥ 2.0)`}
              {selectedCardType === 'recurring' && `${summaryStats.recurringCount} sites with persistent issues (consecutive spikes within 14 days)`}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedCardType === 'affected' && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {chartData.regionData.map((region) => (
                    <Card key={region.region}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{region.region}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{region.Critical + region.High + region.Medium}</div>
                        <div className="text-xs space-y-1 mt-2">
                          <div className="flex justify-between">
                            <span className="text-red-600">Critical:</span>
                            <span className="font-semibold">{region.Critical}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-600">High:</span>
                            <span className="font-semibold">{region.High}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-600">Medium:</span>
                            <span className="font-semibold">{region.Medium}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Top 15 Affected Sites</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Site ID</th>
                          <th className="px-4 py-2 text-left">Region</th>
                          <th className="px-4 py-2 text-right">Anomalies</th>
                          <th className="px-4 py-2 text-right">Max Z-Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.topSites.slice(0, 15).map((site, idx) => (
                          <tr key={site.site_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 font-mono">{site.site_id}</td>
                            <td className="px-4 py-2">{site.region}</td>
                            <td className="px-4 py-2 text-right font-semibold">{site.count}</td>
                            <td className="px-4 py-2 text-right font-semibold text-red-600">{site.max_z.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            {(selectedCardType === 'critical' || selectedCardType === 'high') && (
              <div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Site ID</th>
                        <th className="px-4 py-2 text-left">Week</th>
                        <th className="px-4 py-2 text-left">Region</th>
                        <th className="px-4 py-2 text-right">RMAs</th>
                        <th className="px-4 py-2 text-right">Z-Score</th>
                        <th className="px-4 py-2 text-right">Deviation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateFilteredData
                        .filter(d => d.severity === (selectedCardType === 'critical' ? 'Critical' : 'High'))
                        .slice(0, 20)
                        .map((anomaly, idx) => (
                          <tr key={`${anomaly.site_id}-${anomaly.rma_date}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 font-mono">{anomaly.site_id}</td>
                            <td className="px-4 py-2">{new Date(anomaly.rma_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td className="px-4 py-2">{anomaly.region}</td>
                            <td className="px-4 py-2 text-right font-semibold text-red-600">{anomaly.rma_count}</td>
                            <td className="px-4 py-2 text-right font-semibold">{anomaly.z_score.toFixed(2)}</td>
                            <td className="px-4 py-2 text-right">+{anomaly.deviation.toFixed(1)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {dateFilteredData.filter(d => d.severity === (selectedCardType === 'critical' ? 'Critical' : 'High')).length > 20 && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Showing top 20 of {dateFilteredData.filter(d => d.severity === (selectedCardType === 'critical' ? 'Critical' : 'High')).length} total
                  </p>
                )}
              </div>
            )}
            {selectedCardType === 'recurring' && (
              <div>
                <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>Recurring issues</strong> are sites that have experienced multiple anomalous weeks within 14 days of each other, 
                    indicating persistent or systemic problems that need root cause analysis.
                  </p>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Site ID</th>
                        <th className="px-4 py-2 text-left">Region</th>
                        <th className="px-4 py-2 text-left">Country</th>
                        <th className="px-4 py-2 text-left">Site Type</th>
                        <th className="px-4 py-2 text-right">Consecutive Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dateFilteredData
                        .filter(d => d.consecutive_count > 0)
                        .reduce((acc: Anomaly[], curr) => {
                          if (!acc.find(a => a.site_id === curr.site_id)) {
                            acc.push(curr)
                          }
                          return acc
                        }, [])
                        .slice(0, 20)
                        .map((anomaly, idx) => (
                          <tr key={anomaly.site_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 font-mono">{anomaly.site_id}</td>
                            <td className="px-4 py-2">{anomaly.region}</td>
                            <td className="px-4 py-2">{anomaly.country}</td>
                            <td className="px-4 py-2">{anomaly.site_type}</td>
                            <td className="px-4 py-2 text-right">
                              <Badge variant="destructive">{anomaly.consecutive_count}x</Badge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Spike Timeline - Full Width */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly RMA Timeline</CardTitle>
          <CardDescription>Complete weekly RMA activity with severity levels - showing all sites and anomaly detection</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData.timelineData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis yAxisId="left" label={{ value: 'Site Count', angle: -90, position: 'insideLeft', fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Avg Z-Score', angle: 90, position: 'insideRight', fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px', padding: '10px' }}
                formatter={(value: any, name: string) => {
                  if (name === 'Avg Z-Score') return [value.toFixed(2), name]
                  return [value, name]
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="critical" stackId="a" fill="#dc2626" name="Critical Spikes" />
              <Bar yAxisId="left" dataKey="high" stackId="a" fill="#f97316" name="High Spikes" />
              <Bar yAxisId="left" dataKey="medium" stackId="a" fill="#facc15" name="Medium Spikes" />
              <Bar yAxisId="left" dataKey="normal" stackId="a" fill="#22c55e" name="Normal Activity" />
              <Line yAxisId="right" type="monotone" dataKey="avg_z_score" stroke="#8b5cf6" strokeWidth={3} name="Avg Z-Score" dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Secondary Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Regional Severity Breakdown</CardTitle>
            <CardDescription>Anomalies by region and severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.regionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis type="number" />
                <YAxis dataKey="region" type="category" width={60} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Critical" stackId="a" fill="#dc2626" />
                <Bar dataKey="High" stackId="a" fill="#f97316" />
                <Bar dataKey="Medium" stackId="a" fill="#facc15" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 Sites with Most Anomalies</CardTitle>
            <CardDescription>Sites experiencing the highest number of RMA spikes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.topSites} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="site_id" tick={{ fontSize: 11 }} />
                <YAxis label={{ value: 'Spike Count', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                          <p className="font-semibold">{data.site_id}</p>
                          <p className="text-sm text-gray-600">{data.region}</p>
                          <p className="text-sm">Spikes: <span className="font-semibold">{data.count}</span></p>
                          <p className="text-sm">Max Z-Score: <span className="font-semibold">{data.max_z.toFixed(2)}</span></p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={completeData} filterableColumns={filterableColumns} onFilteredDataChange={setFilteredData} />
    </div>
  )
}
