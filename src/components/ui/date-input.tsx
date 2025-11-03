import React, { forwardRef } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('pt-BR', ptBR);

interface DateInputProps {
  id?: string;
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  className?: string;
  'aria-invalid'?: boolean | 'true' | 'false' | undefined;
}

const CustomInput = forwardRef<HTMLInputElement, any>(
  ({ value, onClick, placeholder, className, id, required, ...rest }, ref) => (
    <Input
      id={id}
      ref={ref}
      value={value || ''}
      onClick={onClick}
      placeholder={placeholder}
      className={className}
      required={required}
      {...rest}
    />
  )
);

export function DateInput({ id, value, onChange, placeholder, minDate, maxDate, required, className, ...rest }: DateInputProps) {
  return (
    <ReactDatePicker
      selected={value ?? null}
      onChange={(d: Date | null) => onChange(d ?? undefined)}
      customInput={<CustomInput id={id} required={required} className={className} />}
      dateFormat="dd/MM/yyyy"
      locale="pt-BR"
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      minDate={minDate ?? new Date('1900-01-01')}
      maxDate={maxDate ?? new Date()}
      placeholderText={placeholder ?? 'dd/mm/aaaa'}
      shouldCloseOnSelect
      {...rest}
    />
  );
}

