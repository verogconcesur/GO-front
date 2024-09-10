/**
 * @interface CustomDialogButtonConfigI
 *
 * - type: 'close' | 'submit' | 'custom'
 * - design?: '' | 'raised' | 'stroked' | 'flat' | 'icon' | 'fab' | 'mini-fab'
 * - color?: '' | 'primary' | 'warn' | 'accent'
 * - class?: string
 * - label?: string
 * - iconName?: string
 * - iconFontSet?: string
 * - iconPosition?: 'start' | 'end'
 * - disabledFn?: () => boolean -> use only arrow functions
 * - hiddenFn?: () => boolean -> use only arrow functions
 * - clickFn?: () => void -> use only arrow functions
 */
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
