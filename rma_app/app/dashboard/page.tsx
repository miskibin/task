import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>RMA Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">RMA Data Analytics Dashboard</h1>
              <p className="text-lg text-muted-foreground">
                Explore RMA enriched data, site information, SKU health metrics, and anomalies
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/dashboard/rma">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                  <div className="text-xl font-semibold">RMA Enriched</div>
                  <div className="text-sm text-muted-foreground">View RMA records</div>
                </Button>
              </Link>
              
              <Link href="/dashboard/sites">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                  <div className="text-xl font-semibold">Sites</div>
                  <div className="text-sm text-muted-foreground">Site information</div>
                </Button>
              </Link>
              
              <Link href="/dashboard/sku">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                  <div className="text-xl font-semibold">SKU Health</div>
                  <div className="text-sm text-muted-foreground">Product metrics</div>
                </Button>
              </Link>
              
              <Link href="/dashboard/anomalies">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                  <div className="text-xl font-semibold">Anomalies</div>
                  <div className="text-sm text-muted-foreground">Detected anomalies</div>
                </Button>
              </Link>
            </div>

            <div className="bg-muted p-6 rounded-lg space-y-2">
              <h2 className="text-lg font-semibold">Features</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Pagination with customizable page size (10, 20, 30, 40, 50, 100)</li>
                <li>Sorting on key columns</li>
                <li>Column filtering and visibility toggle</li>
                <li>Real-time search across datasets</li>
                <li>Large dataset support (400k+ rows)</li>
              </ul>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
