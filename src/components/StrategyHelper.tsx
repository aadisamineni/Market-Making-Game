import type { PracticeMetric } from '../domain/types';
import { cardBetDefinitions } from '../game/cards';
import { coinBetDefinitions } from '../game/coins';
import { diceBetDefinitions } from '../game/dice';
import { formatPercent, formatSignedUsd } from '../utils/format';

type StrategyHelperProps = {
  metrics: Record<string, PracticeMetric>;
};

export function StrategyHelper({ metrics }: StrategyHelperProps) {
  const names = Object.fromEntries(
    [...diceBetDefinitions, ...coinBetDefinitions, ...cardBetDefinitions].map((definition) => [definition.id, definition.label]),
  );
  const ranked = Object.values(metrics).sort((a, b) => b.expectedReturnPercentage - a.expectedReturnPercentage);

  return (
    <details className="panel strategy-panel">
      <summary>Strategy Helper</summary>
      <p>
        Ranked by expected return, with win probability and full Kelly fraction. Full Kelly can be highly aggressive.
      </p>
      <div className="table-wrap">
        <table className="bet-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Bet</th>
              <th>Expected return</th>
              <th>Win probability</th>
              <th>Full Kelly</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((metric, index) => (
              <tr key={metric.betId}>
                <td>{index + 1}</td>
                <th scope="row">{names[metric.betId]}</th>
                <td className={metric.expectedReturnPercentage >= 0 ? 'positive' : 'negative'}>
                  {formatSignedUsd(metric.expectedProfitPerDollar)} / $1 ({metric.expectedReturnPercentage.toFixed(2)}%)
                </td>
                <td>{formatPercent(metric.trueProbability, 4)}</td>
                <td>{formatPercent(metric.kellyFraction)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
