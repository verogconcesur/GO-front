/**
 * @interface BreadcrumbBackButtonConfigI
 *
 * - color?: '' | 'primary' | 'warn' | 'accent'
 * - class?: string
 * - iconName?: string
 * - iconFontSet?: string
 */
export interface BreadcrumbBackButtonConfigI {
    hidden?: boolean;
    color?: '' | 'primary' | 'warn' | 'accent';
    class?: string;
    iconName?: string;
    iconFontSet?: string;
}
