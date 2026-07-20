import { MARKET_CONFIG } from '../config/gameConfig';
import type { MarketPosition } from '../domain/types';
import { marketPnlRange, netMarketPosition } from '../game/market';
import { formatSignedUsd, formatUsd } from '../utils/format';

type MarketPanelProps = {
  position: { sellVolume: string; buyVolume: string };
  parsedPosition: MarketPosition;
  errors: Record<string, string>;
  onChange: (field: 'sellVolume' | 'buyVolume', value: string) => void;
};

export function MarketPanel({ position, parsedPosition, errors, onChange }: MarketPanelProps) {
  const range = marketPnlRange(parsedPosition);
  const net = netMarketPosition(parsedPosition);
  return (
    <section className="panel market-panel" aria-labelledby="market-heading">
      <div className="panel-header">
        <h2 id="market-heading">Card-Sum Market</h2>
        <span className="quote">{MARKET_CONFIG.bid} @ {MARKET_CONFIG.ask}</span>
      </div>
      <div className="market-grid">
        <div>
          <label htmlFor="sellVolume">Sell volume at {MARKET_CONFIG.bid}</label>
          <input
            id="sellVolume"
            inputMode="numeric"
            value={position.sellVolume}
            onChange={(event) => onChange('sellVolume', event.target.value)}
            aria-invalid={Boolean(errors.sellVolume)}
            aria-describedby={errors.sellVolume ? 'sellVolume-error' : undefined}
            placeholder="0"
          />
          {errors.sellVolume && <p className="field-error" id="sellVolume-error" aria-live="polite">{errors.sellVolume}</p>}
        </div>
        <div>
          <label htmlFor="buyVolume">Buy volume at {MARKET_CONFIG.ask}</label>
          <input
            id="buyVolume"
            inputMode="numeric"
            value={position.buyVolume}
            onChange={(event) => onChange('buyVolume', event.target.value)}
            aria-invalid={Boolean(errors.buyVolume)}
            aria-describedby={errors.buyVolume ? 'buyVolume-error' : undefined}
            placeholder="0"
          />
          {errors.buyVolume && <p className="field-error" id="buyVolume-error" aria-live="polite">{errors.buyVolume}</p>}
        </div>
      </div>
      <dl className="summary-grid compact">
        <div>
          <dt>Net position</dt>
          <dd>{net > 0 ? `Long ${net}` : net < 0 ? `Short ${Math.abs(net)}` : 'Flat'}</dd>
        </div>
        <div>
          <dt>Live P&L range</dt>
          <dd>{formatSignedUsd(range.min)} to {formatSignedUsd(range.max)}</dd>
        </div>
        <div>
          <dt>Max gain</dt>
          <dd>{formatUsd(Math.max(0, range.max))}</dd>
        </div>
        <div>
          <dt>Max loss</dt>
          <dd>{formatUsd(Math.max(0, -range.min))}</dd>
        </div>
      </dl>
    </section>
  );
}
