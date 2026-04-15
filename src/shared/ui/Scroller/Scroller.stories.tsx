import type { Meta, StoryObj } from '@storybook/nextjs';
import Scroller, { ScrollerDirection } from '@/shared/ui/Scroller';

const meta: Meta<typeof Scroller> = {
  title: 'UI/Scroller',
  component: Scroller,
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'] satisfies ScrollerDirection[],
    },
  },
  args: {
    direction: 'vertical',
  },
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

const lipsum = Array.from(
  { length: 20 },
  (_, i) =>
    `Строка ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.`
);

export const Vertical: Story = {
  render: (args) => (
    <Scroller {...args} style={{ height: 200, width: 300 }}>
      {lipsum.map((line, i) => (
        <p key={i} className="py-spacing-4 text-14 text-blackinverse-a100">
          {line}
        </p>
      ))}
    </Scroller>
  ),
};

export const Horizontal: Story = {
  args: { direction: 'horizontal' },
  render: (args) => (
    <Scroller {...args} style={{ width: 300, whiteSpace: 'nowrap' }}>
      {lipsum.map((line, i) => (
        <span
          key={i}
          className="inline-block px-spacing-8 text-14 text-blackinverse-a100"
        >
          {line}
        </span>
      ))}
    </Scroller>
  ),
};
