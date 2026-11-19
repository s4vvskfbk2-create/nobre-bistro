import { useState, useMemo } from 'react';
import styles from './menu-engineering.module.css';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  cost: number;
  quantity_sold: number;
}

interface Analysis {
  itemId: string;
  name: string;
  popularity: number;
  profitability: number;
  category: 'star' | 'puzzle' | 'plowhorse' | 'dog';
  recommendation: string;
}

const mockData: MenuItem[] = [
  { id: '1', name: 'Cappuccino Premium', price: 18, cost: 4.50, quantity_sold: 450 },
  { id: '2', name: 'Brownie', price: 12, cost: 2, quantity_sold: 350 },
  { id: '3', name: 'Latte', price: 16, cost: 3.50, quantity_sold: 320 },
  { id: '4', name: 'Bolo de Chocolate', price: 25, cost: 8, quantity_sold: 180 },
  { id: '5', name: 'Espresso', price: 8, cost: 1.50, quantity_sold: 280 },
];

export default function MenuEngineering() {
  const analysis = useMemo(() => analyzeMenu(mockData), []);

  const categoryColors = {
    star: '#22c55e',
    puzzle: '#eab308',
    plowhorse: '#3b82f6',
    dog: '#ef4444',
  };

  const categoryLabels = {
    star: '⭐ Destaque',
    puzzle: '🤔 Oportunidade',
    plowhorse: '🐴 Volume',
    dog: '🐕 Remover',
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Menu Engineering</h1>
        <p>Análise de Popularidade vs Lucro</p>
      </div>

      <div className={styles.chart_wrapper}>
        <svg width="600" height="500" className={styles.chart}>
          {/* Grid */}
          <line x1="80" y1="20" x2="80" y2="420" stroke="#ddd" strokeWidth="1" />
          <line x1="80" y1="420" x2="580" y2="420" stroke="#ddd" strokeWidth="1" />

          {/* Labels */}
          <text x="40" y="220" textAnchor="end" fontSize="12" fill="#666">
            Lucro (%)
          </text>
          <text x="330" y="460" textAnchor="middle" fontSize="12" fill="#666">
            Popularidade (%)
          </text>

          {/* Quadrantes com cores suaves */}
          <rect x="80" y="20" width="250" height="200" fill="#e8f5e9" opacity="0.3" />
          <rect x="330" y="20" width="250" height="200" fill="#f1f8e9" opacity="0.3" />
          <rect x="80" y="220" width="250" height="200" fill="#e1f5fe" opacity="0.3" />
          <rect x="330" y="220" width="250" height="200" fill="#ffe0b2" opacity="0.3" />

          {/* Labels dos quadrantes */}
          <text x="150" y="45" fontSize="11" fontWeight="bold" fill="#2e7d32">
            ⭐ STARS
          </text>
          <text x="400" y="45" fontSize="11" fontWeight="bold" fill="#f57f17">
            🤔 PUZZLES
          </text>
          <text x="150" y="400" fontSize="11" fontWeight="bold" fill="#01579b">
            🐴 PLOWHORSES
          </text>
          <text x="400" y="400" fontSize="11" fontWeight="bold" fill="#c62828">
            🐕 DOGS
          </text>

          {/* Pontos dos itens */}
          {analysis.map((item, idx) => {
            const x = 80 + (item.popularity / 100) * 500;
            const y = 420 - (item.profitability / 100) * 400;
            return (
              <g key={item.itemId}>
                <circle
                  cx={x}
                  cy={y}
                  r="20"
                  fill={categoryColors[item.category]}
                  opacity="0.8"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dy="0.3em"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.legend}>
        {analysis.map((item) => (
          <div key={item.itemId} className={styles.legend_item}>
            <div
              className={styles.color_box}
              style={{ backgroundColor: categoryColors[item.category] }}
            />
            <div>
              <strong>{item.name}</strong>
              <p>{item.recommendation}</p>
              <small>
                Pop: {item.popularity}% | Lucro: {item.profitability}%
              </small>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.metrics}>
        <h3>📈 Métricas</h3>
        <div className={styles.metrics_grid}>
          <div className={styles.metric_card}>
            <div className={styles.metric_value}>{analysis.filter(a => a.category === 'star').length}</div>
            <div className={styles.metric_label}>Destaques (Stars)</div>
          </div>
          <div className={styles.metric_card}>
            <div className={styles.metric_value}>{analysis.filter(a => a.category === 'puzzle').length}</div>
            <div className={styles.metric_label}>Oportunidades (Puzzles)</div>
          </div>
          <div className={styles.metric_card}>
            <div className={styles.metric_value}>{analysis.filter(a => a.category === 'plowhorse').length}</div>
            <div className={styles.metric_label}>Volume (Plowhorses)</div>
          </div>
          <div className={styles.metric_card}>
            <div className={styles.metric_value}>{analysis.filter(a => a.category === 'dog').length}</div>
            <div className={styles.metric_label}>Remover (Dogs)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function analyzeMenu(items: MenuItem[]): Analysis[] {
  const totalQty = items.reduce((sum, item) => sum + item.quantity_sold, 0);
  const margins = items.map(item => ((item.price - item.cost) / item.price) * 100);
  const maxMargin = Math.max(...margins);
  const minMargin = Math.min(...margins);

  return items.map((item, idx) => {
    const popularity = (item.quantity_sold / totalQty) * 100;
    const margin = margins[idx];
    const profitability = ((margin - minMargin) / (maxMargin - minMargin)) * 100;

    let category: 'star' | 'puzzle' | 'plowhorse' | 'dog';
    let recommendation: string;

    if (popularity > 50 && profitability > 50) {
      category = 'star';
      recommendation = '⭐ DESTAQUE - Manter em destaque no cardápio';
    } else if (popularity <= 50 && profitability > 50) {
      category = 'puzzle';
      recommendation = '🤔 OPORTUNIDADE - Promover para aumentar venda';
    } else if (popularity > 50 && profitability <= 50) {
      category = 'plowhorse';
      recommendation = '🐴 VOLUME - Popular mas revisar custo';
    } else {
      category = 'dog';
      recommendation = '🐕 REMOVER - Baixa performance, considerar remover';
    }

    return {
      itemId: item.id,
      name: item.name,
      popularity: Math.round(popularity),
      profitability: Math.round(profitability),
      category,
      recommendation,
    };
  });
}
