import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell, Button, SelectField, SimpleForm, TextField } from '@tula/ui';

export const ObjectFormPage = () => {
  const [name, setName] = useState('Демонстрационная школа А');
  const [type, setType] = useState('SCHOOL');
  const [saved, setSaved] = useState('');

  return (
    <AppShell eyebrow="Черновик" title="Форма объекта" nav={<Link to="/">К таблице</Link>}>
      <SimpleForm
        onSubmit={() => {
          setSaved(`Черновик «${name}» (${type}) остаётся локальным: запись в API появится в F03/F06.`);
        }}
      >
        <TextField label="Название" name="name" value={name} onChange={setName} />
        <SelectField
          label="Тип"
          name="type"
          value={type}
          onChange={setType}
          options={[
            { value: 'SCHOOL', label: 'Школа' },
            { value: 'MEDICAL', label: 'Медицина' },
            { value: 'BOILER', label: 'Котельная' },
            { value: 'OTHER', label: 'Иное' },
          ]}
        />
        <Button type="submit">Проверить форму</Button>
        {saved ? <p>{saved}</p> : null}
      </SimpleForm>
    </AppShell>
  );
};
