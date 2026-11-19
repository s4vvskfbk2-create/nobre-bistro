import { useState } from 'react';
import styles from './suppliers.module.css';

interface Supplier {
  id: string;
  name: string;
  totalSpent: number;
  itemsSupplied: number;
  rating: number;
  lastPurchase: string;
}

const mockSuppliers: Supplier[] = [
  { id: '1', name: 'Distribuidora Café Premium', totalSpent: 2400, itemsSupplied: 8, rating: 4.8, lastPurchase: '2026-11-18' },
  { id: '2', name: 'Fornecedora de Doces', totalSpent: 1800, itemsSupplied: 5, rating: 4.5, lastPurchase: '2026-11-17' },
  { id: '3', name: 'Leite e Derivados', totalSpent: 1200, itemsSupplied: 3, rating: 4.9, lastPurchase: '2026-11-18' },
];

export default function Suppliers() {
  const [suppliers] = useState(mockSuppliers);
  const totalSpentMonth = suppliers.reduce((sum, s) => sum + s.totalSpent, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🏪 Gestão de Fornecedores</h1>
        <p>Integrado com Treezor e Boletos</p>
      </div>

      <div className={styles.summary}>
        <div className={styles.summary_card}>
          <div className={styles.summary_value}>R$ {totalSpentMonth.toLocaleString('pt-BR')}</div>
          <div className={styles.summary_label}>Gasto Mensal</div>
        </div>
        <div className={styles.summary_card}>
          <div className={styles.summary_value}>{suppliers.length}</div>
          <div className={styles.summary_label}>Fornecedores Ativos</div>
        </div>
        <div className={styles.summary_card}>
          <div className={styles.summary_value}>{suppliers.reduce((sum, s) => sum + s.itemsSupplied, 0)}</div>
          <div className={styles.summary_label}>Tipos de Itens</div>
        </div>
      </div>

      <div className={styles.suppliers_list}>
        <h2>Top Fornecedores</h2>
        {suppliers.map((supplier) => (
          <div key={supplier.id} className={styles.supplier_card}>
            <div className={styles.supplier_info}>
              <h3>{supplier.name}</h3>
              <div className={styles.supplier_meta}>
                <span>⭐ {supplier.rating}</span>
                <span>📦 {supplier.itemsSupplied} itens</span>
                <span>📅 {supplier.lastPurchase}</span>
              </div>
            </div>
            <div className={styles.supplier_actions}>
              <div className={styles.spent}>R$ {supplier.totalSpent}</div>
              <button className={styles.btn}>Fazer Pedido</button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.import_section}>
        <h2>📋 Importar Boletos</h2>
        <p>Integração automática com Treezor</p>
      </div>
    </div>
  );
}
