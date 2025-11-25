"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"
import type { ParseResult } from "papaparse"
import { RMAEnriched } from "@/lib/types"
import { RMATable } from "@/components/tables/rma-table"
import { Loader2 } from "lucide-react"

export function RMADataLoader() {
  const [data, setData] = useState<RMAEnriched[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/rma/rma_enriched.csv")
      if (!response.ok) throw new Error("Failed to load CSV")
      const text = await response.text()

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results: ParseResult<RMAEnriched>) => {
          const parsedData = results.data.map((row: any) => ({
            ...row,
            under_warranty: row.under_warranty === true || row.under_warranty === 'True' || row.under_warranty === '1',
            unit_weight_kg: Number(row.unit_weight_kg) || 0,
            unit_volume_m3: Number(row.unit_volume_m3) || 0,
            std_cost_usd: Number(row.std_cost_usd) || 0,
            supplier_nominal_lead_time_days: Number(row.supplier_nominal_lead_time_days) || 0,
            latitude: Number(row.latitude) || 0,
            longitude: Number(row.longitude) || 0,
          }))
          setData(parsedData as RMAEnriched[])
          setError(null)
        },
        error: (error: Error) => {
          setError(`Failed to parse CSV: ${error.message}`)
        },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
      console.error("Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading RMA data...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>
  }

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">RMA Enriched Data</h1>
        <p className="text-muted-foreground">
          {data.length.toLocaleString()} records
        </p>
      </div>
      <RMATable data={data} />
    </div>
  )
}
