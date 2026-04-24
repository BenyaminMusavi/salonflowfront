import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';
import { Rocket, AlertCircle, CheckCircle2, Zap, Info, XCircle } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A small status indicator for labels, tags, and metadata. Supports multiple semantic variants, visual kinds, sizes, and disabled states.'
      }
    }
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'brand', 'success', 'warning', 'error'],
      description: 'Semantic variant of the badge',
      table: {
        defaultValue: { summary: 'default' }
      }
    },
    kind: {
      control: 'radio',
      options: ['normal', 'fill'],
      description: 'Visual treatment style',
      table: {
        defaultValue: { summary: 'normal' }
      }
    },
    size: {
      control: 'radio',
      options: ['sm', 'md'],
      description: 'Size of the badge',
      table: {
        defaultValue: { summary: 'md' }
      }
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state of the badge',
      table: {
        defaultValue: { summary: 'false' }
      }
    },
    asChild: {
      control: 'boolean',
      description: 'Use the Slot component to merge props',
      table: {
        defaultValue: { summary: 'false' }
      }
    },
    children: {
      control: 'text',
      description: 'Badge content'
    }
  }
};

export default meta;
type Story = StoryObj<typeof Badge>;

// ======================
// BASE EXAMPLES
// ======================

export const Default: Story = {
  args: {
    children: 'Default Badge',
    variant: 'default',
    kind: 'normal'
  }
};

export const Brand: Story = {
  args: {
    children: 'Brand Badge',
    variant: 'brand',
    kind: 'normal'
  }
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
    kind: 'normal'
  }
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
    kind: 'normal'
  }
};

export const Error: Story = {
  args: {
    children: 'Error',
    variant: 'error',
    kind: 'normal'
  }
};

// ======================
// DISABLED STATES
// ======================

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Badge disabled variant="default">Default</Badge>
      <Badge disabled variant="brand">Brand</Badge>
      <Badge disabled variant="success">Success</Badge>
      <Badge disabled variant="warning">Warning</Badge>
      <Badge disabled variant="error">Error</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Disabled badges appear with muted styling and are non-interactive.'
      }
    }
  }
};

export const DisabledWithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Badge disabled variant="brand">
        <Rocket className="size-3" />
        New Feature
      </Badge>
      <Badge disabled variant="success">
        <CheckCircle2 className="size-3" />
        Completed
      </Badge>
      <Badge disabled variant="error">
        <XCircle className="size-3" />
        Expired
      </Badge>
    </div>
  )
};

// ======================
// FILL VARIANTS
// ======================

export const FillVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Badge variant="default" kind="fill">Default</Badge>
      <Badge variant="brand" kind="fill">Brand</Badge>
      <Badge variant="success" kind="fill">Success</Badge>
      <Badge variant="warning" kind="fill">Warning</Badge>
      <Badge variant="error" kind="fill">Error</Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Fill variants with solid backgrounds and white text for higher emphasis.'
      }
    }
  }
};

// ======================
// WITH ICONS
// ======================

export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Badge variant="brand">
        <Rocket className="size-3" />
        New Feature
      </Badge>
      <Badge variant="success">
        <CheckCircle2 className="size-3" />
        Completed
      </Badge>
      <Badge variant="warning">
        <AlertCircle className="size-3" />
        Pending
      </Badge>
      <Badge variant="error">
        <AlertCircle className="size-3" />
        Failed
      </Badge>
      <Badge variant="default">
        <Info className="size-3" />
        Info
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges can include icons for better visual communication.'
      }
    }
  }
};

// ======================
// SIZES
// ======================

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Badge size="sm" variant="default">Small</Badge>
        <Badge size="sm" variant="brand">Small</Badge>
        <Badge size="sm" variant="success">Small</Badge>
        <Badge size="sm" variant="warning">Small</Badge>
        <Badge size="sm" variant="error">Small</Badge>
      </div>
      <div className="flex items-center gap-3">
        <Badge size="md" variant="default">Medium</Badge>
        <Badge size="md" variant="brand">Medium</Badge>
        <Badge size="md" variant="success">Medium</Badge>
        <Badge size="md" variant="warning">Medium</Badge>
        <Badge size="md" variant="error">Medium</Badge>
      </div>
    </div>
  )
};

// ======================
// INTERACTIVE EXAMPLES
// ======================

export const AsChildExample: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 items-center">
      <Badge asChild variant="brand" kind="fill">
        <a href="#interactive" className="no-underline hover:opacity-90 transition-opacity">
          Interactive Link Badge
        </a>
      </Badge>
      <Badge asChild variant="success">
        <button
          type="button"
          className="cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => console.log('Clicked!')}
        >
          Button Badge
        </button>
      </Badge>
      <Badge asChild variant="error" disabled>
        <button
          type="button"
          className="cursor-not-allowed"
          disabled
        >
          Disabled Button Badge
        </button>
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Using `asChild` prop to make links or buttons function as badges while preserving their native behavior.'
      }
    }
  }
};

// ======================
// REAL-WORLD SCENARIOS
// ======================

export const StatusIndicators: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Project Status:</span>
        <Badge variant="success">Active</Badge>
        <Badge variant="brand" kind="fill">v2.0</Badge>
        <Badge variant="warning" disabled>Archived</Badge>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Tasks:</span>
        <Badge variant="default">Backlog: 12</Badge>
        <Badge variant="warning">In Progress: 3</Badge>
        <Badge variant="success">Done: 45</Badge>
        <Badge variant="default" disabled>On Hold: 7</Badge>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Priority:</span>
        <Badge variant="error" kind="fill">Critical</Badge>
        <Badge variant="warning">High</Badge>
        <Badge variant="default">Normal</Badge>
        <Badge variant="default" disabled>Low</Badge>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common usage patterns for status indication in UI components.'
      }
    }
  }
};

export const FilterTags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="success" size="sm">Design</Badge>
      <Badge variant="brand" size="sm">Engineering</Badge>
      <Badge variant="warning" size="sm">Marketing</Badge>
      <Badge variant="brand" size="sm">
        <Zap className="size-3" />
        Featured
      </Badge>
      <Badge variant="default" size="sm" disabled>
        Sales
      </Badge>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Badges used as filter tags with disabled states.'
      }
    }
  }
};

// ======================
// VARIANT MATRIX
// ======================

export const VariantMatrix: Story = {
  render: () => {
    const variants = ['default', 'brand', 'success', 'warning', 'error'] as const;
    const kinds = ['normal', 'fill'] as const;
    const sizes = ['sm', 'md'] as const;

    return (
      <div className="space-y-8">
        {sizes.map(size => (
          <div key={size} className="space-y-4">
            <h3 className="text-sm font-semibold uppercase">{size} Size</h3>
            {kinds.map(kind => (
              <div key={kind} className="space-y-2">
                <h4 className="text-xs font-medium capitalize">{kind} Kind</h4>
                <div className="flex flex-wrap gap-2">
                  {variants.map(variant => (
                    <Badge
                      key={`${variant}-${kind}-${size}`}
                      variant={variant}
                      kind={kind}
                      size={size}
                    >
                      {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </Badge>
                  ))}
                  {/* Disabled example for each kind */}
                  <Badge
                    variant="default"
                    kind={kind}
                    size={size}
                    disabled
                  >
                    Disabled
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete visual reference of all badge variants, kinds, sizes, and disabled states.'
      }
    }
  }
};

// ======================
// PLAYGROUND
// ======================

export const Playground: Story = {
  args: {
    children: 'Playground Badge',
    variant: 'brand',
    kind: 'normal',
    size: 'md',
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test different badge configurations.'
      }
    }
  }
};