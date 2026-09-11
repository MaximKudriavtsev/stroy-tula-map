import type { CSSProperties, ReactNode } from 'react';

export const AppShell = ({
  title,
  eyebrow,
  nav,
  children,
}: {
  title: string;
  eyebrow: string;
  nav: ReactNode;
  children: ReactNode;
}) => (
  <div style={styles.page}>
    <header style={styles.header}>
      <div>
        <p style={styles.eyebrow}>{eyebrow}</p>
        <h1 style={styles.title}>{title}</h1>
      </div>
      <nav style={styles.nav}>{nav}</nav>
    </header>
    <main style={styles.main}>{children}</main>
  </div>
);

const styles: Record<string, CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 24,
    padding: '20px 32px',
    borderBottom: '1px solid var(--color-line)',
    background: 'var(--color-surface)',
  },
  eyebrow: { margin: 0, color: 'var(--color-text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 12 },
  title: { margin: '6px 0 0', fontSize: 24 },
  nav: { display: 'flex', gap: 16, alignItems: 'center' },
  main: { padding: 32, flex: 1 },
};
