# CustomDialog

> Resumen: El objetivo de esta librería es abrir diálogos customizables en los que se puede insertar un componente a mostrar dentro del diálogo y configurar la cabecera y pie pudiendo controlar las acciones / validaciones de los botones que se muestran a través del componente insertado.

- [Información de la librería](#información-de-la-librería)
- [Instalación](#instalación)
- [Importar librería](#importar-la-librería)
- [Ejemplo de uso](#ejemplo-de-uso)
- [Estilos](#estilos)

<img src="./customDialog.gif" width="500px"/>

## Información de la librería

La librería está diseñada para abrir diálogos de angular material y renderizar dentro un componente que pueda interaccionar con los botones y acciones de la propio diálogo.

La ventaja que se busca con esta librería es la de diseñar diálogos complejos con el menor esfuerzo posible, pudiendo insertar componentes con formularios, centrándonos en la implementación del componente sin tener que preocuparnos por la integración con los botones del diálogo ya que esto se realiza haciendo que nuestro componente a insertar extienda una clase propia de la librería e implementando una serie de funciones abstractas, asociadas a la configuración del diálogo.

Además este tipo de implementación nos permitirá poder utilizar el componente creado tanto dentro del diálogo como en otra parte del proyecto.

## Instalación

Sigue los pasos indicados en [la guía de uso de librerías](../../documentation/como_usar_las_librerias.md).

Una vez seguidos los pasos indicados anteriormente puedes ejecutar el siquiente comando con la ruta correspondiente para instalar la librería:

```
npm install C:\...\jenga-library\dist\custom-dialog
```

## Importar librería

En el proyecto que quieras usar esta librería deberás importar el módulo y el service dentro del módulo dónde vayas a utilizarlo:

```
import { CustomDialogModule, CustomDialogService } from '@jenga/custom-dialog';
@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
    CustomDialogModule,
  ],
  providers: [..., CustomDialogService],
  exports: [
    ...
    CustomDialogModule
  ]
})
export class SharedModule {}`
```

Además el componente a insertar dentro del diálogo deberá extender la clase `ComponentToExtendForCustomDialog` e implementar las funciones abstractas de dicha clase.

## Ejemplo de uso

- [Componente](#componente)
- [Invocar función open del service](#invocar-función-open-del-service)

### Componente

Lo primero que deberemos crear es el componente que queramos mostrar dentro del diálogo y extender la clase `ComponentToExtendForCustomDialog`, creando además una constante enum en la que definiremos el `ID, PANEL_CLASS y TITLE`, que deberemos pasar al `CustomDialogService.open`. Posteriomente implementaremos las funciones abstractas necesarias.

```

import { ComponentToExtendForCustomDialog, CustomDialogFooterConfigI } from '@jenga/custom-dialog';

export const enum CreateEditBrandComponentModalEnum {
  ID = 'create-edit-brand-dialog-id',
  PANEL_CLASS = 'create-edit-brand-dialog',
  TITLE = 'organizations.brands.create'
}

@Component({
  selector: 'app-create-edit-brand',
  templateUrl: './create-edit-brand.component.html',
  styleUrls: ['./create-edit-brand.component.scss']
})
export class CreateEditBrandComponent extends ComponentToExtendForCustomDialog implements OnInit, OnDestroy {

  constructor(
  ) {
    super(
      CreateEditBrandComponentModalEnum.ID,
      CreateEditBrandComponentModalEnum.PANEL_CLASS,
      CreateEditBrandComponentModalEnum.TITLE
    );
  }

  ngOnInit(): void {
    //En caso de que el título de la modal cambie (por ejemplo si es creación o edición),
    // podemos modificar directamente el campo MODAL_TITLE de la clase ComponentToExtendForCustomDialog
    if (this.extendedComponentData) {
      this.MODAL_TITLE = 'Otro título';
    }
  }

  // Implementación de función abstracta
  public confirmCloseCustomDialog(): Observable<boolean> {
    if (this.form.touched && this.form.dirty) {
      return this.confirmDialogService.open({
        title: this.translateService.instant(marker('common.warning')),
        message: this.translateService.instant(marker('common.unsavedChangesExit'))
      });
    } else {
      return of(true);
    }
  }

  // Implementación de función abstracta
  public onSubmitCustomDialog(): Observable<boolean | BrandDTO> {
    const formValue = this.form.value;
    const spinner = this.spinnerService.show();
    return this.brandService
      .addBrand(formValue)
      .pipe(
        map((response) => {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          return response;
        }),
        catchError((error) => {
          const err = error.error as ConcenetError;
          this.globalMessageService.showError({
            message: err.message,
            actionText: this.translateService.instant(marker('common.close'))
          });
          return of(false);
        }),
        finalize(() => {
          this.spinnerService.hide(spinner);
        })
      );
  }

  // Implementación de función abstracta
  public setAndGetFooterConfig(): CustomDialogFooterConfigI | null {
    return {
      show: true,
      leftSideButtons: [
        {
          type: 'custom',
          label: marker('organizations.brands.delete'),
          design: 'stroked',
          color: 'warn',
          clickFn: this.deleteBrand,
          hiddenFn: () => !this.brandToEdit
        }
      ],
      rightSideButtons: [
        {
          type: 'submit',
          label: marker('common.save'),
          design: 'raised',
          color: 'primary',
          disabledFn: () => !(this.form.touched && this.form.dirty && this.form.valid)
        }
      ]
    };
  }

  public deleteBrand () => {
    //Función empleada en el botón custom
  }


}

```

En el ejemplo anterior a través de la implementación de la función abstracta `setAndGetFooterConfig` le estamos diciendo a la modal que tendrá en el lado izquierdo un botón de tipo `custom` (esto quiere decir que al hacerle click invocará la función pasada en el atributo `clickFn`) y a la derecha un botón de tipo `submit` que ejecutará directamente la función `onSubmitCustomDialog`.

Además de esto el diálogo tendrá un botón para cerrar la modal en la parte superior derecha que invocará la función `confirmCloseCustomDialog` donde se podrán poner en caso necesario validaciones a comprobar antes de cerrar la modal.

Se debe tener en cuenta que los botones a insertar deben implementar la siguiente [interfaz](./src/lib/interfaces/custom-dialog-button-config.ts). En caso de que la configuración de un botón sea incorrecta, la librería lanzará el error correspondiente.

### Invocar función open del service

El servicio open espera un objeto de tipo [CustomDialogConfigI](./src/lib/interfaces/custom-dialog-config.ts)

Importante:

- `component`: se especifica el componente a renderizar dentro del diálogo.
- `extendedComponentData`: si se desea pasar información al componente se hará a través de este atributo.

Ejemplo:

```
public buttonCreateEditAction(brand?: BrandDTO) {
    this.customDialogService
      .open({
        id: CreateEditBrandComponentModalEnum.ID,
        panelClass: CreateEditBrandComponentModalEnum.PANEL_CLASS,
        component: CreateEditBrandComponent,
        extendedComponentData: brand ? brand : null,
        disableClose: true,
        width: '900px'
      })
      .pipe(take(1))
      .subscribe((response) => {
        if (response) {
          this.globalMessageService.showSuccess({
            message: this.translateService.instant(marker('common.successOperation')),
            actionText: this.translateService.instant(marker('common.close'))
          });
          this.getBrands();
        }
    });
}
```

## Estilos

Los estilos de botones y título los hereda del theme de angular material aplicado en el proyecto.

En el caso del título, usa la clase mat-title por lo que lo que utiliza la tipografía y tamaños especificados en la configuración del theme del proyecto donde se instale:

```
mat-typography-config(
  $font-family: 'Saira',
  $title: mat-typography-level(20px, 28px, 600),
```
