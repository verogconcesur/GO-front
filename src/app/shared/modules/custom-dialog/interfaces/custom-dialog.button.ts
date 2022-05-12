export interface CustomDialogButtonConfigI {
  type: 'close' | 'submit' | 'custom';
  design?: '' | 'raised' | 'stroked' | 'flat' | 'icon' | 'fab' | 'mini-fab';
  color?: '' | 'primary' | 'warn' | 'accent';
  class?: string;
  label?: string;
  iconName?: string;
  iconFontSet?: string;
  iconPosition?: 'start' | 'end';
  disabledFn?: () => boolean;
  hiddenFn?: () => boolean;
  clickFn?: () => void;
}
