export interface TextEditorWrapperConfigI {
  addHtmlModificationOption?: boolean;
  addMacroListOption?: boolean;
  onlyMacroOption?: boolean;
  macroListOptions?: string[];
  hideToolbar?: boolean;
  hintAutomplete?: string[];
  disableResizeEditor?: boolean;
  disableDragAndDrop?: boolean;
  airMode?: boolean;
  width?: number;
  height?: number;
  onlyCodeView?: boolean;
}
