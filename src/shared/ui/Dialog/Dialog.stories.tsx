import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import Dialog, { DialogIconType } from './Dialog';
import Button from '@/shared/ui/Button/Button';

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    confirmLabel: { control: 'text' },
    cancelLabel: { control: 'text' },
    icon: {
      control: 'select',
      options: [undefined, 'add', 'edit', 'onBoard', 'delete'] satisfies (
        | DialogIconType
        | undefined
      )[],
    },
    loading: { control: 'boolean' },
  },
  args: {
    title: 'Подтвердите действие',
    subtitle: 'Это действие нельзя будет отменить.',
    confirmLabel: 'Подтвердить',
    cancelLabel: 'Отмена',
    loading: false,
  },
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

const DialogWrapper = (args: React.ComponentProps<typeof Dialog>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Открыть диалог
      </Button>
      <Dialog {...args} open={open} onOpenChange={setOpen} />
    </>
  );
};

export const Default: Story = {
  render: (args) => <DialogWrapper {...args} />,
};

export const WithAddIcon: Story = {
  args: {
    icon: 'add',
    title: 'Создать доску',
    subtitle: 'Введите название новой доски для торгового дневника.',
    confirmLabel: 'Создать',
  },
  render: (args) => <DialogWrapper {...args} />,
};

export const WithEditIcon: Story = {
  args: {
    icon: 'edit',
    title: 'Редактировать запись',
    subtitle: 'Измените данные и нажмите «Сохранить».',
    confirmLabel: 'Сохранить',
  },
  render: (args) => <DialogWrapper {...args} />,
};

export const WithDeleteIcon: Story = {
  args: {
    icon: 'delete',
    title: 'Удалить доску',
    subtitle:
      'Все карточки и данные будут удалены без возможности восстановления.',
    confirmLabel: 'Удалить',
  },
  render: (args) => <DialogWrapper {...args} />,
};

export const Loading: Story = {
  args: {
    icon: 'delete',
    title: 'Удаление...',
    confirmLabel: 'Удалить',
    loading: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return <Dialog {...args} open={open} onOpenChange={setOpen} />;
  },
};

export const AllIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {(['add', 'edit', 'onBoard', 'delete'] as DialogIconType[]).map(
        (icon) => (
          <DialogWrapper
            key={icon}
            open={false}
            onOpenChange={() => {}}
            title={`Диалог: ${icon}`}
            icon={icon}
            confirmLabel="Ок"
            cancelLabel="Отмена"
          />
        )
      )}
    </div>
  ),
  parameters: { controls: { disable: true } },
};
