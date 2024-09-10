# BreadCrumbs

> Resumen: Migas de pan asociadas a los hijos del routing especificado para un módulo.

- [Información de la librería](#información-de-la-librería)
- [Instalación](#instalación)
- [Importar librería](#importar-la-librería)
- [Ejemplo de uso](#ejemplo-de-uso)
- [Estilos](#estilos)

<img src="./bread_crumbs.PNG" width="500px"/>

## Información de la librería

Basada en la [arquitectura de Olivier Canzillon](https://marco.dev/angular-breadcrumb).

Aconsejable cuando queremos insertar unas migas de pan asociadas a las rutas y los hijos definidos para las diferentes rutas.

## Instalación

Sigue los pasos indicados en [la guía de uso de librerías](../../documentation/como_usar_las_librerias.md).

Una vez seguidos los pasos indicados anteriormente puedes ejecutar el siquiente comando con la ruta correspondiente para instalar la librería:

```
npm install C:\...\jenga-library\dist\bread-crumbs
```

## Importar librería

En el proyecto que quieras usar esta librería deberás importar el módulo y el service dentro del módulo dónde vayas a utilizarlo:

```
import { BreadCrumbsModule } from '@jenga/bread-crumbs';
@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
    BreadCrumbsModule,
  ],
  providers: [...],
  exports: [
    ...
    BreadCrumbsModule
  ]
})
export class SharedModule {}`
```

## Ejemplo de uso

Dentro del archivo `routing` donde se definan las rutas para un módulo, deberemos insertar por cada hijo el atributo `breadcrumb` dentro del `data` para cada ruta. Siendo necesario especificar un `id` y un `label` por cada una de ellas, y puediendo rectificar la ruta apuntando a alguna capa superior dándole valor al atributo `numberOfPathsToRemoveFromTheUrl`.

> En este archivo routing no hace falta hacer ningún tipo de importación.

```
const routes: Routes = [
  {
    path: RouteConstants.EMPTY,
    canActivate: [AuthGuardService],
    //Brand level => sin miga de pan
    children: [
      {
        path: RouteConstants.BRANDS,
        canActivate: [AuthGuardService],
        component: OrganizationComponent,
        //Facility level => en este caso se añaden dos niveles en las migas de pan,
        // modificando la ruta en el primero de ellos
        children: [
          {
            path: `${RouteConstants.ID_BRAND}/${RouteConstants.FACILITIES}`,
            canActivate: [AuthGuardService],
            data: {
              // numberOfPathsToRemoveFromTheUrl => used to tell the breadcrumb to delete de ":idBrand/facilities" from the url
              breadcrumb: [
                {
                  id: RouteConstants.BRANDS,
                  label: 'organizations.brands.title',
                  numberOfPathsToRemoveFromTheUrl: 2
                },
                {
                  id: RouteConstants.FACILITIES,
                  label: (data: { brand: BrandDTO }) => `${data.brand.name}`
                }
              ]
            },
            resolve: { brand: BrandService },
            //Department level => miga de pan con un sólo nivel
            children: [
              {
                path: `${RouteConstants.ID_FACILITY}/${RouteConstants.DEPARTMENTS}`,
                canActivate: [AuthGuardService],
                data: {
                  breadcrumb: {
                    id: RouteConstants.DEPARTMENTS,
                    label: (data: { facility: FacilityDTO }) => `${data.facility.name}`
                  }
                },
                resolve: { facility: FacilityService },
                //Specialty level  => miga de pan con un sólo nivel
                children: [
                  {
                    path: `${RouteConstants.ID_DEPARTMENT}/${RouteConstants.SPECIALTIES}`,
                    canActivate: [AuthGuardService],
                    data: {
                      breadcrumb: {
                        id: RouteConstants.SPECIALTIES,
                        label: (data: { department: DepartmentDTO }) => `${data.department.name}`
                      }
                    },
                    resolve: { department: DepartmentService },
                    component: SpecialtiesComponent
                  },
                  {
                    path: RouteConstants.EMPTY,
                    canActivate: [AuthGuardService],
                    component: DepartmentsComponent
                  }
                ]
              },
              {
                path: RouteConstants.EMPTY,
                canActivate: [AuthGuardService],
                component: FacilitiesComponent
              }
            ]
          },
          {
            path: RouteConstants.EMPTY,
            canActivate: [AuthGuardService],
            component: BrandsComponent
          }
        ]
      },
      {
        path: RouteConstants.OTHER,
        pathMatch: 'full',
        redirectTo: RouteConstants.BRANDS
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule {}
```

Luego, dentro del componente donde queramos mostrar las migas de pan, añadimos el selector del componente [`BreadCrumbsComponent`](./src/lib/component/bread-crumbs.component.ts) de la siguiente manera:

```
<div class="organization-container">
    <div class="organization-container__content">
        <jenga-bread-crumbs></jenga-bread-crumbs>
        <router-outlet></router-outlet>
    </div>
</div>
```

Dicho componente admite dos input, uno por si queremos añadir alguna clase a las migas de pan, y otro para configurar el botón de volver atrás y que deberá de ser de tipo [BreadcrumbBackButtonConfigI](./src/lib/interfaces/bread-crumbs-back-button-config.interface.ts):

```
<jenga-bread-crumbs [customClasses]="['clase1', 'clase2']" [backButtonConfig]="backButtonConfig"></jenga-bread-crumbs>
```

## Estilos

El estilo de botón lo hereda del theme de angular material aplicado en el proyecto.

En caso de quere aplicar estilos propios, podemos añadir una clase custom y fijarnos en los estilos del archivo [bread-crumbs.component.scss](./src/lib/component/bread-crumbs.component.scss) para crear unos estilos propios y cargarlos a través del `style.scss` de nuestro proyecto.
