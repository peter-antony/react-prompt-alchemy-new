import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { LazySelect } from '@/components/SmartGrid/LazySelect';
import { Search, Calendar, Clock } from 'lucide-react';
import { PanelFieldConfig } from '@/types/dynamicPanel';

interface SimpleDynamicPanelProps {
  title: string;
  config: PanelFieldConfig[];
  initialData?: Record<string, any>;
  onDataChange?: (data: Record<string, any>) => void;
  className?: string;
}

export const SimpleDynamicPanel: React.FC<SimpleDynamicPanelProps> = ({
  title,
  config,
  initialData = {},
  onDataChange,
  className = '',
}) => {
  const { control } = useForm({
    defaultValues: config.reduce((acc, field) => {
      acc[field.key] = initialData[field.key] || '';
      return acc;
    }, {} as Record<string, any>),
  });

  const renderField = (fieldConfig: PanelFieldConfig) => {
    const { key, label, fieldType } = fieldConfig;

    switch (fieldType) {
      case 'text':
        return (
          <Controller
            name={key}
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <div 
                  className="relative"
                  onClick={fieldConfig.onClick}
                >
                  <Input
                    id={key}
                    placeholder={fieldConfig.placeholder}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      fieldConfig.onChange?.(e.target.value);
                    }}
                    className="h-8 text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          />
        );

      case 'search':
        return (
          <Controller
            name={key}
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <div 
                  className="relative"
                  onClick={fieldConfig.onClick}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    id={key}
                    placeholder={fieldConfig.placeholder}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      fieldConfig.onChange?.(e.target.value);
                    }}
                    className="pl-8 h-8 text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={key}
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <div onClick={fieldConfig.onClick}>
                  <Textarea
                    id={key}
                    placeholder={fieldConfig.placeholder}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      fieldConfig.onChange?.(e.target.value);
                    }}
                    className="text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={key}
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <div 
                  className="relative"
                  onClick={fieldConfig.onClick}
                >
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    id={key}
                    type="date"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      fieldConfig.onChange?.(e.target.value);
                    }}
                    className="pl-8 h-8 text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          />
        );

      case 'time':
        return (
          <Controller
            name={key}
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <div 
                  className="relative"
                  onClick={fieldConfig.onClick}
                >
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
                  <Input
                    id={key}
                    type="time"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      fieldConfig.onChange?.(e.target.value);
                    }}
                    className="pl-8 h-8 text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          />
        );

      case 'currency':
        return (
          <Controller
            name={key}
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <div 
                  className="relative"
                  onClick={fieldConfig.onClick}
                >
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">$</span>
                  <Input
                    id={key}
                    type="number"
                    step="0.01"
                    placeholder={fieldConfig.placeholder}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      fieldConfig.onChange?.(e.target.value);
                    }}
                    className="pl-8 h-8 text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          />
        );

      case 'select':
        if (fieldConfig.fieldType === 'select') {
          return (
            <Controller
              name={key}
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <div onClick={fieldConfig.onClick}>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        fieldConfig.onChange?.(value);
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-lg z-50">
                        {fieldConfig.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            />
          );
        }
        break;

      case 'radio':
        if (fieldConfig.fieldType === 'radio') {
          return (
            <Controller
              name={key}
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>{label}</Label>
                  <div onClick={fieldConfig.onClick}>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        fieldConfig.onChange?.(value);
                      }}
                      className="flex flex-wrap gap-3"
                    >
                      {fieldConfig.options.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={`${key}-${option.value}`} />
                          <Label htmlFor={`${key}-${option.value}`} className="text-xs">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              )}
            />
          );
        }
        break;

      case 'lazyselect':
        if (fieldConfig.fieldType === 'lazyselect') {
          return (
            <Controller
              name={key}
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <div 
                    className="focus-within:z-50 relative"
                    onClick={fieldConfig.onClick}
                  >
                    <LazySelect
                      fetchOptions={fieldConfig.fetchOptions}
                      value={field.value}
                      onChange={(value) => {
                        const stringValue = Array.isArray(value) ? value[0] : value;
                        field.onChange(stringValue);
                        // For lazyselect, we need to find the selected option to return full object
                        const selectedOption = stringValue ? { label: '', value: stringValue } : null;
                        fieldConfig.onChange?.(selectedOption);
                      }}
                      placeholder="Select..."
                      className="h-8 text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:z-50 focus:relative focus:outline-none"
                    />
                  </div>
                </div>
              )}
            />
          );
        }
        break;

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.map((fieldConfig) => (
            <div key={fieldConfig.key}>
              {renderField(fieldConfig)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleDynamicPanel;