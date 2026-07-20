import type { RoundPositions } from '../domain/types';
import { marketRiskSummary, maximumRoundLoss, remainingBankrollAfterWorstCase, totalBinaryWagers } from '../risk/risk';
import { formatSignedUsd, formatUsd } from '../utils/format';

type RiskPanelProps = {
  bankroll: number;
  positions: RoundPositions;
};

export function RiskPanel({ bankroll, positions }: RiskPanelProps) {
  const binary = totalBinaryWagers(positions);
  const market = marketRiskSummary(positions.market);
  const maximumLoss = maximumRoundLoss(positions);
  const remaining = remainingBankrollAfterWorstCase(bankroll, positions);

  return (
    <section className="panel risk-panel" aria-labelledby="risk-heading">
      <div className="panel-header">
        <h2 id="risk-heading">Risk Control</h2>
      </div>
      <dl className="summary-grid">
        <div>
          <dt>Total binary wagers</dt>
          <dd>{formatUsd(binary)}</dd>
        </div>
        <div>
          <dt>Net market position</dt>
          <dd>{market.netPosition > 0 ? `Long ${market.netPosition}` : market.netPosition < 0 ? `Short ${Math.abs(market.netPosition)}` : 'Flat'}</dd>
        </div>
        <div>
          <dt>Worst-case market loss</dt>
          <dd>{formatUsd(market.worstCaseLoss)}</dd>
        </div>
        <div>
          <dt>Maximum total round loss</dt>
          <dd>{formatUsd(maximumLoss)}</dd>
        </div>
        <div>
          <dt>Remaining bankroll after worst case</dt>
          <dd className={remaining < 0 ? 'negative' : ''}>{formatSignedUsd(remaining)}</dd>
        </div>
      </dl>
    </section>
  );
}
