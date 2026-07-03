// components/common/KpiCard.jsx
import './KpiCard.css'; // opzionale, se vuoi stili dedicati

/**
 * Componente KPI Card per la dashboard
 * @param {Object} props
 * @param {string} props.title - Titolo della card (es. "Visite Oggi")
 * @param {string|number} props.value - Valore principale (es. "8" o "€ 1.240")
 * @param {string} props.subtitle - Sottotitolo o descrizione (es. "+2 rispetto a ieri")
 * @param {string} props.icon - Icona (es. "📊" o "fa-solid fa-chart-pie")
 * @param {string} props.variant - Variante colore: 'primary', 'success', 'warning', 'danger'
 * @param {React.ReactNode} props.children - Contenuto extra opzionale
 */
export function KpiCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  variant = 'primary',
  children 
}) {
  return (
    <div className={`kpi-card border-${variant}`}>
      <div className="kpi-header">
        <span className="kpi-label">{title}</span>
        {icon && <span className="kpi-icon">{icon}</span>}
      </div>
      <div className="kpi-value">{value}</div>
      {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
      {children && <div className="kpi-footer">{children}</div>}
    </div>
  );
}