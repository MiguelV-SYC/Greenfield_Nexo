import { ModulePage, moduleMetadata, moduleStaticParams } from "@/components/app/ModulePage"

export const dynamicParams = false

export function generateStaticParams() {
  return moduleStaticParams("sgsst")
}

export async function generateMetadata({ params }: PageProps<"/sgsst/[modulo]">) {
  return moduleMetadata("sgsst", (await params).modulo)
}

export default async function SgsstModulePage({ params }: PageProps<"/sgsst/[modulo]">) {
  return <ModulePage system="sgsst" slug={(await params).modulo} />
}
