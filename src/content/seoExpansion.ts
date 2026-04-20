import type { TransferRoute } from "@/content/transfers";

export type ExpansionCluster = {
  slug: string;
  region: TransferRoute["region"];
  baseTransferSlug: string;
  entityType: "hotel" | "resort";
};

/**
 * Future SEO expansion seed model.
 *
 * This does not generate pages. It only defines a consistent naming convention
 * so future hotel/resort landing pages can be added without route sprawl.
 */
export function buildExpansionCluster(args: {
  baseTransferSlug: string;
  region: TransferRoute["region"];
  entityType: "hotel" | "resort";
  entitySlug: string;
}): ExpansionCluster {
  return {
    slug: `${args.baseTransferSlug}/${args.entityType}/${args.entitySlug}`,
    region: args.region,
    baseTransferSlug: args.baseTransferSlug,
    entityType: args.entityType,
  };
}

export function groupRoutesByRegion(routes: TransferRoute[]): Record<TransferRoute["region"], TransferRoute[]> {
  return {
    airport: routes.filter((r) => r.region === "airport"),
    central: routes.filter((r) => r.region === "central"),
    east: routes.filter((r) => r.region === "east"),
    west: routes.filter((r) => r.region === "west"),
  };
}
