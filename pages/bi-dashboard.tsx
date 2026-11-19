import { useState } from 'react';
import styles from './bi-dashboard.module.css';

interface Metrics {
  revenue: number;
  cost: number;
  margin: number;
  cmv: number;
  breakEven: number;
  dailySales: number;
  alerts: Array<{ type: string; message: string }>;
}

const mockMetrics: Metrics = {
  revenue: 3200,
  cost: 896,
  margin: 72,
  cmv: 28,
  breakEven: 1864,
  dailySales: 15,
  alerts: [
    { type: 'warning', message: 'Estoque baixo: Brownie' },
    { type: 'success', message: 'Meta de margem atingida' },
    { type: 'info', message: 'Ponto de equilíbrio: R$ 1.864' },
  ],
};

export default function BIDashboard() {
  const profitStatus = mockMetrics.revenue > mockMetrics.breakEven ? 'lucro' : 'prejuizo';
  const statusColor = profitStatus === 'lucro' ? '#22c55e' : '#ef4444';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 BI Dashboard - Nobre Café</h1>
        <p>Análise Financeira em Tempo Real</p>
      </div>

      {/* Alertas */}
      {mockMetrics.alerts.length > 0 && (
        <div className={styles.alerts}>
          {mockMetrics.alerts.map((alert, idx) => (
            <div key={idx} className={`${styles.alert} ${styles[`alert_${alert.type}`]}`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* KPIs principais */}
      <div className={styles.kpi_grid}>
        <div className={styles.kpi_card}>
          <div className={styles.kpi_label}>Faturamento</div>
          <div className={styles.kpi_value}>R$ {mockMetrics.revenue.toFixed(0)}</div>
          <div className={styles.kpi_meta}>Hoje</div>
        </div>

        <div className={styles.kpi_card}>
          <div className={styles.kpi_label}>Custo (CMV)</div>
          <div className={styles.kpi_value}>{mockMetrics.cmv}%</div>
          <div className={styles.kpi_meta}>Ótimo!</div>
        </div>

        <div className={styles.kpi_card}>
          <div className={styles.kpi_label}>Margem Bruta</div>
          <div className={styles.kpi_value}>{mockMetrics.margin}%</div>
          <div className={styles.kpi_meta}>Lucro líquido</div>
        </div>

        <div className={styles.kpi_card} style={{ borderColor: statusColor }}>
          <div className={styles.kpi_label}>Status</div>
          <div className={styles.kpi_value} style={{ color: statusColor }}>
            {profitStatus === 'lucro' ? '✅ LUCRO' : '❌ PREJUÍZO'}
          </div>
          <div className={styles.kpi_meta}>
            R$ {(mockMetrics.revenue - mockMetrics.breakEven).toFixed(0)}
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className={styles.chart_grid}>
        <div className={styles.chart_card}>
          <h3>💰 Análise de Custos</h3>
          <svg width="100%" height="250" viewBox="0 0 400 250">
            <rect x="20" y="150" width="150" height="70" fill="#22c55e" opacity="0.8" rx="4" />
            <text x="95" y="195" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
              Lucro
            </text>
            <text x="95" y="215" textAnchor="middle" fontSize="12" fill="white">
              R$ {mockMetrics.revenue - mockMetrics.cost}
            </text>

            <rect x="230" y="180" width="150" height="40" fill="#ef4444" opacity="0.8" rx="4" />
            <text x="305" y="208" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">
              Custo
            </text>
            <text x="305" y="228" textAnchor="middle" fontSize="12" fill="white">
              R$ {mockMetrics.cost}
            </text>
          </svg>
        </div>

        <div className={styles.chart_card}>
          <h3>📈 Ponto de Equilíbrio</h3>
          <div className={styles.progress_bar}>
            <div
              className={styles.progress_fill}
              style={{
                width: Math.min((mockMetrics.revenue / mockMetrics.breakEven) * 100, 100) + '%',
              }}
            />
          </div>
          <div className={styles.progress_text}>
            <span>R$ {mockMetrics.revenue.toFixed(0)}</span>
            <span>/ R$ {mockMetrics.breakEven.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className={styles.table_card}>
        <h3>🛒 Últimas Vendas</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Preço</th>
              <th>Custo</th>
              <th>Margem</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cappuccino Premium</td>
              <td>R$ 18</td>
              <td>R$ 4.50</td>
              <td>75%</td>
              <td>✅</td>
            </tr>
            <tr>
              <td>Brownie</td>
              <td>R$ 12</td>
              <td>R$ 2</td>
              <td>83%</td>
              <td>⚠️</td>
            </tr>
            <tr>
              <td>Latte</td>
              <td>R$ 16</td>
              <td>R$ 3.50</td>
              <td>78%</td>
              <td>✅</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recomendações */}
      <div className={styles.recommendations}>
        <h3>💡 Recomendações IA</h3>
        <ul>
          <li>Aumentar promoção do Cappuccino (maior margem)</li>
          <li>Revisar custo do Brownie (estoque baixo)</li>
          <li>Manter preço do Latte (popular e lucrativo)</li>
        </ul>
      </div>
    </div>
  );
}
