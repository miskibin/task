"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"
import type { ParseResult } from "papaparse"
import { SKUHealth } from "@/lib/types"
import { SKUHealthTable } from "@/components/tables/sku-health-table"
import { Loader2 } from "lucide-react"

export function SKUHealthDataLoader() {
  const [data, setData] = useState<SKUHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/rma/sku_health.csv")
      if (!response.ok) throw new Error("Failed to load CSV")
      const text = await response.text()

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results: ParseResult<SKUHealth>) => {
          const parsedData = results.data.map((row: any) => ({
            ...row,
            total_returns: Number(row.total_returns) || 0,
            avg_inventory: Number(row.avg_inventory) || 0,
            total_shipped_qty: Number(row.total_shipped_qty) || 0,
            failure_rate: Number(row.failure_rate) || 0,
            unit_weight_kg: Number(row.unit_weight_kg) || 0,
            unit_volume_m3: Number(row.unit_volume_m3) || 0,
            std_cost_usd: Number(row.std_cost_usd) || 0,
            supplier_nominal_lead_time_days: Number(row.supplier_nominal_lead_time_days) || 0,
            DOA: Number(row.DOA) || 0,
            FIRMWARE: Number(row.FIRMWARE) || 0,
            INTERMITTENT: Number(row.INTERMITTENT) || 0,
            MECH_DAMAGE: Number(row.MECH_DAMAGE) || 0,
            NO_POWER: Number(row.NO_POWER) || 0,
            OTHER: Number(row.OTHER) || 0,
            OVERHEAT: Number(row.OVERHEAT) || 0,
            RF_FAULT: Number(row.RF_FAULT) || 0,
          }))
          setData(parsedData as SKUHealth[])
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
        <span className="ml-2">Loading SKU Health data...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>
  }

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">SKU Health Data</h1>
        <p className="text-muted-foreground">
          {data.length.toLocaleString()} records
        </p>
      </div>
      <SKUHealthTable data={data} />
    </div>
  )
}
