import { getFundHoldings } from "@/lib/actions/fund";
import { HoldingsTable } from "../_components/HoldingsTable";

export default async function FundPortfolioPage() {
  const result = await getFundHoldings();
  const holdings = result.data ?? [];

  return (
    <div>
      <HoldingsTable initialHoldings={holdings} />
    </div>
  );
}
