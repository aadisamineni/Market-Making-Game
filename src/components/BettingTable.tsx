import type { BinaryBetDefinition, PracticeMetric } from '../domain/types';
import { formatNumber, formatOdds, formatPercent, formatSignedUsd, formatUsd } from '../utils/format';

type BettingTableProps<TOutcome> = {
  title: string;
  definitions: BinaryBetDefinition<TOutcome>[];
  values: Record<string, string>;
  errors: Record<string, string>;
  practiceMode: boolean;
  metrics: Record<string, PracticeMetric>;
  onChange: (id: string, value: string) => void;
};

export function BettingTable<TOutcome>({
  title,
  definitions,
  values,
  errors,
  practiceMode,
  metrics,
  onChange,
}: BettingTableProps<TOutcome>) {
  return (
    <section className="panel betting-panel" aria-labelledby={`${title}-heading`}>
      <div className="panel-header">
        <h2 id={`${title}-heading`}>{title}</h2>
      </div>
      <div className="table-wrap">
        <table className="bet-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Odds</th>
              <th scope="col">Wager</th>
              <th scope="col">Potential profit</th>
              {practiceMode && <th scope="col">Practice analytics</th>}
            </tr>
          </thead>
          <tbody>
            {definitions.map((definition) => {
              const rawValue = values[definition.id] ?? '';
              const wager = rawValue === '' || errors[definition.id] ? 0 : Number(rawValue);
              const metric = metrics[definition.id];
              return (
                <tr key={definition.id}>
                  <th scope="row">{definition.label}</th>
                  <td>{formatOdds(definition.odds)}</td>
                  <td>
                    <label className="sr-only" htmlFor={definition.id}>
                      {definition.label} wager
                    </label>
                    <input
                      id={definition.id}
                      inputMode="decimal"
                      value={rawValue}
                      onChange={(event) => onChange(definition.id, event.target.value)}
                      aria-invalid={Boolean(errors[definition.id])}
                      aria-describedby={errors[definition.id] ? `${definition.id}-error` : undefined}
                      placeholder="0.00"
                    />
                    {errors[definition.id] && (
                      <p className="field-error" id={`${definition.id}-error`} aria-live="polite">
                        {errors[definition.id]}
                      </p>
                    )}
                  </td>
                  <td>{formatUsd(wager * definition.odds)}</td>
                  {practiceMode && metric && (
                    <td className="analytics-cell">
                      <span>p {formatPercent(metric.trueProbability, 4)}</span>
                      <span>Dec {formatNumber(metric.decimalPayout, 2)}</span>
                      <span>BE {formatPercent(metric.breakEvenProbability)}</span>
                      <span>{formatSignedUsd(metric.expectedProfitPerDollar)} / $1</span>
                      <strong className={metric.evLabel === 'Positive EV' ? 'positive' : metric.evLabel === 'Negative EV' ? 'negative' : ''}>
                        {metric.evLabel}
                      </strong>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
