"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"
import type { ParseResult } from "papaparse"
import { SiteEnriched } from "@/lib/types"
import { SitesTable } from "@/components/tables/sites-table"
import { Loader2 } from "lucide-react"

export function SitesDataLoader() {
  const [data, setData] = useState<SiteEnriched[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/rma/sites_enriched.csv")
      if (!response.ok) throw new Error("Failed to load CSV")
      const text = await response.text()

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results: ParseResult<SiteEnriched>) => {
          setData(results.data as SiteEnriched[])
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
        <span className="ml-2">Loading Sites data...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>
  }

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Sites Enriched Data</h1>
        <p className="text-muted-foreground">
          {data.length.toLocaleString()} records
        </p>
      </div>
      <SitesTable data={data} />
    </div>
  )
}
