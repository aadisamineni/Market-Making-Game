import type { BinaryBetDefinition } from '../domain/types';
import { formatOdds, formatSignedUsd } from '../utils/format';

type BettingTableProps<TOutcome> = {
  title: string;
  definitions: BinaryBetDefinition<TOutcome>[];
  values: Record<string, string>;
  errors: Record<string, string>;
  onChange: (id: string, value: string) => void;
};

export function BettingTable<TOutcome>({
  title,
  definitions,
  values,
  errors,
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
              <th scope="col">P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {definitions.map((definition) => {
              const rawValue = values[definition.id] ?? '';
              const wager = rawValue === '' || errors[definition.id] ? 0 : Number(rawValue);
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
                  <td className="empty-pnl">{wager > 0 ? formatSignedUsd(0) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
