import type { CSSProperties, FormEvent, ReactNode } from 'react';

export const Button = ({
  children,
  type = 'button',
  onClick,
}: {
  children: ReactNode;
  type?: 'button' | 'submit';
  onClick?: () => void;
}) => (
  <button type={type} onClick={onClick} style={styles.button}>
    {children}
  </button>
);

export const TextField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <label style={styles.label}>
    {label}
    <input
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      style={styles.input}
    />
  </label>
);

export const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) => (
  <label style={styles.label}>
    {label}
    <select name={name} value={value} onChange={(event) => onChange(event.target.value)} style={styles.input}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

export const SimpleForm = ({
  children,
  onSubmit,
}: {
  children: ReactNode;
  onSubmit: () => void;
}) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };
  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {children}
    </form>
  );
};

const styles: Record<string, CSSProperties> = {
  form: { display: 'grid', gap: 12, background: 'var(--color-surface)', padding: 20, borderRadius: 'var(--radius)', border: '1px solid var(--color-line)' },
  label: { display: 'grid', gap: 6, fontSize: 14 },
  input: { padding: '10px 12px', borderRadius: 8, border: '1px solid var(--color-line)', background: '#fff' },
  button: {
    background: 'var(--color-accent)',
    color: '#fff',
    border: 0,
    borderRadius: 8,
    padding: '10px 16px',
    width: 'fit-content',
  },
};
