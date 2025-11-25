"use client"

import { useState, useEffect } from "react"
import Papa from "papaparse"
import type { ParseResult } from "papaparse"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RMAEnriched, SiteEnriched, SKUHealth, Anomaly } from "@/lib/types"
import { RMATable } from "./tables/rma-table"
import { SitesTable } from "./tables/sites-table"
import { SKUHealthTable } from "./tables/sku-health-table"
import { AnomaliesTable } from "./tables/anomalies-table"

const CSV_FILES = {
  rma: "/rma/rma_enriched.csv",
  sites: "/rma/sites_enriched.csv",
  sku: "/rma/sku_health.csv",
  anomalies: "/rma/anomalies.csv",
}

export function DataLoader() {
  const [rmaData, setRmaData] = useState<RMAEnriched[]>([])
  const [sitesData, setSitesData] = useState<SiteEnriched[]>([])
  const [skuData, setSkuData] = useState<SKUHealth[]>([])
  const [anomaliesData, setAnomaliesData] = useState<Anomaly[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [rma, sites, sku, anomalies] = await Promise.all([
        loadCSV<RMAEnriched>(CSV_FILES.rma),
        loadCSV<SiteEnriched>(CSV_FILES.sites),
        loadCSV<SKUHealth>(CSV_FILES.sku),
        loadCSV<Anomaly>(CSV_FILES.anomalies),
      ])

      setRmaData(rma)
      setSitesData(sites)
      setSkuData(sku)
      setAnomaliesData(anomalies)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
      console.error("Error loading data:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadCSV = <T,>(filePath: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      fetch(filePath)
        .then((response) => {
          if (!response.ok) throw new Error(`Failed to load ${filePath}`)
          return response.text()
        })
        .then((text) => {
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (results: ParseResult<T>) => {
              resolve(results.data as T[])
            },
            error: (error: Error) => {
              reject(new Error(`Failed to parse CSV: ${error.message}`))
            },
          })
        })
        .catch(reject)
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading data...</div>
  }

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>
  }

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="rma" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rma">RMA Enriched ({rmaData.length})</TabsTrigger>
          <TabsTrigger value="sites">Sites ({sitesData.length})</TabsTrigger>
          <TabsTrigger value="sku">SKU Health ({skuData.length})</TabsTrigger>
          <TabsTrigger value="anomalies">Anomalies ({anomaliesData.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rma">
          <RMATable data={rmaData} />
        </TabsContent>

        <TabsContent value="sites">
          <SitesTable data={sitesData} />
        </TabsContent>

        <TabsContent value="sku">
          <SKUHealthTable data={skuData} />
        </TabsContent>

        <TabsContent value="anomalies">
          <AnomaliesTable data={anomaliesData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
