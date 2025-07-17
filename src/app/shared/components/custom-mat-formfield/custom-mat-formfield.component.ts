import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-custom-mat-formfield',
  templateUrl: './custom-mat-formfield.component.html',
  styleUrls: ['./custom-mat-formfield.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CustomMatFormFieldComponent,
      multi: true
    }
  ]
})
export class CustomMatFormFieldComponent implements OnInit, ControlValueAccessor {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() selectionChange = new EventEmitter<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() options: any[] = [];
  @Input() label = '';
  @Input() placeholder = '';
  @Input() formControl!: FormControl;
  @Input() multiple = false;
  @Input() enableFilter = false;
  @Input() selectAll = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() displayProp: string | string[] = '';
  public labels = {
    selectAll: marker('common.selectAll'),
    unselectAll: marker('common.unselectAll')
  };

  // eslint-disable-next-line
  public filterControl = new FormControl('');
  // eslint-disable-next-line
  public filteredOptions$!: Observable<any[]>;
  // eslint-disable-next-line
  private allOptions: any[] = [];

  public ngOnInit(): void {
    if (!this.formControl) {
      this.formControl = new FormControl();
    }

    if (this.options instanceof Observable) {
      this.options.subscribe((data) => {
        this.allOptions = data || [];
        this.setupFilter();
      });
    } else {
      this.allOptions = this.options || [];
      this.setupFilter();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public writeValue(value: any): void {
    if (this.formControl.value !== value) {
      this.formControl.setValue(value, { emitEvent: false });
    }
  }
  public hasAllSelected(): boolean {
    return this.formControl?.value?.length === this.allOptions.length;
  }
  public unselectAllOptions(): void {
    this.formControl.setValue([]);
    this.onChange(this.formControl.value);
    this.selectionChange.emit({ value: this.formControl.value });
  }
  public selectAllOptions(): void {
    this.formControl.setValue([...this.allOptions]);
    this.onChange(this.formControl.value);
    this.selectionChange.emit({ value: this.formControl.value });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public compareFn = (a: any, b: any): boolean => (a && b ? a.id === b.id : a === b);

  public setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onSelectionChange(event: any): void {
    const value = event.value;
    this.formControl.setValue(value);
    this.onChange(value);
    this.selectionChange.emit(event);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getDisplayValue(item: any): string {
    if (!item) {
      return '';
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getPropValue = (obj: any, path: string): string => path.split('.').reduce((acc, key) => acc?.[key], obj) ?? '';

    if (typeof this.displayProp === 'string') {
      return getPropValue(item, this.displayProp);
    }

    if (Array.isArray(this.displayProp)) {
      return this.displayProp
        .map((prop) => getPropValue(item, prop))
        .filter((val) => !!val)
        .join(' - ');
    }

    return '';
  }

  private setupFilter() {
    this.filteredOptions$ = this.filterControl.valueChanges.pipe(
      startWith(''),
      map((filterText) => {
        // eslint-disable-next-line
        const filtered = this._filterOptions(filterText);

        // Obtener el valor actual seleccionado
        const selected = this.formControl?.value || [];

        // Asegurarse que selected es un array (por si es múltiple)
        const selectedArray = Array.isArray(selected) ? selected : [selected];

        // Copiar filtered para no modificar original
        const combined = [...filtered];

        // Añadir las opciones seleccionadas que no estén en filtered
        selectedArray.forEach((sel) => {
          const found = combined.find((option) => this.compareFn(option, sel));
          if (!found) {
            combined.push(sel);
          }
        });

        return combined;
      })
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _filterOptions(filter: string): any[] {
    const lowerFilter = filter.toLowerCase();
    return this.allOptions.filter((option) => this.getDisplayValue(option).toLowerCase().includes(lowerFilter));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onChange: any = () => {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private onTouched: any = () => {};
}
