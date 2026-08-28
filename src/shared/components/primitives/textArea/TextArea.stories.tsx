
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from './TextArea';
import { TextAreaReactHookForm } from './TextAreaReactHookForm';
import { ChatCircleIcon, WarningCircleIcon, LockIcon, UserIcon } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {motion} from "motion/react"
import { Button } from "@/shared/components/primitives/button/Button";

const meta: Meta<typeof TextArea> = {
  title: 'Components/TextArea',
  component: TextArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable textarea component with support for icons, error states, and React Hook Form integration. Features smooth animations and RTL support.'
      }
    }
  },
  argTypes: {
    hasError: {
      control: 'boolean',
      description: 'Shows error styling',
      table: {
        defaultValue: { summary: 'false' }
      }
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the textarea',
      table: {
        defaultValue: { summary: 'false' }
      }
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text'
    },
    rows: {
      control: 'number',
      description: 'Number of visible text lines'
    },
    startIcon: {
      control: 'boolean',
      description: 'Show start icon (right side in RTL)',
      mapping: {
        true: <ChatCircleIcon className="size-4" />,
        false: undefined
      }
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the textarea'
    },
    inputWrapperClassname: {
      control: 'text',
      description: 'Additional CSS classes for the wrapper'
    }
  }
};

export default meta;
type Story = StoryObj<typeof TextArea>;

// ======================
// BASE TEXTAREA STORIES
// ======================

export const Default: Story = {
  args: {
    placeholder: 'متن خود را اینجا بنویسید...',
    rows: 4
  }
};

export const WithIcon: Story = {
  args: {
    placeholder: 'نظر خود را بنویسید...',
    startIcon: <ChatCircleIcon className="size-4" />,
    rows: 3
  },
  parameters: {
    docs: {
      description: {
        story: 'Textarea with a start icon positioned on the right side (RTL layout).'
      }
    }
  }
};

export const ErrorState: Story = {
  args: {
    placeholder: 'این فیلد دارای خطاست',
    hasError: true,
    defaultValue: 'مقدار نادرست',
    rows: 3
  },
  parameters: {
    docs: {
      description: {
        story: 'Textarea in error state with red ring indication.'
      }
    }
  }
};

export const Disabled: Story = {
  args: {
    placeholder: 'این فیلد غیرفعال است',
    disabled: true,
    defaultValue: 'مقدار قابل ویرایش نیست',
    rows: 3
  }
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-96">
      <div>
        <label className="block text-sm font-medium mb-2">متن کوتاه (2 خط)</label>
        <TextArea
          placeholder="متن کوتاه..."
          rows={2}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">متن متوسط (4 خط)</label>
        <TextArea
          placeholder="متن متوسط..."
          rows={4}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">متن طولانی (8 خط)</label>
        <TextArea
          placeholder="متن طولانی..."
          rows={8}
        />
      </div>
    </div>
  )
};

// ======================
// ICON VARIATIONS
// ======================

export const IconVariations: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-96">
      <TextArea
        placeholder="پیام..."
        startIcon={<ChatCircleIcon className="size-4" />}
        rows={3}
      />
      <TextArea
        placeholder="توضیحات خطا..."
        startIcon={<WarningCircleIcon className="size-4" />}
        hasError
        rows={3}
      />
      <TextArea
        placeholder="متن محرمانه..."
        startIcon={<LockIcon className="size-4" />}
        rows={3}
      />
      <TextArea
        placeholder="بیوگرافی..."
        startIcon={<UserIcon className="size-4" />}
        rows={3}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different icon variations for various use cases.'
      }
    }
  }
};

// ======================
// REACT HOOK FORM STORIES
// ======================

// Schema for validation
const formSchema = z.object({
  comment: z.string().min(10, 'نظر باید حداقل ۱۰ کاراکتر باشد').max(500, 'نظر نمی‌تواند بیشتر از ۵۰۰ کاراکتر باشد'),
  description: z.string().optional(),
  bio: z.string().min(20, 'بیوگرافی باید حداقل ۲۰ کاراکتر باشد').max(1000, 'بیوگرافی نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد'),
  notes: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

export const WithReactHookForm: StoryObj<typeof TextAreaReactHookForm> = {
  render: function Render() {
    const {
      control,
      handleSubmit,
      formState: { errors },
      reset
    } = useForm<FormData>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        comment: '',
        description: '',
        bio: '',
        notes: ''
      }
    });

    const onSubmit = (data: FormData) => {
      alert(JSON.stringify(data, null, 2));
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="w-96 space-y-6">
        <div className="p-4 border rounded-lg bg-surface-secondary">
          <h3 className="font-semibold mb-2">فرم با اعتبارسنجی</h3>
          <p className="text-sm text-content-secondary">
            خطاها با انیمیشن ظاهر می‌شوند و با حل شدن ناپدید می‌شوند
          </p>
        </div>

        <TextAreaReactHookForm
          control={control}
          name="comment"
          label="نظر شما"
          placeholder="نظر خود را اینجا بنویسید (حداقل ۱۰ کاراکتر)..."
          startIcon={<ChatCircleIcon className="size-4" />}
          rows={3}
        />

        <TextAreaReactHookForm
          control={control}
          name="description"
          label="توضیحات"
          placeholder="توضیحات اختیاری..."
          rows={2}
        />

        <TextAreaReactHookForm
          control={control}
          name="bio"
          label="بیوگرافی"
          placeholder="درباره خودتان بنویسید (حداقل ۲۰ کاراکتر)..."
          startIcon={<UserIcon className="size-4" />}
          rows={4}
        />

        <div className="flex gap-3 pt-4">
          <Button type="submit" variant="default">
            ارسال فرم
          </Button>
          <Button type="button" variant="default" onClick={() => reset()}>
            پاک کردن
          </Button>
        </div>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Integration with React Hook Form including validation with Zod. Error messages appear with smooth animations.'
      }
    }
  }
};

// ======================
// FORM WORKFLOW EXAMPLE
// ======================

export const ContactFormExample: Story = {
  render: function Render() {
    const contactSchema = z.object({
      name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
      email: z.string().email('ایمیل معتبر وارد کنید'),
      message: z.string().min(20, 'پیام باید حداقل ۲۰ کاراکتر باشد').max(1000, 'پیام نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد'),
      feedback: z.string().optional()
    });

    type ContactData = z.infer<typeof contactSchema>;

    const {
      control,
      handleSubmit,
      formState: { isSubmitting, isSubmitSuccessful },
      reset
    } = useForm<ContactData>({
      resolver: zodResolver(contactSchema),
      defaultValues: {
        name: '',
        email: '',
        message: '',
        feedback: ''
      }
    });

    const onSubmit = async (data: ContactData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form submitted:', data);
    };

    if (isSubmitSuccessful) {
      return (
        <div className="w-96 p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-surface-success rounded-full flex items-center justify-center mx-auto mb-4">
              <ChatCircleIcon className="size-8 text-content-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">پیام شما ارسال شد!</h3>
            <p className="text-content-secondary">با تشکر از شما برای تماس با ما</p>
          </div>
          <Button onClick={() => reset()}>ارسال پیام جدید</Button>
        </div>
      );
    }

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="w-96 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">فرم تماس</h2>
          <p className="text-content-secondary">پیام خود را برای ما ارسال کنید</p>
        </div>

        <TextAreaReactHookForm
          control={control}
          name="message"
          label="پیام شما"
          placeholder="پیام خود را با جزئیات بنویسید..."
          startIcon={<ChatCircleIcon className="size-4" />}
          rows={5}
        />

        <TextAreaReactHookForm
          control={control}
          name="feedback"
          label="پیشنهادات (اختیاری)"
          placeholder="پیشنهادات و انتقادات خود را بنویسید..."
          startIcon={<WarningCircleIcon className="size-4" />}
          rows={3}
        />

        <div className="p-4 border rounded-lg bg-surface-secondary">
          <h4 className="font-semibold mb-2">راهنما</h4>
          <ul className="text-sm text-content-secondary space-y-1 list-disc pr-4">
            <li>پیام باید حداقل ۲۰ کاراکتر باشد</li>
            <li>حداکثر ۱۰۰۰ کاراکتر مجاز است</li>
            <li>پیشنهادات اختیاری هستند</li>
            <li>خطاها با انیمیشن نمایش داده می‌شوند</li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'در حال ارسال...' : 'ارسال پیام'}
        </Button>
      </form>
    );
  }
};

// ======================
// REAL-TIME VALIDATION DEMO
// ======================

export const RealTimeValidation: Story = {
  render: function Render() {
    const validationSchema = z.object({
      tweet: z.string()
        .min(10, 'حداقل ۱۰ کاراکتر نیاز است')
        .max(280, 'حداکثر ۲۸۰ کاراکتر مجاز است')
        .regex(/^[^#@]*$/, 'از # و @ استفاده نکنید')
    });

    type ValidationData = z.infer<typeof validationSchema>;

    const {
      control,
      watch,
      formState: { errors }
    } = useForm<ValidationData>({
      resolver: zodResolver(validationSchema),
      mode: 'onChange',
      defaultValues: {
        tweet: ''
      }
    });

    const tweetText = watch('tweet') || '';
    const charCount = tweetText.length;
    const maxChars = 280;
    const charPercentage = (charCount / maxChars) * 100;

    const getColorClass = () => {
      if (charCount > maxChars) return 'text-surface-error-fill';
      if (charCount > maxChars * 0.8) return 'text-surface-warning-fill';
      return 'text-content-secondary';
    };

    return (
      <div className="w-96 space-y-4">
        <div className="p-4 border rounded-lg bg-surface-secondary">
          <h3 className="font-semibold mb-2">اعتبارسنجی بلادرنگ</h3>
          <p className="text-sm text-content-secondary">اعتبارسنجی با تغییر متن به‌روز می‌شود</p>
        </div>

        <TextAreaReactHookForm
          control={control}
          name="tweet"
          label="توییت (بدون # و @)"
          placeholder="توییت خود را بنویسید (حداکثر ۲۸۰ کاراکتر، بدون # و @)..."
          startIcon={<ChatCircleIcon className="size-4" />}
          rows={3}
        />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={getColorClass()}>
              {charCount} / {maxChars} کاراکتر
            </span>
            <span className={charCount > maxChars ? 'text-surface-error-fill' : 'text-content-secondary'}>
              {charCount > maxChars ? 'تعداد کاراکتر بیش از حد مجاز' : 'مجاز'}
            </span>
          </div>

          <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                charCount > maxChars
                  ? 'bg-surface-error-fill'
                  : charCount > maxChars * 0.8
                    ? 'bg-surface-warning-fill'
                    : 'bg-surface-brand-fill'
              }`}
              style={{ width: `${Math.min(charPercentage, 100)}%` }}
            />
          </div>
        </div>

        {!errors.tweet && tweetText.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 border border-surface-success rounded-lg bg-surface-success/10"
          >
            <p className="text-sm text-content-success">
              ✓ متن معتبر است ({charCount} کاراکتر)
            </p>
          </motion.div>
        )}
      </div>
    );
  }
};

// ======================
// ACCESSIBILITY DEMO
// ======================

export const AccessibilityExample: Story = {
  render: () => (
    <div className="w-96 space-y-6">
      <div className="p-4 border rounded-lg bg-surface-secondary">
        <h3 className="font-semibold mb-2">ویژگی‌های دسترسی</h3>
        <ul className="text-sm text-content-secondary space-y-1 list-disc pr-4">
          <li>برچسب‌های صحیح برای صفحه‌خوان‌ها</li>
          <li>تمرکز واضح با حلقه inset</li>
          <li>حالت خطا با رنگ با کنتراست بالا</li>
          <li>حالت غیرفعال با شفافیت مناسب</li>
          <li>پشتیبانی کامل از RTL</li>
        </ul>
      </div>

      <div>
        <label htmlFor="accessible-textarea" className="block text-sm font-medium mb-2">
          متن نمونه با برچسب مناسب
        </label>
        <TextArea
          id="accessible-textarea"
          placeholder="این یک نمونه قابل دسترس است..."
          aria-describedby="textarea-help"
          rows={3}
        />
        <p id="textarea-help" className="text-xs text-content-secondary mt-2">
          این متن کمکی برای صفحه‌خوان‌ها است
        </p>
      </div>

      <div>
        <label htmlFor="error-accessible" className="block text-sm font-medium mb-2 text-surface-error-fill">
          حالت خطا (دسترسی)
        </label>
        <TextArea
          id="error-accessible"
          placeholder="این فیلد دارای خطاست..."
          hasError
          aria-invalid="true"
          aria-describedby="error-message"
          rows={2}
        />
        <p id="error-message" className="text-xs text-surface-error-fill mt-2">
          این یک پیام خطای نمونه برای صفحه‌خوان‌ها است
        </p>
      </div>
    </div>
  )
};
