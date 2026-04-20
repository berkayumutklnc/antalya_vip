import type { Metadata } from "next";
import { TransferLandingFull } from "@/components/TransferLanding";
import { generateTransferMeta } from "@/lib/seo";
import { getTransferBySlug } from "@/content/transfers";

const route = getTransferBySlug("vip-transfer-antalya")!;

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ lang?: string }> },
): Promise<Metadata> {
  return generateTransferMeta(route, await searchParams);
}

export default function Page() {
  return <TransferLandingFull route={route} />;
}