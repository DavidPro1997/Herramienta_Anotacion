from app.main import db
from app.main.utils import commit_db, guardar_cambios
from app.main.model.politica import Politica, PoliticaUsuarioRelacion
from app.main.model.usuario import Usuario
from app.main.model.parrafo import Parrafo
from app.main.model.anotacion import Anotacion, AnotacionValorRelacion
from app.main.model.valor import Valor
from app.main.model.atributo import Atributo
from app.main.model.tratamiento import Tratamiento
from flask import request
from flask_restplus import marshal
from werkzeug.utils import secure_filename
from ..util.clases_auxiliares import PoliticaMostrar, ParrafoMostrar, ParrafoGuardar, PoliticaAnotadorNoFinalizadas, \
    PoliticaConsultarParrafos, PoliticaAnotadaConsultar, PoliticaAnotadaReporte
from ..util.dto import PoliticaDto
from ..service.parrafo_service import guardar_parrafo, consultar_num_parrafos_politica, eliminar_parrafos_politica
from ..service.anotacion_service import consultar_ultima_anotacion_usuario_politica, calcular_coeficiente_interanotador
import os
import paramiko
import time
import re
from bs4 import BeautifulSoup
from sqlalchemy import func, select
import datetime 
import csv
import yaml



EXTENSIONES_PERMITIDAS = {'txt'}

#verificamos sistema operativo
#esto se hizo ya que el desarrollo se realizo en un sistema operativo windows
#y el sistema se encuentra alojada en un servidor ubuntu
if os.name == 'nt':
    CARPETA_SUBIDA = os.getcwd() + '\Politicas\\'
    CARPETA_URL = os.getcwd() + '\Links\\'
    CARPETA_REPORTE = os.getcwd() + '\Reportes\\'
else:
    CARPETA_SUBIDA = os.getcwd() + '/Politicas/'
    CARPETA_URL = os.getcwd() + '/Links/'
    CARPETA_REPORTE = os.getcwd() + '/Reportes/'

politica_respuesta = PoliticaMostrar
politica_respuesta.parrafos = []

#Credenciales del servidor Ubuntu
servidor = "192.168.1.128"
usuario = "david"
clave = "4652"

#Se limita las extensiones de archivo que se va a guardar
def archivo_permitido(nombre_archivo):
    return '.' in nombre_archivo and \
           nombre_archivo.rsplit('.', 1)[1].lower() in EXTENSIONES_PERMITIDAS

#Encuentra una URL especifica en el archivo de texto
def encuentraURL(linea):
    try:
        documento = open(CARPETA_URL+"/listaCompleta.txt")
        lineas = documento.readlines()
        num = 0
        for i in lineas:
            if i != '\n':
                num = num+1
                if num == linea:
                    aux = i
                    print(aux)
        documento.close()
        return aux
    except:
        return "Error"

#Crea un archivo con el nombre de la politica
def crear_archivo(politica_texto, nombre_archivo):
    try:
        archivo = open(CARPETA_SUBIDA+"/"+nombre_archivo+".txt","w", encoding="utf-8")
        archivo.write(politica_texto)
        archivo.close()
        return True
    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        return False


#Extrae el texto de politicas de privacidad desde el servidor ubuntu
def extraerTexto(data):
    #try:
    cliente = paramiko.SSHClient()
    cliente.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    cliente.connect(servidor,username=usuario,password=clave)
    archivo = cliente.open_sftp()
    #Creamos el archivo con 1 URL
    url = encuentraURL(data['num'])
    if url!='Error':
        if os.path.exists(CARPETA_URL+"/listaURL.txt"):
            os.remove(CARPETA_URL+"/listaURL.txt")
        if os.path.exists(CARPETA_SUBIDA+"/PrivacyPolicy1.txt"):
            os.remove(CARPETA_SUBIDA+"/PrivacyPolicy1.txt")
        file = open(CARPETA_URL+"/listaURL.txt", "w")
        file.write(url)
        file.close()
    else:
        respuesta = {
                'estado': 'fallido',
                'mesaje': 'No se logro crear el archivo con la URL'
            }
        return respuesta, 409
    #Se envia el archivo txt a linux 
    archivo.put(CARPETA_URL+"/listaURL.txt","/app/listaURL.txt")
    #Se ejecuta el microservicio3 en linux
    stdin, stdout, stderr = cliente.exec_command(
        "cd /app ; echo s | rm -r result/* ; echo 4652 | sudo -S python3 micro3-g.py"
        )
    #Se espera el tiempo suficiente segun el numero de URLs
    print("Descargando archivos, por favor espere...")
    time.sleep(30)
    resultado = stdout.read().decode()
    print(resultado)
    #Se guarda en una cadena los archivos descargados y se los cambia de nombre
    entrada, salida, error = cliente.exec_command(
        "cd /app; sh CambiarNombres.sh;cd /app/result; ls"
        )
    time.sleep(1)
    res = salida.read().decode()
    #Se filtran las cadenas que terminan en .txt
    secuencia = r'\w*\.txt'
    busqueda = re.findall(secuencia,res)
    #Se descargan los archivos .txt
    ruta = "/app/result/"
    for i in busqueda:
        path_origen = ruta + i
        path_destino = CARPETA_SUBIDA+i
        archivo.get(path_origen,path_destino)
    #Se eliminan del servidor los archivos
    entrada2, salida2, error2 = cliente.exec_command(
    "cd /app;rm -rf result;mkdir result"
    )
    time.sleep(1)
    archivo.close()
    cliente.close()
    politica = abrir_politica("PrivacyPolicy1.txt")
    if os.path.exists(CARPETA_SUBIDA+"/PrivacyPolicy1.txt"):
        respuesta = {
                    'estado': 'exito',
                    'url': url,
                    'texto_politica': politica,
                }
        return respuesta, 201
    else:
        respuesta = {
                'estado': 'fallido',
                'mesaje': 'No se logro crear el archivo con la URL'
            }
        return respuesta, 409
    

#Se verifica si un archivo existe en la petición enviada desde el frontend
def politica_existe_peticion():
    if 'politica' not in request.files:
        return False
    else:
        return True

#luego de guardar la política se lee su archivo
def abrir_politica(nombre_archivo):
    with open(CARPETA_SUBIDA + nombre_archivo, 'r', encoding='UTF-8') as txt:
        politica = txt.read()
        return politica

#Verifica que no existan politicas con nombre duplicado
def existe_archivo_politica_mismo_nombre(nombre_archivo):
    try:
        with open(CARPETA_SUBIDA + nombre_archivo, 'r') as txt:
            return True
    except:
        return False

#Arregar saltos de linea
def saltos_linea(nombre_archivo):
    try:
        documento = open(CARPETA_SUBIDA+"/"+nombre_archivo+".txt","rw")
        lineas = documento.readlines()
        num = 0
        for i in lineas:
            i.str.split("\n")
        documento.close()
        return num
    except:
        return "Error"

#Cuenta las URLs de un archivo
def conteoURLs(nombre_archivo):
    try:
        documento = open(CARPETA_URL+"/"+nombre_archivo)
        lineas = documento.readlines()
        num = 0
        for i in lineas:
            if i != '\n':
                num = num+1
        documento.close()
        return num
    except:
        return "Error"

#Renombra el archivo de URLS a uno estandar 
def renombrarURLs(nombre_archivo):
    if os.path.exists(CARPETA_URL+"/listaCompleta.txt"):
        os.remove(CARPETA_URL+"/listaCompleta.txt")
    nombre_viejo = CARPETA_URL+"/"+nombre_archivo
    nombre_nuevo = CARPETA_URL+"/listaCompleta.txt"
    os.rename(nombre_viejo, nombre_nuevo)

#Separa los parrafos de una política de privacidad
def separar_parrafos_principales(politica):
    parrafos = politica.split('\n\n\n')
    return parrafos

#Separa un parrafo en cada salto de linea
def separar_parrafos_secundarios(parrafo):
    subparrafos = parrafo.split('\n')
    return subparrafos

#Llenamos los datos para previsualizar
def llenar_politica_mostrar():
    peticion = request.form.to_dict()
    politica_respuesta.nombre = peticion.get('nombre')
    politica_respuesta.fecha = peticion.get('fecha')
    politica_respuesta.url = peticion.get('url')
    politica_respuesta.parrafos = []

#Se borra el archivo de la politica una vez previsualizad
def borrar_politica_previsualizacion(archivo):
    try:
        os.remove(CARPETA_SUBIDA + archivo.filename)
    except:
        respuesta = {
            'estado': 'fallido',
            'mesaje': 'Existe un problema con la eliminacion del archivo en el servidor'
        }
        return respuesta, 409


def error_directorio():
    try:
        os.mkdir(CARPETA_SUBIDA)
    except OSError:
        return False
    else:
        return True


def llenar_politica_html(parrafos):
    politica_respuesta.parrafos.clear()
    i = 0
    for parrafo in parrafos:
        texto = ''
        texto_html = ''
        titulo = ''

        subparrafos = separar_parrafos_secundarios(parrafo)

        if subparrafos[0].startswith("+", 0, 1):
            # retiramos el caracter '+'
            titulo += subparrafos[0][1:]
            subparrafos.remove(subparrafos[0])

        for subparrafo in subparrafos:
            #remplazamos saltos de linea por espacios en blanco o por saltos de linea html (<br>)
            if subparrafo != '':
                texto += subparrafo + ' '
                texto_html += subparrafo + '<br><br>'

        parrafo_aux = ParrafoMostrar(titulo, texto, texto_html)
        politica_respuesta.parrafos.insert(i, parrafo_aux)
        i += 1
    return politica_respuesta


#Función previsualizacion de política
def previsualizar_politica():
    if not politica_existe_peticion():
        respuesta = {
            'estado': 'fallido',
            'mesaje': 'No existe el archivo en la peticion'
        }
        return respuesta, 409

    archivo = request.files['politica']

    if not archivo_permitido(archivo.filename):
        respuesta = {
            'estado': 'fallido',
            'mesaje': 'Extension de archivo invalida'
        }
        return respuesta, 409

    if existe_archivo_politica_mismo_nombre(archivo.filename):
        respuesta = {
            'estado': 'fallido',
            'mesaje': 'Ya existe un archivo con ese nombre'
        }
        return respuesta, 409

    if archivo:
        if os.path.isdir(CARPETA_SUBIDA):
            archivo.filename = archivo.filename.strip().replace(" ", "")
            nombre_archivo = secure_filename(archivo.filename)

            try:
                archivo.save(os.path.join(CARPETA_SUBIDA, nombre_archivo))
            except:
                respuesta = {
                    'estado': 'fallido',
                    'mesaje': 'Existe un problema con la creacion del archivo en el servidor'
                }
                return respuesta, 409

            politica = abrir_politica(nombre_archivo)
            parrafos = separar_parrafos_principales(politica)
            llenar_politica_mostrar()
            json = llenar_politica_html(parrafos)
            borrar_politica_previsualizacion(archivo)

            respuesta = {
                'estado': 'exito',
                'mensaje': 'politica creada',
                'politica': marshal(json, PoliticaDto.politicaMostrar)
                
            }

            return respuesta, 201
        else:
            os.mkdir(CARPETA_SUBIDA)

            archivo.filename = archivo.filename.strip().replace(" ", "")
            nombre_archivo = secure_filename(archivo.filename)

            try:
                archivo.save(os.path.join(CARPETA_SUBIDA, nombre_archivo))
            except:
                respuesta = {
                    'estado': 'fallido',
                    'mesaje': 'Existe un problema con la creacion del archivo en el servidor'
                }
                return respuesta, 409

            politica = abrir_politica(nombre_archivo)
            parrafos = separar_parrafos_principales(politica)
            llenar_politica_mostrar()
            json = llenar_politica_html(parrafos)
            borrar_politica_previsualizacion(archivo)

            respuesta = {
                'estado': 'exito',
                'mensaje': 'politica creada',
                'politica': marshal(json, PoliticaDto.politicaMostrar)
            }

            return respuesta, 201
    else:
        error_directorio()


"""
#Función previsualizacion de política David
def previsualizar_politica():
    documento = open(CARPETA_URL+"/listaURL.txt")
    lineas = documento.readlines()
    for i in lineas:
        if i != '\n':
            aux = i          
    documento.close()
    nombre_archivo = "/PrivacyPolicy1.txt"
    politicaTexto = abrir_politica(nombre_archivo)
    
    
    parrafos = separar_parrafos_principales(politica)
    llenar_politica_mostrar()
    json = llenar_politica_html(parrafos)
    
    borrar_politica_previsualizacion(CARPETA_SUBIDA+"/PrivacyPolicy1.txt")
    respuesta = {
                'estado': 'exito',
                'mensaje': aux,
                'politica': marshal(politicaTexto, PoliticaDto.politicaMostrar)
            }
    return respuesta, 201
"""

#Guarda una politica que ha sido ingresada manualmente   
def guardar_politica():
    respuesta = request.form.to_dict()
    politica = Politica.query.filter_by(nombre=respuesta.get('nombre')).first()
    if not politica:
        fecha_aux = respuesta.get('fecha').split('T')[0]
        nueva_politica = Politica(
            nombre=respuesta.get('nombre'),
            url=respuesta.get('url'),
            fecha=fecha_aux,
            asignada=False
        )

        guardar_cambios(nueva_politica)

        # GUARDAR PARRAFOS
        archivo = request.files['politica']

        if archivo:
            if os.path.isdir(CARPETA_SUBIDA):

                if existe_archivo_politica_mismo_nombre(archivo.filename):
                    respuesta = {
                        'estado': 'fallido',
                        'mesaje': 'Existe un archivo con el mismo nombre'
                    }
                    return respuesta, 409

                archivo.filename = archivo.filename.strip().replace(" ", "")
                nombre_archivo = secure_filename(archivo.filename)

                try:
                    archivo.save(os.path.join(CARPETA_SUBIDA, nombre_archivo))
                except:
                    respuesta = {
                        'estado': 'fallido',
                        'mesaje': 'Existe un problema con la creacion del archivo en el servidor'
                    }
                    return respuesta, 409

                politica = abrir_politica(nombre_archivo)
                parrafos = separar_parrafos_principales(politica)
                politica_procesada = llenar_politica_html(parrafos)

                i = 0
                for parrafo in politica_procesada.parrafos:
                    parrafo_aux = ParrafoGuardar(i, parrafo.titulo, parrafo.texto, parrafo.texto_html,
                                                 nueva_politica.id)
                    guardar_parrafo(parrafo_aux)
                    i += 1

                borrar_politica_previsualizacion(archivo)
                respuesta = {
                    'estado': 'exito',
                    'mesaje': 'Politica cargada con exito'
                }
                return respuesta, 201

    else:
        respuesta = {
            'estado': 'fallido',
            'mensaje': 'El nombre de la politica ya existe'
        }
        return respuesta, 409

#Guardar politica que ha sido extraido de forma automatica con URL
def guardar_politica2():
    respuesta = request.form.to_dict()
    politica = Politica.query.filter_by(nombre=respuesta.get('nombre')).first()
    if not politica:
        fecha_aux = respuesta.get('fecha').split('T')[0]
        nueva_politica = Politica(
            nombre=respuesta.get('nombre'),
            url=respuesta.get('url'),
            fecha=fecha_aux,
            asignada=False
        )
        guardar_cambios(nueva_politica)

        # GUARDAR PARRAFOS
        politica_texto = respuesta.get('texto')
        nombre_politica = respuesta.get('nombre')
        nombre_archivo = nombre_politica.strip().replace(" ", "")
        nombre_archivo = secure_filename(nombre_archivo)
        if existe_archivo_politica_mismo_nombre(nombre_archivo):
            respuesta = {
                'estado': 'fallido',
                'mesaje': 'Existe un archivo con el mismo nombre'
            }
            return respuesta, 409
        if crear_archivo(politica_texto, nombre_archivo):
            nombre_archivo = nombre_archivo+".txt"
            texto = abrir_politica(nombre_archivo)
            parrafos = separar_parrafos_principales(texto)
            politica_procesada = llenar_politica_html(parrafos)
            i = 0
            for parrafo in politica_procesada.parrafos:
                parrafo_aux = ParrafoGuardar(i, parrafo.titulo, parrafo.texto, parrafo.texto_html,
                                                nueva_politica.id)
                guardar_parrafo(parrafo_aux)
                i += 1
            respuesta = {
                    'estado': 'exito',
                    'mesaje': 'Politica cargada con exito'
                }
            return respuesta, 201  
        else:
            respuesta = {
            'estado': 'fallido',
            'mensaje': 'No se ha podido crear el archivo'
            }
            return respuesta, 409  
    else:
        respuesta = {
            'estado': 'fallido',
            'mensaje': 'El nombre de la politica ya existe'
        }
        return respuesta, 409



def editar_politica(data):
    politica = Politica.query.filter_by(id=data['id']).first()
    if not politica:
        respuesta = {
            'estado': 'fallido',
            'mensaje': 'No existe politica de privacidad'
        }
        return respuesta, 409
    else:
        fecha_aux = data['fecha'].split('T')[0]
        politica.nombre = data['nombre']
        politica.url = data['url']
        politica.fecha = fecha_aux

        try:
            guardar_cambios(politica)
        except:
            respuesta = {
                'estado': 'fallido',
                'mensaje': 'Error editando politica'
            }
            return respuesta, 409
        else:
            respuesta = {
                'estado': 'exito',
                'mensaje': 'Politca edita con exita'
            }
            return respuesta, 201


def eliminar_politica(id):
    eliminado = eliminar_parrafos_politica(politica_id=id)
    politica = Politica.query.filter_by(id=id).first()

    if eliminado and politica:
        db.session.delete(politica)
        commit_db
        respuesta = {
            'estado': 'exito',
            'mensaje': 'Política eliminada con exito'
        }
        return respuesta, 201

    respuesta = {
    'estado': 'fallido',
    'mensaje': 'Error eliminando política'
    }
    return respuesta, 409

def actualizar_politica_asignada(data):
    """ Actualiza el campo 'asignada' de una política """
    politica_aux = Politica.query.filter_by(id=data['id']).first()
    if not politica_aux:
        respuesta = {
            'estado': 'fallido',
            'mensaje': 'Error actualizando politica asignada'
        }
        return respuesta, 409
    else:
        politica_aux.asignada = True
        guardar_cambios(politica_aux)
        respuesta = {
            'estado': 'exito',
            'mensaje': 'Politica asignada actualizado con exito'
        }
        return respuesta, 201

#Cuenta las URLS de un archivo
def contar_urls(data):
    """Cuenta URLs del archivo"""
    archivo = request.files['politica']
    if not politica_existe_peticion():
        respuesta = {
            'estado': 'fallido',
            'mesaje': 'No existe el archivo en la peticion'
        }
        return respuesta, 409

    if not archivo_permitido(archivo.filename):
        respuesta = {
            'estado': 'fallido',
            'mesaje': 'Extension de archivo invalida'
        }
        return respuesta, 409
    
    nombre_archivo = secure_filename(archivo.filename)
    archivo.save(os.path.join(CARPETA_URL, nombre_archivo))
    num = conteoURLs(nombre_archivo)
    if num != "Error":
        respuesta = {
                'estado': 'exito',
                'mensaje': str(num),
                
            }
        renombrarURLs(nombre_archivo)
        return respuesta, 201
    else:
        respuesta = {
                'estado': 'Fallido',
                'mensaje': 'No se pudo contar las URLS',
            }
        return respuesta, 409


#Genera reportes de politicas anotadas
def generarReporte(data):
    politicas_anotadas = []
    for item in data['politicas']:
        if(item['tipo_usuario']=='Consolidador'):
            item['tipo_usuario']=1
        else:
            item['tipo_usuario']=0
        consulta = (db.session.query(
            Anotacion.id, Anotacion.fecha_anotado, Anotacion.ejecuta, Anotacion.texto,
            Politica.id, Politica.nombre, Politica.url, 
            Parrafo.id, Parrafo.texto,
            Valor.id, Valor.descripcion,
            Atributo.id, Atributo.descripcion,
            Tratamiento.id, Atributo.descripcion)
            .outerjoin(Parrafo, Parrafo.id == Anotacion.parrafo_id)
            .outerjoin(Politica, Politica.id == Parrafo.politica_id)
            .outerjoin(AnotacionValorRelacion, AnotacionValorRelacion.anotacion_id == Anotacion.id)
            .outerjoin(Valor, Valor.id == AnotacionValorRelacion.valor_id)
            .outerjoin(Atributo, Atributo.id == Valor.atributo_id)
            .outerjoin(Tratamiento, Tratamiento.id == Atributo.tratamiento_id)
            .filter(Politica.id == item['id_politica'],
                    Anotacion.usuario_id == item['id_usuario'],
                    Anotacion.consolidar == item['tipo_usuario']).all() )
        if not consulta:
            print('No hay datos')
        else:
            for items in consulta:
                aux = ''
                aux = PoliticaAnotadaReporte(items[4],items[5],items[6],items[7],items[8],
                                                items[0],items[1],items[2],items[3],items[9],
                                                items[10],items[11],items[12],items[13],items[14])
                politicas_anotadas.append(aux)
    fecha_actual = datetime.datetime.now()
    aux2 = fecha_actual.strftime('%Y-%m-%d-%H-%M-%S')
    if(data['formato'] == 'csv'):
        nombre_archivo = "Reporte-"+aux2+".csv"
        if os.path.exists(CARPETA_REPORTE+"/"+nombre_archivo):
            os.remove(CARPETA_REPORTE+"/"+nombre_archivo)
        with open(CARPETA_REPORTE+"/"+nombre_archivo,'w',newline='',encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile,fieldnames=[
                'politica_id', 'politica_nombre', 'url','parrafo_id','parrafo_texto','anotacion_id',
                'fecha_anotado','permite','anotacion_texto','valor_id','valor','atributo_id','atributo',
                'tratamiento_id','tratamiento'])
            writer.writeheader()
            for items in politicas_anotadas:
                writer.writerow({
                'politica_id':items.politica_id, 'politica_nombre':items.politica_nombre, 
                'url':items.url,'parrafo_id':items.parrafo_id,'parrafo_texto':items.parrafo_texto,
                'anotacion_id':items.anotacion_id,'fecha_anotado':items.fecha_anotado,'permite':items.permite,
                'anotacion_texto':items.anotacion_texto,'valor_id':items.valor_id,'valor':items.valor,
                'atributo_id':items.atributo_id,'atributo':items.atributo,'tratamiento_id':items.tratamiento_id,
                'tratamiento':items.tratamiento}) 
        reportes = open(CARPETA_REPORTE+"/"+nombre_archivo,'r')
        respuesta = {
                'estado': 'exito',
                'mensaje': 'Se ha generado el reporte exitosamente',
                'reporte': marshal(reportes, PoliticaDto.reporte)
            }
        return respuesta, 201
    if(data['formato'] == 'yaml'):
        obtenerPoliticas(politicas_anotadas, aux2)
        respuesta = {
                'estado': 'exito',
                'mensaje': 'Se ha generado el reporte exitosamente',
            }
        return respuesta, 201     

#Se obtiene la informacion para reporte en formato YAML
#Politicas para YAML
def obtenerPoliticas(politicasAnotadas, fecha):
    data = {}
    idPoliticas = []
    i=1
    for aux in politicasAnotadas:
        if aux.politica_id not in idPoliticas:
            idPoliticas.append(aux.politica_id)
            data1 = { "policy_"+str(i) : {
                        "policy_id": aux.politica_id,
                        "policy_name" : aux.politica_nombre,
                        "policy_type" : "TEST",
                        "contains_synthetic": False,
                        "segments" : obtenerParrafos(aux.politica_id,politicasAnotadas),
                    }}
            generar_yaml(data1, aux.politica_nombre, fecha)
            #data.update(data1)
            i=i+1
    return data

#Parrafo para YAML
def obtenerParrafos(idPolitica,polticasAnotadas):
    data = {}
    idParrafo = []
    i=1
    for a in polticasAnotadas:
        if a.parrafo_id not in idParrafo:
            idParrafo.append(a.parrafo_id)
            if(idPolitica == a.politica_id):
                data1 = {
                    "segments_"+str(i):{
                        "segment_id" : a.parrafo_id,
                        "segment_text" : a.parrafo_texto,
                        "performed" : a.permite,   
                        "sentences" : obtenerAnotaciones(a.politica_id,a.parrafo_id,polticasAnotadas)          
                }}
                data.update(data1)
                i=i+1
    return(data)

#Anotaciones para YAML
def obtenerAnotaciones(idPolitica,idParrafo,politicasAnotadas):
    data = {}
    i=1
    for a in politicasAnotadas:
        if(idPolitica == a.politica_id and idParrafo == a.parrafo_id):
            data1 = {
                "sentences_"+str(i):{
                    "sentence_text": a.anotacion_texto,
                    "practice_type": a.tratamiento,
                    "practice_att": a.atributo,
                    "practice_value": a.valor,
            }}
            data.update(data1)
            i=i+1
    return(data)

def generar_yaml(data, nombre, fecha):
    nombre_archivo = "Reporte-"+nombre+"-"+fecha+".yml"
    if os.path.exists(CARPETA_REPORTE+"/"+nombre_archivo):
        os.remove(CARPETA_REPORTE+"/"+nombre_archivo)
    with open (CARPETA_REPORTE+"/"+nombre_archivo, 'w',encoding='utf-8') as f:
        yaml.dump(data,f,default_flow_style=False)


#Consulta todas las políticas de privacidad
def consultar_politicas():
    politicas = Politica.query.all()
    return marshal(politicas, PoliticaDto.politicaConsultar), 201


#Consulta todas las políticas de privacidad anotadas
def consultar_politicas_anotadas(tipo):
    #Tipo de politicas a consultar 
    #0 --> No finalizadas
    #1 --> Finalizadas
    if(tipo=='0'):
        finalizado = 0 
    else:
        finalizado = 1
    return politicas_anotadas(finalizado)

def politicas_anotadas(finalizado):
    politicas_anotadas = []
    consulta = (db.session.query(Politica.id,Usuario.id,Politica.nombre, Usuario.email, PoliticaUsuarioRelacion.consolidar)
                .join(Politica, Politica.id == PoliticaUsuarioRelacion.politica_id)
                .join(Usuario, Usuario.id == PoliticaUsuarioRelacion.usuario_id)
                .filter(PoliticaUsuarioRelacion.finalizado == finalizado)
                .order_by(Politica.nombre.asc())
                .all()
                )
    if not consulta:
        respuesta = {
            'estado': 'fallido',
            'mensaje': 'No existen politicas anotadas'
        }
        return respuesta, 409
    else:       
        for items in consulta:
            if(items[4]==True):
                tipo_usuario='Consolidador'
            else:
                tipo_usuario='Anotador'
            fecha = consultar_fecha(items[0],items[1], items[4])
            anotaciones = consultar_anotaciones(items[0],items[1], items[4])
            aux = PoliticaAnotadaConsultar(items[0], items[1],items[2], items[3], tipo_usuario, fecha, anotaciones)
            politicas_anotadas.append(aux)
        return marshal(politicas_anotadas, PoliticaDto.politicaAnotadaConsultar), 201

#Consulta la ultima fecha de anotacion de una politica
def consultar_fecha(politica_id, usuario_id, tipo_usuario):
    fecha = (db.session.query(Anotacion.fecha_anotado)
                   .outerjoin(Parrafo, Anotacion.parrafo_id == Parrafo.id)
                   .outerjoin(Politica, Politica.id == Parrafo.politica_id)
                   .filter(Politica.id == politica_id, Anotacion.usuario_id == usuario_id, Anotacion.consolidar==tipo_usuario)
                   .order_by(Anotacion.fecha_anotado)).first()
    if not fecha:
        fecha = None
    else:
        fecha = fecha[0]
    return fecha

#Consulta numero de anotacion de una politica
def consultar_anotaciones(politica_id, usuario_id, tipo_usuario):
    anotaciones = (db.session.query(Anotacion)
                   .outerjoin(Parrafo, Anotacion.parrafo_id == Parrafo.id)
                   .outerjoin(Usuario, Usuario.id == Anotacion.usuario_id)
                   .filter(Parrafo.politica_id == politica_id, Anotacion.usuario_id == usuario_id, Anotacion.consolidar == tipo_usuario)
                   .count())
    if not anotaciones:
        anotaciones = 0
    return anotaciones

#Consulta parrafos de una política
def consultar_politica_parrafos(politica_id):
    politica_parrafos = PoliticaConsultarParrafos
    politica_parrafos.parrafos = []
    parrafos_consulta = (db.session.query(Politica).filter(Politica.id == politica_id).all())

    if not parrafos_consulta:
        respuesta = {
            'estado': 'fallido',
            'mensaje': 'No existe la politica'
        }
        return respuesta, 409
    else:
        politica_parrafos.nombre = parrafos_consulta[0].nombre
        for parrafo in parrafos_consulta[0].parrafos:
            politica_parrafos.parrafos.append(parrafo)
        return marshal(politica_parrafos, PoliticaDto.politicaConsultarParrafos), 201


def consultar_politicas_consolidador_no_finalizadas(consolidador_id):
    """ Consulta las políticas de un consolidador que aún no han sido finalizadas"""
    politicas_anotar = []
    politicas_anotar_consulta = (db.session.query(PoliticaUsuarioRelacion, Politica)
                                 .outerjoin(Politica, PoliticaUsuarioRelacion.politica_id == Politica.id)
                                 .filter(PoliticaUsuarioRelacion.usuario_id == consolidador_id,
                                         PoliticaUsuarioRelacion.consolidar == True,
                                         PoliticaUsuarioRelacion.finalizado == False, ).all())

    if not politicas_anotar_consulta:
        return [], 201
    else:
        i = 0
        for item in politicas_anotar_consulta:
            if politica_lista_para_consolidar(item[0].politica_id):
                politicas_anotar.insert(i, item[0])
                politicas_anotar[i].politica_nombre = item[1].nombre
                politicas_anotar[i].progreso = calcular_progeso_politica(politicas_anotar[i].politica_id,
                                                                         consolidador_id,
                                                                         True)
                i += 1

        return marshal(politicas_anotar, PoliticaDto.politicaAnotarNoFinalizada), 201


def consultar_politicas_anotador_no_finalizadas(usuario_id):
    """ Consulta las políticas de un anotador que aún no han sido finalizadas"""
    politicas_anotar = [PoliticaAnotadorNoFinalizadas]
    politicas_anotar_sql = (db.session.query(PoliticaUsuarioRelacion, Politica)
                            .outerjoin(Politica, PoliticaUsuarioRelacion.politica_id == Politica.id)
                            .filter(PoliticaUsuarioRelacion.usuario_id == usuario_id,
                                    PoliticaUsuarioRelacion.consolidar == False,
                                    PoliticaUsuarioRelacion.finalizado == False).all())

    if not politicas_anotar_sql:
        return [], 201
    else:
        i = 0
        politicas_anotar.clear()
        for item in politicas_anotar_sql:
            politicas_anotar.insert(i, item[0])
            politicas_anotar[i].politica_nombre = item[1].nombre
            politicas_anotar[i].progreso = calcular_progeso_politica(politicas_anotar[i].politica_id, usuario_id, False)
            i += 1
        return marshal(politicas_anotar, PoliticaDto.politicaAnotarNoFinalizada), 201


def calcular_progeso_politica(politica_id, usuario_id, consolidar):
    """ Calcula el nivel de progreso en la anotacion o consolidación de una política"""
    num_parrafos = consultar_num_parrafos_politica(politica_id)
    ultimo_parrafo_anotado = consultar_ultima_anotacion_usuario_politica(politica_id, usuario_id, consolidar) + 1
    return round((ultimo_parrafo_anotado / num_parrafos) * 100, 2)


def guardar_usuario_politica(data):
    """ Permite asignar una política para consolidar o anotar"""
    politica_usuario = PoliticaUsuarioRelacion.query.filter_by(politica_id=data['politica_id'],
                                                               usuario_id=data['usuario_id'],
                                                               consolidar=data["consolidar"]).first()

    if not politica_usuario:
        nueva_politica_usuario = PoliticaUsuarioRelacion(
            politica_id=data['politica_id'],
            usuario_id=data['usuario_id'],
            consolidar=data['consolidar'],
            finalizado=False
        )
        guardar_cambios(nueva_politica_usuario)
        respuesta = {
            'estado': 'exito',
            'mesaje': 'Usuario asignado exitosamente'
        }
        return respuesta, 201
    else:
        respuesta = {
            'estado': 'fallido',
            'mensaje': 'Politica ya asignada'
        }
        return respuesta, 409


def actualizar_usuario_politica_asignada(data):
    """ Marca una política de privacidad como terminada ya sea en anotación o consolidación"""
    politica_usuario = PoliticaUsuarioRelacion.query.filter_by(politica_id=data['politica_id'],
                                                               usuario_id=data['usuario_id'],
                                                               consolidar=data['consolidar']).first()

    if not politica_usuario:
        respuesta = {
            "estado": "fallido",
            "mensaje": "Politica usuario no encontrada"
        }
        return respuesta, 409
    else:
        politica_usuario.finalizado = True
        guardar_cambios(politica_usuario)

        #Se comprueba si una política está lista para consolidar (todos los usuarion terminaron anotacion)
        #Y que no se este modificando en la etapa de consolidación,
        #de ser asi se calcula el coeficiente inter-anotador
        if politica_lista_para_consolidar(data['politica_id']) and data['consolidar'] == False:
            usuarios = (db.session.query(PoliticaUsuarioRelacion, Usuario)
                        .outerjoin(Usuario, PoliticaUsuarioRelacion.usuario_id == Usuario.id)
                        .filter(PoliticaUsuarioRelacion.politica_id == data['politica_id'],
                                PoliticaUsuarioRelacion.consolidar == False).all())

            politica = Politica.query.filter_by(id=data['politica_id']).first()

            politica.coeficiente = round(calcular_coeficiente_interanotador(data['politica_id'], usuarios).item(), 2)

            guardar_cambios(politica)

            respuesta = {
                "estado": "exito",
                "mensaje": "Politica usuario actualizada exitosamente y coeficiente calculado"
            }
            return respuesta, 201

        respuesta = {
            "estado": "exito",
            "mensaje": "Politica usuario actualizada exitosamente"
        }
        return respuesta, 201


def politica_lista_para_consolidar(politica_id):
    """ Se comprueba si una política está lista para consolidar (todos los usuarion terminaron anotacion) """
    politica_anotadores_consulta = (db.session.query(PoliticaUsuarioRelacion)
                                    .filter(PoliticaUsuarioRelacion.politica_id == politica_id,
                                            PoliticaUsuarioRelacion.consolidar == False).all())

    if not politica_anotadores_consulta:
        return False
    else:
        if all(x.finalizado for x in politica_anotadores_consulta):
            return True
        else:
            return False
