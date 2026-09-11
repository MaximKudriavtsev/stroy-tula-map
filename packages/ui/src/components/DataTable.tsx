import type { CSSProperties, ReactNode } from 'react';

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export const DataTable = <T,>({
  columns,
  rows,
  getRowId,
}: {
  columns: Array<Column<T>>;
  rows: T[];
  getRowId: (row: T) => string;
}) => (
  <div style={styles.wrap}>
    <table style={styles.table}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} style={styles.th}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getRowId(row)}>
            {columns.map((column) => (
              <td key={column.key} style={styles.td}>
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const styles: Record<string, CSSProperties> = {
  wrap: {
    overflow: 'auto',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-line)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow)',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--color-line)', fontSize: 13, color: 'var(--color-text-muted)' },
  td: { padding: '12px 16px', borderBottom: '1px solid var(--color-line)', verticalAlign: 'top' },
};
