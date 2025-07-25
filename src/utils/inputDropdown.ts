// src/utils/inputDropdown.ts

export interface InputDropdownValue {
    dropdown?: string;
    input?: string;
  }
  
  export function combineInputDropdownValue(value: InputDropdownValue | undefined): string {
    if (!value) return '';
    const dropdown = value.dropdown || '';
    const input = value.input || '';
    return `${dropdown}${dropdown && input ? '-' : ''}${input}`;
  }

  export function splitInputDropdownValue(value: string | undefined): InputDropdownValue {
    if (!value) return { dropdown: '', input: '' };
    const [dropdown, ...inputParts] = value.split('-');
    return {
      dropdown: dropdown || '',
      input: inputParts.join('-') || ''
    };
  }
  