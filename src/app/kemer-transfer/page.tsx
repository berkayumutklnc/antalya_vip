import { TransferLandingFull } from "@/components/TransferLanding";
import { buildTransferMetadata } from "@/lib/seo";
import { getTransferBySlug } from "@/content/transfers";

const route = getTransferBySlug("kemer-transfer")!;
export const metadata = buildTransferMetadata({
  title: route.content.de.metaTitle,
  description: route.content.de.metaDescription,
  canonical: "/kemer-transfer",
});
export default function Page() {
  return <TransferLandingFull route={route} />;
}