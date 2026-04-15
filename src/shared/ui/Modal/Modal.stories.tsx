import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import { useState } from 'react';
import { Modal } from './Modal';
import { ModalBody } from './ModalBody';
import { ModalFooter } from './ModalFooter';
import { ModalHeader } from './ModalHeader';
import { ModalTitle } from './ModalTitle';
import type { ModalSize } from './Modal.types';
import Button from '@/shared/ui/Button/Button';

// Helper — кнопка открытия + сам модал
function ModalDemo({
  label = 'Открыть модал',
  children,
  ...props
}: Partial<React.ComponentProps<typeof Modal>> & { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="accent" size="md" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal open={open} onOpenChange={setOpen} {...props}>
        {children}
      </Modal>
    </>
  );
}

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],

  argTypes: {
    open: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    children: { table: { disable: true } },
    maxWidth: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'] satisfies ModalSize[],
      description: 'Максимальная ширина модального окна',
      table: { defaultValue: { summary: 'lg' } },
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Показывать кнопку закрытия × в шапке',
      table: { defaultValue: { summary: 'true' } },
    },
    expandable: {
      control: 'boolean',
      description: 'Разрешить раскрытие на весь экран',
    },
    className: { control: 'text' },
    zIndex: { table: { disable: true } },
    leftContent: { table: { disable: true } },
    editorConfig: { table: { disable: true } },
    editableTitle: { table: { disable: true } },
    onAskAI: { table: { disable: true } },
    expandedBounds: { table: { disable: true } },
  },

  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <ModalDemo label="Базовый модал">
      <ModalBody>
        <p>Это базовое содержимое модального окна.</p>
      </ModalBody>
    </ModalDemo>
  ),
  parameters: { controls: { disable: true } },
};

export const WithHeader: Story = {
  render: () => (
    <ModalDemo label="Модал с заголовком">
      <ModalHeader>
        <ModalTitle>Заголовок модала</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <p>Содержимое с заголовком сверху.</p>
      </ModalBody>
    </ModalDemo>
  ),
  parameters: { controls: { disable: true } },
};

export const WithHeaderAndFooter: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="accent" size="md" onClick={() => setOpen(true)}>
          Модал с футером
        </Button>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalHeader>
            <ModalTitle>Подтверждение</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>Вы уверены, что хотите выполнить это действие?</p>
          </ModalBody>
          <ModalFooter align="right">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button variant="accent" size="sm" onClick={() => setOpen(false)}>
              Подтвердить
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

export const WithFooterLeftContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="accent" size="md" onClick={() => setOpen(true)}>
          Модал с левым контентом в футере
        </Button>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalHeader>
            <ModalTitle>Редактирование</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>Форма редактирования данных.</p>
          </ModalBody>
          <ModalFooter
            leftContent={
              <Button variant="negative" size="sm" onClick={fn()}>
                Удалить
              </Button>
            }
          >
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button variant="accent" size="sm" onClick={() => setOpen(false)}>
              Сохранить
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

export const SmallSize: Story = {
  render: () => (
    <ModalDemo label="Маленький модал" maxWidth="sm">
      <ModalHeader>
        <ModalTitle>Маленький модал</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <p>Компактный модал для коротких сообщений.</p>
      </ModalBody>
    </ModalDemo>
  ),
  parameters: { controls: { disable: true } },
};

export const LargeSize: Story = {
  render: () => (
    <ModalDemo label="Большой модал" maxWidth="xl">
      <ModalHeader>
        <ModalTitle>Большой модал (xl)</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p>Широкий модал для отображения большого количества информации.</p>
          <p>Используется для детальных форм, таблиц, превью и т.д.</p>
        </div>
      </ModalBody>
    </ModalDemo>
  ),
  parameters: { controls: { disable: true } },
};

export const Expandable: Story = {
  render: () => (
    <ModalDemo
      label="Раскрываемый модал"
      expandable
      expandedBounds={{ left: 60, right: 0 }}
    >
      <ModalHeader>
        <ModalTitle>Расширяемый модал</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <p>
          Этот модал можно развернуть кнопкой в правом верхнем углу. Панель не
          перекрывает боковую панель (отступ 60px слева).
        </p>
      </ModalBody>
    </ModalDemo>
  ),
  parameters: { controls: { disable: true } },
};

export const ExpandableFullWidth: Story = {
  render: () => (
    <ModalDemo label="Full-width expandable modal" expandable>
      <ModalHeader>
        <ModalTitle>Full-width expanded panel</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <p>
          No expandedBounds provided — the panel falls back to left: 0, right: 0
          and covers the full viewport width when expanded.
        </p>
      </ModalBody>
    </ModalDemo>
  ),
  parameters: { controls: { disable: true } },
};

export const WithoutCloseButton: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="accent" size="md" onClick={() => setOpen(true)}>
          Модал без крестика
        </Button>
        <Modal open={open} onOpenChange={setOpen} showCloseButton={false}>
          <ModalHeader>
            <ModalTitle>Без кнопки закрытия</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>Закрыть можно только кнопкой или нажатием Escape.</p>
          </ModalBody>
          <ModalFooter align="right">
            <Button variant="accent" size="sm" onClick={() => setOpen(false)}>
              Закрыть
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
  parameters: { controls: { disable: true } },
};

export const FullScreen: Story = {
  render: () => (
    <ModalDemo label="Полноэкранный модал" fullScreen>
      <ModalBody padding="none">
        <div className="flex h-full">
          <div className="flex-1 p-6">
            <h2 className="text-xl font-semibold mb-4">Левая панель</h2>
            <p>Основное содержимое на весь экран без скруглений и отступов.</p>
          </div>
          <div className="w-[50%] max-w-[757px] bg-[var(--surface-medium)] flex items-center justify-center p-8">
            <p className="text-[var(--text-secondary)]">Правая панель</p>
          </div>
        </div>
      </ModalBody>
    </ModalDemo>
  ),
  parameters: { controls: { disable: true } },
};

/** Все размеры — набор кнопок для сравнения */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['sm', 'md', 'lg', 'xl'] as ModalSize[]).map((size) => (
        <ModalDemo key={size} label={`maxWidth="${size}"`} maxWidth={size}>
          <ModalHeader>
            <ModalTitle>Размер: {size}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>Модал с maxWidth=&quot;{size}&quot;</p>
          </ModalBody>
        </ModalDemo>
      ))}
      <ModalDemo key="full" label="fullScreen" fullScreen>
        <ModalHeader>
          <ModalTitle>Размер: fullScreen</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p>Полноэкранный модал</p>
        </ModalBody>
      </ModalDemo>
    </div>
  ),
  parameters: { controls: { disable: true }, layout: 'padded' },
};
