import { CustomDialogButtonConfig } from './custom-dialog-button-config';
/**
 * @class CustomDialogFooterConfig
 * @implements CustomDialogFooterConfigI
 */
export class CustomDialogFooterConfig {
    /**
     * @constructs CustomDialogFooterConfig
     * @param config: CustomDialogFooterConfigI
     */
    constructor(config) {
        this.show = false;
        this.leftSideButtons = [];
        this.rightSideButtons = [];
        try {
            if (config && config.show) {
                this.show = true;
                if (config.leftSideButtons && config.leftSideButtons.length) {
                    this.leftSideButtons = config.leftSideButtons.map((objI) => new CustomDialogButtonConfig(objI));
                }
                if (config.rightSideButtons && config.rightSideButtons.length) {
                    this.rightSideButtons = config.rightSideButtons.map((objI) => new CustomDialogButtonConfig(objI));
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLWRpYWxvZy1mb290ZXItY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvY3VzdG9tLWRpYWxvZy9zcmMvbGliL21vZGVscy9jdXN0b20tZGlhbG9nLWZvb3Rlci1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFHekU7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLHdCQUF3QjtJQUtuQzs7O09BR0c7SUFDSCxZQUFZLE1BQXdDO1FBUjdDLFNBQUksR0FBRyxLQUFLLENBQUM7UUFDYixvQkFBZSxHQUErQixFQUFFLENBQUM7UUFDakQscUJBQWdCLEdBQStCLEVBQUUsQ0FBQztRQU92RCxJQUFJO1lBQ0YsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksRUFBRTtnQkFDekIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLElBQUksTUFBTSxDQUFDLGVBQWUsSUFBSSxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRTtvQkFDM0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FDL0MsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksd0JBQXdCLENBQUMsSUFBSSxDQUFDLENBQzdDLENBQUM7aUJBQ0g7Z0JBQ0QsSUFBSSxNQUFNLENBQUMsZ0JBQWdCLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRTtvQkFDN0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQ2pELENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUM3QyxDQUFDO2lCQUNIO2FBQ0Y7U0FDRjtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN0QjtJQUNILENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEN1c3RvbURpYWxvZ0J1dHRvbkNvbmZpZyB9IGZyb20gJy4vY3VzdG9tLWRpYWxvZy1idXR0b24tY29uZmlnJztcclxuaW1wb3J0IHsgQ3VzdG9tRGlhbG9nRm9vdGVyQ29uZmlnSSB9IGZyb20gJy4uL2ludGVyZmFjZXMvY3VzdG9tLWRpYWxvZy1mb290ZXItY29uZmlnJztcclxuXHJcbi8qKlxyXG4gKiBAY2xhc3MgQ3VzdG9tRGlhbG9nRm9vdGVyQ29uZmlnXHJcbiAqIEBpbXBsZW1lbnRzIEN1c3RvbURpYWxvZ0Zvb3RlckNvbmZpZ0lcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDdXN0b21EaWFsb2dGb290ZXJDb25maWcgaW1wbGVtZW50cyBDdXN0b21EaWFsb2dGb290ZXJDb25maWdJIHtcclxuICBwdWJsaWMgc2hvdyA9IGZhbHNlO1xyXG4gIHB1YmxpYyBsZWZ0U2lkZUJ1dHRvbnM6IEN1c3RvbURpYWxvZ0J1dHRvbkNvbmZpZ1tdID0gW107XHJcbiAgcHVibGljIHJpZ2h0U2lkZUJ1dHRvbnM6IEN1c3RvbURpYWxvZ0J1dHRvbkNvbmZpZ1tdID0gW107XHJcblxyXG4gIC8qKlxyXG4gICAqIEBjb25zdHJ1Y3RzIEN1c3RvbURpYWxvZ0Zvb3RlckNvbmZpZ1xyXG4gICAqIEBwYXJhbSBjb25maWc6IEN1c3RvbURpYWxvZ0Zvb3RlckNvbmZpZ0lcclxuICAgKi9cclxuICBjb25zdHJ1Y3Rvcihjb25maWc6IEN1c3RvbURpYWxvZ0Zvb3RlckNvbmZpZ0kgfCBudWxsKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBpZiAoY29uZmlnICYmIGNvbmZpZy5zaG93KSB7XHJcbiAgICAgICAgdGhpcy5zaG93ID0gdHJ1ZTtcclxuICAgICAgICBpZiAoY29uZmlnLmxlZnRTaWRlQnV0dG9ucyAmJiBjb25maWcubGVmdFNpZGVCdXR0b25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgdGhpcy5sZWZ0U2lkZUJ1dHRvbnMgPSBjb25maWcubGVmdFNpZGVCdXR0b25zLm1hcChcclxuICAgICAgICAgICAgKG9iakkpID0+IG5ldyBDdXN0b21EaWFsb2dCdXR0b25Db25maWcob2JqSSlcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb25maWcucmlnaHRTaWRlQnV0dG9ucyAmJiBjb25maWcucmlnaHRTaWRlQnV0dG9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgIHRoaXMucmlnaHRTaWRlQnV0dG9ucyA9IGNvbmZpZy5yaWdodFNpZGVCdXR0b25zLm1hcChcclxuICAgICAgICAgICAgKG9iakkpID0+IG5ldyBDdXN0b21EaWFsb2dCdXR0b25Db25maWcob2JqSSlcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIl19