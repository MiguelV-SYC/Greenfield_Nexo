import { ModulePage, moduleMetadata, moduleStaticParams } from "@/components/app/ModulePage"

export const dynamicParams = false

export function generateStaticParams() {
  return moduleStaticParams("pesv")
}

export async function generateMetadata({ params }: PageProps<"/pesv/[modulo]">) {
  return moduleMetadata("pesv", (await params).modulo)
}

export default async function PesvModulePage({ params }: PageProps<"/pesv/[modulo]">) {
  return <ModulePage system="pesv" slug={(await params).modulo} />
}
