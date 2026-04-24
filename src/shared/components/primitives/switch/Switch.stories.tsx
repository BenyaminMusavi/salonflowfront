import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch } from './Switch';
import { useState } from 'react';
import { Moon, Sun, Bell, BellOff, Wifi, WifiOff, Lock, Unlock } from 'lucide-react';
import { Button } from "@/shared/components/primitives/button/Button";
import { Label } from "@/shared/components/primitives/label/Label";

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A toggle switch component based on Radix UI. Supports various states, custom styling, and can be controlled or uncontrolled.'
      }
    }
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'The controlled checked state of the switch',
      table: {
        type: { summary: 'boolean' }
      }
    },
    defaultChecked: {
      control: 'boolean',
      description: 'The default checked state when uncontrolled',
      table: {
        type: { summary: 'boolean' }
      }
    },
    disabled: {
      control: 'boolean',
      description: 'When true, prevents the user from interacting with the switch',
      table: {
        defaultValue: { summary: 'false' }
      }
    },
    required: {
      control: 'boolean',
      description: 'When true, indicates that the user must check the switch',
      table: {
        defaultValue: { summary: 'false' }
      }
    },
    onCheckedChange: {
      description: 'Event handler called when the checked state changes',
      table: {
        type: { summary: '(checked: boolean) => void' }
      }
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for custom styling'
    }
  }
};

export default meta;
type Story = StoryObj<typeof Switch>;

// ======================
// BASIC STORIES
// ======================

export const Default: Story = {
  args: {
    defaultChecked: false
  }
};

export const Checked: Story = {
  args: {
    defaultChecked: true
  }
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex items-center gap-3">
        <Switch disabled defaultChecked={false} />
        <span className="text-sm">Disabled (off)</span>
      </div>
      <div className="flex items-center gap-3">
        <Switch disabled defaultChecked={true} />
        <span className="text-sm">Disabled (on)</span>
      </div>
    </div>
  )
};

// ======================
// CONTROLLED EXAMPLE
// ======================

export const Controlled: Story = {
  render: function Render() {
    const [checked, setChecked] = useState(false);

    return (
      <div className="flex flex-col gap-4 items-center">
        <div className="flex items-center gap-3">
          <Switch
            checked={checked}
            onCheckedChange={setChecked}
          />
          <span className="text-sm font-medium">
            {checked ? 'روشن' : 'خاموش'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => setChecked(true)}
          >
            روشن کن
          </Button>
          <Button
            size="sm"
            variant="default"
            onClick={() => setChecked(false)}
          >
            خاموش کن
          </Button>
        </div>
      </div>
    );
  }
};

// ======================
// WITH LABELS
// ======================

export const WithLabel: Story = {
  render: function Render() {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [autoSave, setAutoSave] = useState(true);

    return (
      <div className="space-y-6 w-80">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-switch">اعلان‌ها</Label>
            <p className="text-xs text-content-secondary">دریافت نوتیفیکیشن برای فعالیت‌های جدید</p>
          </div>
          <Switch
            id="notifications-switch"
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="darkmode-switch">حالت تاریک</Label>
            <p className="text-xs text-content-secondary">تغییر تم به حالت تاریک</p>
          </div>
          <Switch
            id="darkmode-switch"
            checked={darkMode}
            onCheckedChange={setDarkMode}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autosave-switch">ذخیره خودکار</Label>
            <p className="text-xs text-content-secondary">ذخیره تغییرات به صورت خودکار</p>
          </div>
          <Switch
            id="autosave-switch"
            checked={autoSave}
            onCheckedChange={setAutoSave}
          />
        </div>
      </div>
    );
  }
};

// ======================
// WITH ICONS
// ======================

export const WithIcons: Story = {
  render: function Render() {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [wifi, setWifi] = useState(true);
    const [privateMode, setPrivateMode] = useState(false);

    return (
      <div className="space-y-6 w-80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {notifications ? (
              <Bell className="size-4 text-surface-brand" />
            ) : (
              <BellOff className="size-4 text-content-secondary" />
            )}
            <div>
              <Label>اعلان‌ها</Label>
              <p className="text-xs text-content-secondary">
                {notifications ? 'فعال' : 'غیرفعال'}
              </p>
            </div>
          </div>
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="size-4 text-surface-brand" />
            ) : (
              <Sun className="size-4 text-content-secondary" />
            )}
            <div>
              <Label>حالت تاریک</Label>
              <p className="text-xs text-content-secondary">
                {darkMode ? 'تاریک' : 'روشن'}
              </p>
            </div>
          </div>
          <Switch
            checked={darkMode}
            onCheckedChange={setDarkMode}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {wifi ? (
              <Wifi className="size-4 text-surface-brand" />
            ) : (
              <WifiOff className="size-4 text-content-secondary" />
            )}
            <div>
              <Label>وای‌فای</Label>
              <p className="text-xs text-content-secondary">
                {wifi ? 'متصل' : 'قطع'}
              </p>
            </div>
          </div>
          <Switch
            checked={wifi}
            onCheckedChange={setWifi}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {privateMode ? (
              <Lock className="size-4 text-surface-brand" />
            ) : (
              <Unlock className="size-4 text-content-secondary" />
            )}
            <div>
              <Label>حالت خصوصی</Label>
              <p className="text-xs text-content-secondary">
                {privateMode ? 'فعال' : 'غیرفعال'}
              </p>
            </div>
          </div>
          <Switch
            checked={privateMode}
            onCheckedChange={setPrivateMode}
          />
        </div>
      </div>
    );
  }
};

// ======================
// SETTINGS PANEL
// ======================

export const SettingsPanel: Story = {
  render: function Render() {
    const [settings, setSettings] = useState({
      notifications: true,
      emailUpdates: false,
      twoFactorAuth: true,
      locationServices: false,
      dataSaver: true,
      autoUpdate: false
    });

    const handleSettingChange = (key: keyof typeof settings) => {
      setSettings(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    };

    return (
      <div className="w-96 border rounded-lg p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">تنظیمات حساب کاربری</h3>
          <p className="text-sm text-content-secondary">تنظیمات حریم خصوصی و اعلان‌ها</p>
        </div>

        <div className="space-y-4">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Label>
                <p className="text-xs text-content-secondary mt-0.5">
                  {getSettingDescription(key as keyof typeof settings)}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={() => handleSettingChange(key as keyof typeof settings)}
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between">
            <span className="text-sm font-medium">تنظیمات فعال:</span>
            <span className="text-sm">
              {Object.values(settings).filter(Boolean).length} از {Object.values(settings).length}
            </span>
          </div>
        </div>
      </div>
    );
  }
};

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    notifications: 'دریافت اعلان‌های سیستمی و برنامه',
    emailUpdates: 'ارسال به‌روزرسانی‌ها به ایمیل',
    twoFactorAuth: 'احراز هویت دو مرحله‌ای برای امنیت بیشتر',
    locationServices: 'اشتراک‌گذاری موقعیت مکانی',
    dataSaver: 'کاهش مصرف داده برای بارگیری محتوا',
    autoUpdate: 'به‌روزرسانی خودکار برنامه'
  };
  return descriptions[key] || 'تنظیمات مربوطه';
}

// ======================
// ## FORM INTEGRATION
// ======================

export const FormIntegration: Story = {
  render: function Render() {
    const [formData, setFormData] = useState({
      termsAccepted: false,
      newsletter: true,
      marketingEmails: false,
      privacyPolicy: true
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(JSON.stringify(formData, null, 2));
    };

    const allAccepted = Object.values(formData).every(Boolean);

    return (
      <form onSubmit={handleSubmit} className="w-96 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">فرم رضایت</h3>
          <p className="text-sm text-content-secondary">لطفاً موارد زیر را تأیید کنید</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Switch
              id="terms"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, termsAccepted: checked }))
              }
              required
            />
            <div>
              <Label htmlFor="terms" className="font-medium">
                شرایط و ضوابط
              </Label>
              <p className="text-xs text-content-secondary mt-1">
                با کلیک بر روی این گزینه، شرایط و ضوابط ما را می‌پذیرید
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Switch
              id="newsletter"
              checked={formData.newsletter}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, newsletter: checked }))
              }
            />
            <div>
              <Label htmlFor="newsletter" className="font-medium">
                عضویت در خبرنامه
              </Label>
              <p className="text-xs text-content-secondary mt-1">
                دریافت آخرین خبرها و به‌روزرسانی‌ها
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Switch
              id="marketing"
              checked={formData.marketingEmails}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, marketingEmails: checked }))
              }
            />
            <div>
              <Label htmlFor="marketing" className="font-medium">
                ایمیل‌های بازاریابی
              </Label>
              <p className="text-xs text-content-secondary mt-1">
                دریافت پیشنهادات ویژه و تخفیف‌ها
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Switch
              id="privacy"
              checked={formData.privacyPolicy}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, privacyPolicy: checked }))
              }
              required
            />
            <div>
              <Label htmlFor="privacy" className="font-medium">
                حریم خصوصی
              </Label>
              <p className="text-xs text-content-secondary mt-1">
                با سیاست‌های حریم خصوصی ما موافقت می‌کنم
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-surface-secondary">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">وضعیت فرم</p>
              <p className="text-xs text-content-secondary">
                {allAccepted ? 'همه موارد تأیید شده' : 'لطفاً همه موارد لازم را تأیید کنید'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              allAccepted
                ? 'bg-surface-success text-content-success'
                : 'bg-surface-warning text-content-warning'
            }`}>
              {allAccepted ? 'تکمیل شد' : 'ناقص'}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          className="w-full"
          disabled={!formData.termsAccepted || !formData.privacyPolicy}
        >
          ادامه
        </Button>
      </form>
    );
  }
};

// ======================
// ## CUSTOM STYLING
// ======================

export const CustomStyling: Story = {
  render: function Render() {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(false);
    const [checked3, setChecked3] = useState(false);

    return (
      <div className="space-y-6 w-80">
        <div className="p-4 border rounded-lg bg-surface-secondary">
          <h3 className="font-semibold mb-2">استایل‌های سفارشی</h3>
          <p className="text-sm text-content-secondary">استفاده از className برای تغییر ظاهر</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">استایل بزرگ</span>
          <Switch
            checked={checked1}
            onCheckedChange={setChecked1}
            className="h-7 w-14 [&>span]:h-6 [&>span]:w-6 [&>span]:data-[state=checked]:-translate-x-7"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">رنگ متفاوت</span>
          <Switch
            checked={checked2}
            onCheckedChange={setChecked2}
            className="data-[state=checked]:bg-surface-success data-[state=unchecked]:bg-surface-tertiary"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm">گرد کامل</span>
          <Switch
            checked={checked3}
            onCheckedChange={setChecked3}
            className="rounded-full [&>span]:rounded-full"
          />
        </div>

        <div className="p-4 border rounded-lg">
          <h4 className="text-sm font-semibold mb-2">کد سفارشی‌سازی</h4>
          <pre className="text-xs bg-surface-tertiary p-3 rounded overflow-x-auto">
{`// سایز بزرگ
className="h-7 w-14 [&>span]:h-6 [&>span]:w-6"

// رنگ متفاوت
className="data-[state=checked]:bg-green-500"

// گرد کامل
className="rounded-full [&>span]:rounded-full"`}
          </pre>
        </div>
      </div>
    );
  }
};

// ======================
// ## ACCESSIBILITY DEMO
// ======================

export const Accessibility: Story = {
  render: function Render() {
    const [checked, setChecked] = useState(false);

    return (
      <div className="w-96 space-y-6">
        <div className="p-4 border rounded-lg bg-surface-secondary">
          <h3 className="font-semibold mb-2">دسترسی (Accessibility)</h3>
          <ul className="text-sm text-content-secondary space-y-1 list-disc pr-4">
            <li>قابل تمرکز با کلید Tab</li>
            <li>قابل تغییر با Space و Enter</li>
            <li>نشانگر وضعیت برای صفحه‌خوان‌ها</li>
            <li>حالت غیرفعال مناسب</li>
          </ul>
        </div>

        <div>
          <label htmlFor="accessible-switch" className="block text-sm font-medium mb-2">
            سوئیچ نمونه (دسترسی)
          </label>
          <div className="flex items-center gap-3">
            <Switch
              id="accessible-switch"
              checked={checked}
              onCheckedChange={setChecked}
              aria-label="نمونه سوئیچ برای تست دسترسی"
            />
            <span className="text-sm" aria-live="polite">
              وضعیت: {checked ? 'فعال' : 'غیرفعال'}
            </span>
          </div>
          <p className="text-xs text-content-secondary mt-2">
            از کلید Tab برای تمرکز و Space برای تغییر وضعیت استفاده کنید
          </p>
        </div>

        <div>
          <label htmlFor="disabled-accessible" className="block text-sm font-medium mb-2 text-content-secondary">
            سوئیچ غیرفعال (دسترسی)
          </label>
          <Switch
            id="disabled-accessible"
            disabled
            defaultChecked={true}
            aria-label="سوئیچ غیرفعال نمونه"
          />
          <p className="text-xs text-content-secondary mt-2">
            این سوئیچ غیرفعال است و صفحه‌خوان‌ها آن را به درستی اعلام می‌کنند
          </p>
        </div>
      </div>
    );
  }
};

// ======================
// ## PERFORMANCE OPTIONS
// ======================

export const PerformanceOptions: Story = {
  render: function Render() {
    const [options, setOptions] = useState({
      cache: true,
      compression: false,
      lazyLoad: true,
      prefetch: false,
      serviceWorker: true
    });

    const handleToggleAll = (enable: boolean) => {
      setOptions({
        cache: enable,
        compression: enable,
        lazyLoad: enable,
        prefetch: enable,
        serviceWorker: enable
      });
    };

    const enabledCount = Object.values(options).filter(Boolean).length;

    return (
      <div className="w-96 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">تنظیمات عملکرد</h3>
          <p className="text-sm text-content-secondary mb-4">
            بهینه‌سازی‌های عملکرد برای بهبود سرعت بارگذاری
          </p>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            {enabledCount} از {Object.keys(options).length} تنظیم فعال
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleToggleAll(true)}
            >
              همه را روشن کن
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => handleToggleAll(false)}
            >
              همه را خاموش کن
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(options).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Label>
                <p className="text-xs text-content-secondary mt-0.5">
                  {getPerformanceDescription(key)}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={() =>
                  setOptions(prev => ({ ...prev, [key]: !prev[key as keyof typeof options] }))
                }
              />
            </div>
          ))}
        </div>

        <div className="p-4 border rounded-lg bg-gradient-to-r from-surface-brand/10 to-surface-secondary">
          <h4 className="text-sm font-semibold mb-2">تاثیر عملکرد</h4>
          <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-surface-brand transition-all duration-500"
              style={{ width: `${(enabledCount / Object.keys(options).length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-content-secondary mt-2">
            {enabledCount >= 4 ? 'عملکرد عالی' : enabledCount >= 2 ? 'عملکرد متوسط' : 'نیاز به بهبود'}
          </p>
        </div>
      </div>
    );
  }
};

function getPerformanceDescription(key: string): string {
  const descriptions: Record<string, string> = {
    cache: 'ذخیره فایل‌ها برای بارگیری سریع‌تر',
    compression: 'فشرده‌سازی منابع برای حجم کمتر',
    lazyLoad: 'بارگذاری تاخیری تصاویر و کامپوننت‌ها',
    prefetch: 'پیش‌بارگذاری صفحات بعدی',
    serviceWorker: 'کارگر سرویس برای حالت آفلاین'
  };
  return descriptions[key] || 'تنظیمات عملکرد';
}