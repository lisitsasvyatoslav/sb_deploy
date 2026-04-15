import type { Meta, StoryObj } from '@storybook/nextjs';
import Divider, { DividerOrientation } from '@/shared/ui/Divider';

const meta: Meta<typeof Divider> = {
  title: 'UI/Divider',
  component: Divider,
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'] satisfies DividerOrientation[],
    },
  },
  args: {
    orientation: 'horizontal',
  },
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => (
    <div
      style={{ display: 'flex', height: 40, alignItems: 'stretch', gap: 16 }}
    >
      <span className="text-14 text-blackinverse-a100">Слева</span>
      <Divider {...args} />
      <span className="text-14 text-blackinverse-a100">Справа</span>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div className="flex flex-col w-64">
      {['Элемент 1', 'Элемент 2', 'Элемент 3'].map((item, i, arr) => (
        <div key={item}>
          <p className="py-spacing-8 text-14 text-blackinverse-a100">{item}</p>
          {i < arr.length - 1 && <Divider />}
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { disable: true } },
};
