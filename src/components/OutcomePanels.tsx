import type { CardOutcome, CoinOutcome, DiceOutcome } from '../domain/types';
import { describeCardSum, describeProduct, formatCard } from '../game/cards';

type OutcomePanelsProps = {
  dice?: DiceOutcome;
  coins?: CoinOutcome;
  cards?: CardOutcome;
  animating: boolean;
};

export function OutcomePanels({ dice, coins, cards, animating }: OutcomePanelsProps) {
  return (
    <>
      <section className="panel outcome-panel" aria-labelledby="dice-outcome-heading">
        <div className="panel-header">
          <h2 id="dice-outcome-heading">Dice Result</h2>
        </div>
        <div className={animating ? 'dice-row rolling' : 'dice-row'}>
          <div className="die">{dice?.die1 ?? '-'}</div>
          <div className="die">{dice?.die2 ?? '-'}</div>
          <div className="total">Total {dice?.sum ?? '-'}</div>
        </div>
      </section>

      <section className="panel outcome-panel" aria-labelledby="coin-outcome-heading">
        <div className="panel-header">
          <h2 id="coin-outcome-heading">Coin Result</h2>
        </div>
        <div className={animating ? 'coin-row rolling' : 'coin-row'}>
          {(coins ?? ['-', '-', '-']).map((coin, index) => (
            <div className="coin" key={`${coin}-${index}`}>
              {coin}
            </div>
          ))}
        </div>
      </section>

      <section className="panel outcome-panel card-outcome" aria-labelledby="card-outcome-heading">
        <div className="panel-header">
          <h2 id="card-outcome-heading">Card Draw</h2>
        </div>
        <div className={animating ? 'card-row rolling' : 'card-row'}>
          {(cards?.cards ?? []).map((card) => (
            <div className={`playing-card ${card.suit}`} key={`${card.rank}-${card.suit}`}>
              {formatCard(card)}
            </div>
          ))}
          {!cards && [0, 1, 2].map((item) => <div className="playing-card empty" key={item}>--</div>)}
        </div>
        <dl className="result-stats">
          <div>
            <dt>Product</dt>
            <dd>{cards ? describeProduct(cards) : '-'}</dd>
          </div>
          <div>
            <dt>Sum</dt>
            <dd>{cards ? describeCardSum(cards) : '-'}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
