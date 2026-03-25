/**
 * NPL status classifier using Claude AI.
 *
 * Analyzes servicing notes and loan data to suggest the correct HoldingStatus,
 * a confidence level, brief reasoning, and a recommended next action.
 * This runs server-side only (never expose ANTHROPIC_API_KEY to the client).
 */
import Anthropic from "@anthropic-ai/sdk";
import type { FundHolding, HoldingStatus, LiquidationConfidence } from "@/db/schema/fund";
import { HOLDING_STATUSES } from "@/db/schema/fund";

const SYSTEM_PROMPT = `You are an expert NPL (Non-Performing Loan) portfolio analyst for a family office (Pineapple Fund / Pineapple Entropy LP).

You analyze real estate loan servicing notes and loan data to:
1. Classify the current HoldingStatus from exactly one of the 17 valid values
2. Assess confidence in your classification
3. Provide concise reasoning (2-3 sentences)
4. Recommend the single most important next action for the portfolio manager

Context:
- These are US residential/commercial bridge loans held at cost basis by a fund
- Platforms: Upright/FTF (real estate bridge), Sharestates (real estate bridge), Upgrade/Prosper (consumer)
- The fund wants to maximize recovery on NPL positions
- RBNF = Receiver-Based Note Funding (pooled notes, no direct lien enforcement)

Valid HoldingStatus values:
- PERFORMING: current on payments, no issues
- LATE_PAYMENT: payments overdue but no formal action yet
- LOSS_MITIGATION: active negotiation / forbearance / workout in progress
- FORECLOSURE_EARLY: foreclosure filed, pre-sale / pre-judgment
- FORECLOSURE_MID: foreclosure active, sale scheduled or judgment obtained
- FORECLOSURE_LATE: sale imminent (< 30 days) or awaiting confirmation
- REO: bank/fund owns property, no sale strategy yet
- REO_LISTED: property listed for sale on MLS
- REO_UNDER_CONTRACT: sale under contract, pending close
- BORROWER_WORKOUT: formal workout/modification agreement in place
- PAYOFF_EXPECTED: borrower confirmed imminent payoff
- BANKRUPTCY: borrower filed bankruptcy, automatic stay in effect
- TITLE_ISSUE: title defect blocking sale or recovery
- NOTE_SALE: note listed or sold to a third party
- PARTIAL_RECOVERY: partial proceeds received, residual balance remains
- SETTLED: fully resolved — all recoverable proceeds received
- WRITTEN_OFF: no further recovery expected, written to zero

Respond ONLY with valid JSON matching this exact schema:
{
  "status": "<HoldingStatus>",
  "confidence": "high" | "medium" | "low",
  "reasoning": "<2-3 sentence analysis>",
  "nextAction": "<single most important action the PM should take>",
  "recoveryNotes": "<optional: any specific recovery strategy insight>"
}`;

function buildUserPrompt(holding: FundHolding): string {
  const today = new Date();
  const lastUpdate = holding.lastUpdateDate ? new Date(holding.lastUpdateDate) : null;
  const daysSince = lastUpdate
    ? Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const lines: string[] = [
    `Platform: ${holding.platform}`,
    `Offering ID: ${holding.offeringId}`,
    `Current Status in System: ${holding.status}`,
  ];

  if (holding.propertyAddress || holding.city) {
    const addr = [holding.propertyAddress, holding.city, holding.state]
      .filter(Boolean)
      .join(", ");
    lines.push(`Property: ${addr}`);
  }

  if (holding.currentPrincipal) {
    lines.push(
      `Outstanding Principal: $${(holding.currentPrincipal / 100).toLocaleString()}`
    );
  }
  if (holding.costBasisApex) {
    lines.push(`Cost Basis: $${(holding.costBasisApex / 100).toLocaleString()}`);
  }
  if (holding.maturityDate) {
    lines.push(`Maturity Date: ${holding.maturityDate}`);
  }

  if (holding.lastUpdateText) {
    lines.push(
      `\nMost Recent Servicing Note (${holding.lastUpdateDate ?? "unknown date"}, ${daysSince != null ? `${daysSince} days ago` : ""}):`,
      holding.lastUpdateText
    );
  } else {
    lines.push(`\nNo servicing notes on file.`);
    if (daysSince != null) {
      lines.push(`Last system update: ${daysSince} days ago`);
    }
  }

  if (holding.isRbnf) lines.push("\nNote: This is an RBNF pooled note.");
  if (holding.hurricaneDamage) lines.push("Note: Hurricane damage reported.");
  if (holding.subStatus) lines.push(`Sub-status: ${holding.subStatus}`);

  return lines.join("\n");
}

export interface ClassificationResult {
  status: HoldingStatus;
  confidence: LiquidationConfidence;
  reasoning: string;
  nextAction: string;
  recoveryNotes?: string;
}

export async function classifyHolding(
  holding: FundHolding
): Promise<ClassificationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to Railway environment variables."
    );
  }

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildUserPrompt(holding),
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  // Strip markdown code fences if present
  const raw = content.text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Claude returned non-JSON response: ${content.text.slice(0, 200)}`);
  }

  // Validate status is one of the known values
  const status = parsed.status as string;
  if (!HOLDING_STATUSES.includes(status as HoldingStatus)) {
    throw new Error(
      `Claude returned unknown status "${status}". Valid: ${HOLDING_STATUSES.join(", ")}`
    );
  }

  const confidence = parsed.confidence as string;
  if (!["high", "medium", "low"].includes(confidence)) {
    throw new Error(`Claude returned unknown confidence "${confidence}"`);
  }

  return {
    status: status as HoldingStatus,
    confidence: confidence as LiquidationConfidence,
    reasoning: String(parsed.reasoning ?? ""),
    nextAction: String(parsed.nextAction ?? ""),
    recoveryNotes: parsed.recoveryNotes ? String(parsed.recoveryNotes) : undefined,
  };
}

export async function classifyBatch(
  holdings: FundHolding[]
): Promise<Map<string, ClassificationResult | { error: string }>> {
  const results = new Map<string, ClassificationResult | { error: string }>();

  // Sequential to avoid rate-limiting — Claude handles ~60 req/min on most tiers
  for (const holding of holdings) {
    try {
      const result = await classifyHolding(holding);
      results.set(holding.id, result);
    } catch (err) {
      results.set(holding.id, {
        error: err instanceof Error ? err.message : "Classification failed",
      });
    }
  }

  return results;
}
