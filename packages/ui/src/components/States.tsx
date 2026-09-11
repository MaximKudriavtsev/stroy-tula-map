import type { CSSProperties, ReactNode } from 'react';

export const DemoBanner = ({ visible }: { visible: boolean }) => {
  if (!visible) {
    return null;
  }
  return (
    <div role="status" style={styles.banner}>
      Показаны демонстрационные данные. Они не смешиваются с реальной выдачей и не являются адресами действующих объектов.
    </div>
  );
};

export const LoadingState = ({ label = 'Загрузка…' }: { label?: string }) => (
  <div role="status" style={styles.box}>{label}</div>
);

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div role="alert" style={{ ...styles.box, background: 'var(--color-danger-soft)' }}>
    <p style={styles.p}>{message}</p>
    {onRetry ? (
      <button type="button" onClick={onRetry} style={styles.button}>
        Повторить
      </button>
    ) : null}
  </div>
);

export const EmptyState = ({ title, hint }: { title: string; hint?: string }) => (
  <div style={styles.box}>
    <strong>{title}</strong>
    {hint ? <p style={styles.p}>{hint}</p> : null}
  </div>
);

export const MapSlot = ({ children }: { children?: ReactNode }) => (
  <section aria-label="Слот карты" style={styles.map}>
    <p style={styles.p}>Карта будет подключена через runtime F05. Сейчас отображается слот композиции.</p>
    {children}
  </section>
);

const styles: Record<string, CSSProperties> = {
  banner: {
    background: 'var(--color-warning-soft)',
    color: 'var(--color-warning)',
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    marginBottom: 24,
  },
  box: {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-line)',
    borderRadius: 'var(--radius)',
    padding: 24,
  },
  p: { margin: '8px 0 0', color: 'var(--color-text-muted)' },
  button: {
    marginTop: 12,
    background: 'var(--color-accent)',
    color: '#fff',
    border: 0,
    borderRadius: 8,
    padding: '8px 14px',
  },
  map: {
    minHeight: 280,
    border: '1px dashed var(--color-accent)',
    borderRadius: 'var(--radius)',
    padding: 24,
    background: 'var(--color-accent-soft)',
  },
};
