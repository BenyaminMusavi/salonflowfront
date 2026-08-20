
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from './Stepper';
import { useState, useEffect } from 'react';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A horizontal stepper component that visually guides users through a sequence of steps. Supports RTL layout with smart scrolling to keep the active step in view.'
      }
    }
  },
  argTypes: {
    steps: {
      control: 'object',
      description: 'Array of step objects with id and label',
      table: {
        type: {
          summary: 'Array<{ id: number; label: string }>'
        }
      }
    },
    activeStep: {
      control: 'number',
      description: 'Currently active step ID',
      table: {
        type: { summary: 'number' }
      }
    },
    onStepClick: {
      description: 'Callback when a step is clicked',
      table: {
        type: { summary: '(id: number) => void' }
      }
    }
  }
};

export default meta;
type Story = StoryObj<typeof Stepper>;

// Sample steps data
const sampleSteps = [
  { id: 1, label: 'اطلاعات پایه' },
  { id: 2, label: 'جزئیات پروژه' },
  { id: 3, label: 'تیم‌سازی' },
  { id: 4, label: 'بررسی نهایی' },
  { id: 5, label: 'تأیید و ارسال' },
];

const shortSteps = [
  { id: 1, label: 'مرحله اول' },
  { id: 2, label: 'مرحله دوم' },
  { id: 3, label: 'مرحله سوم' },
];

const longLabelSteps = [
  { id: 1, label: 'ثبت‌نام و احراز هویت' },
  { id: 2, label: 'تکمیل اطلاعات پروفایل' },
  { id: 3, label: 'بارگذاری مدارک شناسایی' },
  { id: 4, label: 'تأیید اطلاعات توسط سیستم' },
  { id: 5, label: 'فعال‌سازی حساب کاربری' },
];

// ======================
// INTERACTIVE EXAMPLES
// ======================

const InteractiveStepper = ({ initialSteps, initialStep = 1 }: {initialSteps: {id: number, label: string}[], initialStep: number}) => {
  const [steps] = useState(initialSteps);
  const [activeStep, setActiveStep] = useState(initialStep);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-8 p-4 bg-surface-secondary rounded-lg">
        <h3 className="text-lg font-semibold mb-2">وضعیت فعلی: {activeStep}</h3>
        <p className="text-content-secondary text-sm">
          مرحله فعال: {steps.find(s => s.id === activeStep)?.label}
        </p>
      </div>

      <Stepper
        steps={steps}
        activeStep={activeStep}
        onStepClick={setActiveStep}
      />

      <div className="mt-8 flex gap-3 justify-center">
        <button
          onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
          disabled={activeStep === 1}
          className="px-4 py-2 bg-surface-brand text-content-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          مرحله قبلی
        </button>
        <button
          onClick={() => setActiveStep(prev => Math.min(steps.length, prev + 1))}
          disabled={activeStep === steps.length}
          className="px-4 py-2 bg-surface-brand text-content-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          مرحله بعدی
        </button>
        <button
          onClick={() => setActiveStep(1)}
          className="px-4 py-2 bg-surface-error text-content-white rounded-lg"
        >
          بازنشانی
        </button>
      </div>
    </div>
  );
};

// ======================
// STORIES
// ======================

export const Default: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(3);

    return (
      <div className="w-full max-w-3xl p-6">
        <Stepper
          steps={sampleSteps}
          activeStep={activeStep}
          onStepClick={setActiveStep}
        />
        <div className="mt-6 text-center text-content-secondary">
          <p>برای تغییر مرحله، روی هر دایره یا برچسب کلیک کنید</p>
          <p className="text-sm mt-2">مرحله فعال: {activeStep}</p>
        </div>
      </div>
    );
  }
};

export const ShortStepper: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(2);

    return (
      <div className="w-full max-w-2xl p-6">
        <Stepper
          steps={shortSteps}
          activeStep={activeStep}
          onStepClick={setActiveStep}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Stepper with fewer steps (3 steps). Note the different spacing and alignment.'
      }
    }
  }
};

export const LongLabels: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(1);

    return (
      <div className="w-full max-w-4xl p-6">
        <Stepper
          steps={longLabelSteps}
          activeStep={activeStep}
          onStepClick={setActiveStep}
        />
        <div className="mt-4 text-center text-content-secondary text-sm">
          <p>استپر با برچسب‌های طولانی‌تر - متن‌ها به درستی راست‌چین می‌شوند</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Stepper with longer step labels to demonstrate text wrapping and RTL alignment.'
      }
    }
  }
};

export const CompleteWorkflow: Story = {
  render: () => <InteractiveStepper initialSteps={sampleSteps} initialStep={1} />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive example showing a complete workflow with navigation controls. Demonstrates how the stepper automatically scrolls to keep the active step in view.'
      }
    }
  }
};

export const FormWizard: Story = {
  render: () => {
    const formSteps = [
      { id: 1, label: 'اطلاعات شخصی' },
      { id: 2, label: 'آدرس' },
      { id: 3, label: 'اطلاعات تماس' },
      { id: 4, label: 'تأیید نهایی' },
    ];

    const [activeStep, setActiveStep] = useState(1);
    const [formData, setFormData] = useState({
      name: '',
      address: '',
      phone: '',
    });

    const stepContent = {
      1: (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="نام و نام خانوادگی"
            className="w-full p-3 border rounded-lg"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
      ),
      2: (
        <div className="space-y-4">
          <textarea
            placeholder="آدرس کامل"
            className="w-full p-3 border rounded-lg"
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>
      ),
      3: (
        <div className="space-y-4">
          <input
            type="tel"
            placeholder="شماره تماس"
            className="w-full p-3 border rounded-lg"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
      ),
      4: (
        <div className="p-4 border rounded-lg bg-surface-secondary">
          <h4 className="font-semibold mb-3">خلاصه اطلاعات:</h4>
          <p><strong>نام:</strong> {formData.name || 'تعیین نشده'}</p>
          <p><strong>آدرس:</strong> {formData.address || 'تعیین نشده'}</p>
          <p><strong>تلفن:</strong> {formData.phone || 'تعیین نشده'}</p>
        </div>
      ),
    };

    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">فرم ثبت‌نام چند مرحله‌ای</h2>
          <p className="text-content-secondary">مراحل را تکمیل کنید</p>
        </div>

        <Stepper
          steps={formSteps}
          activeStep={activeStep}
          onStepClick={setActiveStep}
        />

        <div className="mt-8 p-6 border rounded-lg bg-surface-white">
          <h3 className="text-lg font-semibold mb-4">
            مرحله {activeStep}: {formSteps.find(s => s.id === activeStep)?.label}
          </h3>

          {stepContent[activeStep as keyof typeof stepContent]}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="px-6 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              قبلی
            </button>

            <button
              onClick={() => {
                if (activeStep < formSteps.length) {
                  setActiveStep(prev => prev + 1);
                } else {
                  alert('فرم با موفقیت ثبت شد!');
                }
              }}
              className="px-6 py-2 bg-surface-brand text-content-white rounded-lg"
            >
              {activeStep === formSteps.length ? 'ارسال فرم' : 'ادامه'}
            </button>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Practical example of using the stepper in a multi-step form wizard. Shows how the stepper integrates with form content and navigation.'
      }
    }
  }
};

export const AutoProgress: Story = {
  render: () => {
    const [activeStep, setActiveStep] = useState(1);
    const [isAutoProgress, setIsAutoProgress] = useState(false);

    useEffect(() => {
      if (!isAutoProgress) return;

      const interval = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= sampleSteps.length) {
            clearInterval(interval);
            setIsAutoProgress(false);
            return 1;
          }
          return prev + 1;
        });
      }, 1500);

      return () => clearInterval(interval);
    }, [isAutoProgress]);

    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="mb-6 p-4 bg-surface-warning/10 border border-surface-warning rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">پیشرفت خودکار</h3>
              <p className="text-sm text-content-secondary">استپر به طور خودکار بین مراحل حرکت می‌کند</p>
            </div>
            <button
              onClick={() => setIsAutoProgress(!isAutoProgress)}
              className={`px-4 py-2 rounded-lg ${
                isAutoProgress
                  ? 'bg-surface-error text-content-white'
                  : 'bg-surface-success text-content-white'
              }`}
            >
              {isAutoProgress ? 'توقف' : 'شروع پیشرفت خودکار'}
            </button>
          </div>
        </div>

        <Stepper
          steps={sampleSteps}
          activeStep={activeStep}
          onStepClick={setActiveStep}
        />

        <div className="mt-6 text-center">
          <p className="text-content-secondary">
            حالت: <span className="font-semibold">{isAutoProgress ? 'فعال' : 'غیرفعال'}</span>
          </p>
          <p className="text-sm mt-2">
            مشاهده کنید که استپر چگونه به طور خودکار برای نمایش مرحله فعال اسکرول می‌کند
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the automatic scrolling behavior as the active step changes. The stepper smoothly scrolls to keep the active step properly positioned in the viewport.'
      }
    }
  }
};

export const EdgeCases: Story = {
  render: () => {
    const manySteps = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      label: `مرحله ${i + 1}`,
    }));

    const [activeStep, setActiveStep] = useState(5);

    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">استپر با مراحل زیاد (10 مرحله)</h3>
          <p className="text-content-secondary text-sm">
            اسکرول افقی را مشاهده کنید - استپر به طور خودکار مرحله فعال را در مرکز قرار می‌دهد
          </p>
        </div>

        <Stepper
          steps={manySteps}
          activeStep={activeStep}
          onStepClick={setActiveStep}
        />

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {[1, 3, 5, 7, 10].map(step => (
            <button
              key={step}
              onClick={() => setActiveStep(step)}
              className={`px-3 py-1 rounded ${
                activeStep === step
                  ? 'bg-surface-brand text-content-white'
                  : 'bg-surface-secondary'
              }`}
            >
              برو به {step}
            </button>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Edge case with many steps. Shows how the stepper handles horizontal overflow and maintains proper scroll positioning for first, middle, and last steps.'
      }
    }
  }
};

export const CustomizationExample: Story = {
  render: () => {
    const customSteps = [
      { id: 1, label: 'شروع' },
      { id: 2, label: 'در حال انجام' },
      { id: 3, label: 'تکمیل شده' },
      { id: 4, label: 'ارزیابی' },
    ];

    const [activeStep, setActiveStep] = useState(2);

    return (
      <div className="w-full max-w-3xl p-6">
        <div className="mb-6 p-4 border-l-4 border-surface-brand bg-surface-brand/5">
          <h3 className="font-semibold mb-1">نکات سفارشی‌سازی</h3>
          <ul className="text-sm text-content-secondary list-disc pr-4 space-y-1">
            <li>نوارهای اتصال از <code className="bg-surface-tertiary px-1 rounded">bg-border-primary</code> استفاده می‌کنند</li>
            <li>دایره‌های فعال دارای <code className="bg-surface-tertiary px-1 rounded">inset-ring</code> هستند</li>
            <li>برچسب‌های فعال پررنگ و تیره‌تر هستند</li>
            <li>استپر از <code className="bg-surface-tertiary px-1 rounded">dir="rtl"</code> پشتیبانی می‌کند</li>
          </ul>
        </div>

        <Stepper
          steps={customSteps}
          activeStep={activeStep}
          onStepClick={setActiveStep}
        />

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-2">مراحل اول/آخر</h4>
            <p>مرحله اول: تراز به راست، اسنپ به شروع</p>
            <p>مرحله آخر: تراز به چپ، اسنپ به پایان</p>
          </div>
          <div className="p-3 border rounded-lg">
            <h4 className="font-semibold mb-2">مراحل میانی</h4>
            <p>تراز به مرکز، اسنپ به مرکز</p>
            <p>حداقل عرض متفاوت برای فضای بهتر</p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows customization details and explains the component\'s smart alignment and snapping behavior for different step positions.'
      }
    }
  }
};