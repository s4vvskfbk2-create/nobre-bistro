import { useState } from 'react';
import styles from './ai-recommendations.module.css';

interface Recommendation {
  id: string;
  type: 'menu' | 'purchase' | 'alert';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: string;
}

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    type: 'menu',
    priority: 'high',
    title: 'Cardápio Dinâmico - Hoje',
    description: 'Temperatura 28°C: Aumentar oferta de bebidas frias (Cold Brew +20%) e reduzir bebidas quentes',
    action: 'Aplicar cardápio',
  },
  {
    id: '2',
    type: 'purchase',
    priority: 'high',
    title: 'Compra Inteligente Recomendada',
    description: 'Baseado em demanda: 50kg Café Premium, 30kg Leite, 15kg Açúcar (Economia: R$ 180)',
    action: 'Autorizar compra',
  },
  {
    id: '3',
    type: 'alert',
    priority: 'medium',
    title: 'Brownie - Estoque Baixo',
    description: 'Venda em alta (3,2% do volume), mas estoque reduzido. Próxima compra em 2 dias.',
    action: 'Acelerar compra',
  },
  {
    id: '4',
    type: 'menu',
    priority: 'low',
    title: 'Quinta-feira + Frio = Oportunidade',
    description: 'Padrão histórico: Quinta-feira com clima frio reduz vendas em 15%. Sugerir promoção.',
    action: 'Ver promoções',
  },
];

export default function AIRecommendations() {
  const [recommendations] = useState(mockRecommendations);
  const highPriority = recommendations.filter(r => r.priority === 'high');
  const totalPotentialSavings = 180;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'menu': return '📋';
      case 'purchase': return '🛒';
      case 'alert': return '⚠️';
      default: return '📌';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🤖 Recomendações IA</h1>
        <p>Sistema de Inteligência Artificial integrado</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat_card}>
          <div className={styles.stat_value}>{highPriority.length}</div>
          <div className={styles.stat_label}>Ações Prioritárias</div>
        </div>
        <div className={styles.stat_card}>
          <div className={styles.stat_value}>R$ {totalPotentialSavings}</div>
          <div className={styles.stat_label}>Economia Potencial</div>
        </div>
        <div className={styles.stat_card}>
          <div className={styles.stat_value}>{recommendations.length}</div>
          <div className={styles.stat_label}>Recomendações</div>
        </div>
      </div>

      <div className={styles.variables}>
        <h2>📊 Variáveis Monitoradas</h2>
        <div className={styles.variable_grid}>
          <div className={styles.variable_card}>
            <div className={styles.variable_label}>Temperatura</div>
            <div className={styles.variable_value}>28°C ☀️</div>
          </div>
          <div className={styles.variable_card}>
            <div className={styles.variable_label}>Dia da Semana</div>
            <div className={styles.variable_value}>Quarta-feira</div>
          </div>
          <div className={styles.variable_card}>
            <div className={styles.variable_label}>Período</div>
            <div className={styles.variable_value}>Noites quentes</div>
          </div>
          <div className={styles.variable_card}>
            <div className={styles.variable_label}>Estação</div>
            <div className={styles.variable_value}>Primavera</div>
          </div>
        </div>
      </div>

      <div className={styles.recommendations_list}>
        <h2>💡 Recomendações do Dia</h2>
        {recommendations.map((rec) => (
          <div key={rec.id} className={styles.recommendation_card}>
            <div className={styles.recommendation_header}>
              <div className={styles.rec_title}>
                <span className={styles.rec_icon}>{getTypeIcon(rec.type)}</span>
                <span className={styles.rec_heading}>{rec.title}</span>
              </div>
              <div
                className={styles.priority_badge}
                style={{ background: getPriorityColor(rec.priority) }}
              >
                {rec.priority.toUpperCase()}
              </div>
            </div>
            <p className={styles.rec_description}>{rec.description}</p>
            {rec.action && (
              <button className={styles.action_btn}>{rec.action}</button>
            )}
          </div>
        ))}
      </div>

      <div className={styles.ml_info}>
        <h2>🧠 Modelos de Aprendizado</h2>
        <ul>
          <li>Temperature-based demand forecasting</li>
          <li>Seasonal pattern recognition</li>
          <li>Calendar event analysis</li>
          <li>Inventory optimization (ML)</li>
          <li>Margin prediction & alerts</li>
          <li>Break-even monitoring</li>
        </ul>
      </div>
    </div>
  );
}
