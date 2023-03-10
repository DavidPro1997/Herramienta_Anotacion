# Herramienta de Anotacion

## Despliegue de la Herramienta de forma local

- Debe estar previamente instalado el microservicio 3.

  - Para instalarlo ir a: https://github.com/DavidPro1997/microservice3.git 
  
- En una carpeta local clone el repositorio donde esta alojado el proyecto.

```bash
git clone https://github.com/DavidPro1997/Herramienta_Anotacion.git
```

### Backend

1. Instale Python3 (>=3.6 <=3.8.6)
2. Vaya a la carpeta `\Backend` cree un ambiente virtual y activelo.
```bash
py -m pip install virtualenv
py -m virtualenv de
.\de\Scripts\activate
```
3. En el ambiente virtual (de) instale las librerias necesarias.
```bash
py -m pip install -r requirements.txt
```
4. En MySQL cree una base de datos con cualquier nombre. Ejemplo: `dbHerramienta`
5. En el archivo .env de la ruta: `backend\.env` actualice el string de conexion.
```javascript
DB_CONN=mysql+pymysql://root@localhost/dbHerramienta
SECRET_KEY=Secret-that-needs-to-be-updated
APP_ENV=dev
FLASK_ENV=development
```
6. Ejecute las migraciones.
```bash
py manage.py db migrate --message 'Algun mensaje'
py manage.py db upgrade
```
7. Vaya al archivo `backend\app\main\service\politica_service.py` y edite las credenciales del servidor Linux Ubuntu 18 donde esta alojado el microservicio 3 con unas propias 
```python
#Credenciales del servidor Ubuntu
servidor = "192.168.1.128"
usuario = "david"
clave = "4652"
```
8. Guarde todo y corra el proyecto.
```bash
py manage.py run
```

## Frontend

1. Instale Angular.
```bash
npm install -g @angular/cli
```
2. Desde la carpeta `\administracion` ejecute:
```bash
npm install
ng serve
```
3. Desde la carpeta `\visualizacion` ejecute:
```bash
npm install
ng serve --port=4201
```
4. Abra un navegador con la ruta `http://localhost:4200/`, ingrese las credenciales y compruebe su funcionamiento.
5. Abra un navegador con la ruta `http://localhost:4201/` y compruebe su funcionamiento.

### Credenciales:
- Administrador: 
  - email: admin@gmail.com 
  - clave: admin
- Anotador:
  - email: anotador@gmail.com
  - clave: anotador
