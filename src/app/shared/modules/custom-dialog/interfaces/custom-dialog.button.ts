export interface CustomDialogButtonConfigI {
  type: 'close' | 'submit' | 'custom';
  design?: '' | 'raised' | 'stroked' | 'flat' | 'icon' | 'fab' | 'mini-fab';
  color?: '' | 'primary' | 'warn' | 'accent';
  class?: string;
  label?: string;
  iconName?: string;
  iconFontSet?: string;
  iconsPosition?: 'start' | 'end';
  disabledFn?: () => void;
  hiddenFn?: () => void;
  clickFn?: () => void;
}
