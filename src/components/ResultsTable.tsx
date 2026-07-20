import type { RoundResult } from '../domain/types';
import { describeCardSum, describeProduct } from '../game/cards';
import { formatOdds, formatSignedUsd, formatUsd } from '../utils/format';

type ResultsTableProps = {
  result?: RoundResult;
};

export function ResultsTable({ result }: ResultsTableProps) {
  if (!result) {
    return (
      <section className="panel results-panel" aria-labelledby="results-heading">
        <div className="panel-header">
          <h2 id="results-heading">Round Breakdown</h2>
        </div>
        <p className="empty-state">Submit a round to reveal all outcomes and position P&L.</p>
      </section>
    );
  }

  const rows = [
    ...result.binarySettlements,
    {
      category: 'Cards' as const,
      position: `Sell ${result.marketSettlement.sellVolume} @ ${result.marketSettlement.bid}`,
      wager: result.marketSettlement.sellVolume,
      result: describeCardSum(result.cards),
      status: result.marketSettlement.sellPnl >= 0 ? 'Won' as const : 'Lost' as const,
      odds: 0,
      pnl: result.marketSettlement.sellPnl,
    },
    {
      category: 'Cards' as const,
      position: `Buy ${result.marketSettlement.buyVolume} @ ${result.marketSettlement.ask}`,
      wager: result.marketSettlement.buyVolume,
      result: `${describeCardSum(result.cards)}; ${describeProduct(result.cards)}`,
      status: result.marketSettlement.buyPnl >= 0 ? 'Won' as const : 'Lost' as const,
      odds: 0,
      pnl: result.marketSettlement.buyPnl,
    },
  ].filter((row) => row.wager > 0);

  return (
    <section className="panel results-panel" aria-labelledby="results-heading" aria-live="polite">
      <div className="panel-header">
        <h2 id="results-heading">Round {result.roundNumber} Breakdown</h2>
      </div>
      <div className="table-wrap">
        <table className="bet-table results-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Position</th>
              <th>Wager or volume</th>
              <th>Result</th>
              <th>Win or loss</th>
              <th>Odds</th>
              <th>P&L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.position}-${index}`}>
                <td>{row.category}</td>
                <th scope="row">{row.position}</th>
                <td>{row.category === 'Cards' && row.odds === 0 ? row.wager : formatUsd(row.wager)}</td>
                <td>{row.result}</td>
                <td><span className={row.status === 'Won' ? 'status won' : 'status lost'}>{row.status}</span></td>
                <td>{row.odds === 0 ? 'Market' : formatOdds(row.odds)}</td>
                <td className={row.pnl >= 0 ? 'positive' : 'negative'}>{formatSignedUsd(row.pnl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="summary-grid compact totals">
        <div><dt>Binary betting P&L</dt><dd>{formatSignedUsd(result.binaryPnl)}</dd></div>
        <div><dt>Market P&L</dt><dd>{formatSignedUsd(result.marketPnl)}</dd></div>
        <div><dt>Total round P&L</dt><dd>{formatSignedUsd(result.totalPnl)}</dd></div>
        <div><dt>Updated bankroll</dt><dd>{formatUsd(result.bankrollAfter)}</dd></div>
      </dl>
    </section>
  );
}
