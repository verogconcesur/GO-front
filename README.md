![](images/logo.png)

Proyecto base del departamento front-end. Es el punto de partida de cualquier nuevo proyecto. Puedes ver [más información en el KC](https://kc.sdos.es/display/delivery/Concenet_Front%3A+Proyecto+base+front-end).

## Scripts NPM de utilidad

- `npm run test`: Ejecuta los tests de la app, y se queda en modo _watch_
- `npm run test:ci`: Ejecuta los tests una única vez (pensado para integración continua: jenkins)
- `npm run lint`: Ejecuta las comprobaciones del linter
- `npm run sonar`: Lanza el análisis contra SonarQube (configuración en `./sonar-project.properties`)
- `npm run generate:api`: Genera los servicios y modelos a partir de la definición OpenAPI en `./api.yaml`
- `npm run extract-translations`: Parsea el proyecto y extrae en `./src/assets/i18n` todas las keys de i18n que encuentre para los idiomas configurados
- `npm run release:first`: Ejecuta lo necesario para crear la _release_ inicial del proyecto, así como su `CHANGELOG.md`
- `npm run release:patch`: Crea una _release_ de tipo _patch_ (`v0.0.X`), aumentando la versión y modificando el `CHANGELOG.md` según corresponda.
- `npm run release:minor`: Crea una _release_ de tipo _minor_ (`v0.X.0`), aumentando la versión y modificando el `CHANGELOG.md` según corresponda.
- `npm run release:major`: Crea una _release_ de tipo _major_ (`vX.0.0`), aumentando la versión y modificando el `CHANGELOG.md` según corresponda.
- `npm run bundle:report`: Realiza un análisis de los bundles generados una vez _buildeado_ el proyecto, y lo presenta en el navegador.

## Arranque para desarrollo

1. `npm install`
2. `npm start`
3. App en `http://localhost:4200/`

## Entornos

Los entornos disponibles para este proyecto son:

- `dev`: Entorno usado para montar una imagen docker con la aplicación a la que se le puede especificar la URL del API backend a la que atacar a través de la variable de entorno `API_BASE_URL`
- `pre`: Entorno de pre-producción. Generalmente será un entorno SDOS
- `production`: Entorno de producción. Generalmente será un entorno de cliente

### Build tradicional

1. `npm install`
2. `npm run build -- --configuration=<entorno>`
3. Resultado compilado en: `./dist/Concenet_Front`

### Imagen docker

1. `make build ENV=<entorno>`
2. Imagen creada: `webfront/Concenet_Front-<entorno>`

### Correr imagen en contenedor

1. Crear el contenedor a partir de la imagen: `docker run -d -it -p 80:80/tcp Concenet_Front-<entorno> webfront/Concenet_Front-<entorno>:latest` (en lugar de `latest` puedes usar cualquier otra imagen tageada que tengas en tu sistema)
2. App en `http://localhost/`
3. A partir de ahí, si necesitas parar el contenedor: `docker stop Concenet_Front-<entorno>`
4. Si necesitas volver a arrancarlo nuevamente: `docker start Concenet_Front-<entorno>`

**Nota**: Solo para el entorno `dev` se permite recibir por variable de entorno (`API_BASE_URL`) la URL del backend donde se encuentra el API. Esta imagen es muy util si se quiere probar la app contra un backend propio: `docker run -d -it -p 80:80/tcp --env API_BASE_URL=http://localhost:8080/example/api --name Concenet_Front-dev webfront/Concenet_Front-dev:latest`

**Nota**: CD/CI
