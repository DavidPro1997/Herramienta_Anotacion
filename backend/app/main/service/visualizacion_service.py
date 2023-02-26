from app.main import db
from app.main.model.politica import Politica, PoliticaUsuarioRelacion
from app.main.model.anotacion import Anotacion, AnotacionValorRelacion
from app.main.model.parrafo import Parrafo
from app.main.model.tratamiento import Tratamiento
from app.main.model.atributo import Atributo
from app.main.model.valor import Valor
from app.main.util.clases_auxiliares import PoliticasVisualizacionLista, PoliticaVisualizacion, ParrafosVisualizacion, \
    AnotacionVisualizacion, TratamientoVisualizacion, TratamientoVisualizacionLista, AtributoVisualizacionLista, \
    PoliticaPresentacion
from app.main.util.dto import VisualizacionDto
from flask_restplus import marshal


def consultar_politicas_visualizar():
    """ Lista de todas las políticas que han concluido la consolidación"""
    politicas = []
    politicas_consulta = (db.session.query(Politica)
                          .outerjoin(PoliticaUsuarioRelacion, Politica.id == PoliticaUsuarioRelacion.politica_id)
                          .filter(PoliticaUsuarioRelacion.consolidar == True,
                                  PoliticaUsuarioRelacion.finalizado == True).all())

    for politica in politicas_consulta:
        anotaciones = consultar_total_anotaciones(politica.id)
        politica_aux = PoliticasVisualizacionLista(politica.id, politica.nombre, politica.fecha, anotaciones)
        politicas.append(politica_aux)

    return marshal(politicas, VisualizacionDto.listaPoliticas), 201

def consultar_politica_visualizar(politica_id):
    """Consulta de política de privacidad con sus secciones y anotaciones """
    politica_consultar = Politica.query.filter_by(id=politica_id).first()

    if not politica_consultar:
        respuesta = {
            'estado': 'fallido',
            'mensaje': 'Politica no encontrada'
        }
        return respuesta, 404
    else:
        parrafos = []
        parrafos_consulta = Parrafo.query.filter_by(politica_id=politica_id).all()

        #Aqui se llena los tratamientos atributos y valores de una anotación.
        for parrafo in parrafos_consulta:
            anotaciones = []
            anotaciones_consulta = Anotacion.query.filter_by(parrafo_id=parrafo.id, consolidar=True).all()

            for anotacion in anotaciones_consulta:
                tratamientos = []
                tratamientos_consulta = (db.session.query(AnotacionValorRelacion, Tratamiento, Atributo, Valor)
                                         .outerjoin(Valor, AnotacionValorRelacion.valor_id == Valor.id)
                                         .outerjoin(Atributo, Valor.atributo_id == Atributo.id)
                                         .outerjoin(Tratamiento, Atributo.tratamiento_id == Tratamiento.id)
                                         .filter(AnotacionValorRelacion.anotacion_id == anotacion.id).all())

                for tratamiento in tratamientos_consulta:
                    tratamiento_aux = TratamientoVisualizacion(tratamiento[1].id, tratamiento[1].descripcion,
                                                               tratamiento[2].id, tratamiento[2].descripcion,
                                                               tratamiento[3].id, tratamiento[3].descripcion,
                                                               tratamiento[1].color_tratamiento.codigo)
                    tratamientos.append(tratamiento_aux)

                anotacion_aux = AnotacionVisualizacion(anotacion.id, anotacion.texto_html, anotacion.comentario,
                                                       anotacion.ejecuta, tratamientos)
                anotaciones.append(anotacion_aux)

            parrafo_aux = ParrafosVisualizacion(parrafo.id, parrafo.titulo, parrafo.texto_html, anotaciones)
            parrafos.append(parrafo_aux)

        politica_aux = PoliticaVisualizacion(politica_consultar.id,
                                             politica_consultar.nombre,
                                             politica_consultar.fecha,
                                             parrafos)

        tratamientos = consultar_tratamientos_lista(politica_id)
        politica_presentacion = PoliticaPresentacion(tratamientos, politica_aux)

        return marshal(politica_presentacion, VisualizacionDto.politicaPresentacion), 201


def consultar_tratamientos_lista(politica_id):
    """ Consulta de todos los tratamientos de datos que están disponibles para anotar"""
    tratamientos = []
    tratamientos_consultar = Tratamiento.query.all()

    total_anotaciones = consultar_total_anotaciones_valor(politica_id)
    for tratamiento in tratamientos_consultar:
        atributos = []
        atributos_consulta = Atributo.query.filter_by(tratamiento_id=tratamiento.id).all()
        for atributo in atributos_consulta:
            valores = Valor.query.filter_by(atributo_id=atributo.id).all()

            if valores:
                anotaciones_atributo = consultar_total_anotaciones_atributo(politica_id, atributo.id)
                atributo_aux = AtributoVisualizacionLista(atributo.id,
                                                          atributo.descripcion,
                                                          tratamiento.color_tratamiento.codigo,
                                                          anotaciones_atributo)
                atributos.append(atributo_aux)

        if atributos:
            anotaciones = consultar_total_anotaciones_tratamiento(politica_id, tratamiento.id)
            tratamiento_aux = TratamientoVisualizacionLista(tratamiento.id, tratamiento.descripcion,
                                                            tratamiento.color_tratamiento.codigo,
                                                            anotaciones / total_anotaciones * 100,
                                                            anotaciones,
                                                            atributos)
            tratamientos.append(tratamiento_aux)

    return tratamientos


def consultar_total_anotaciones_tratamiento(politica_id, tratamiento_id):
    """ Número de anotaciones que contiene un tratamiento de datos"""
    anotaciones_total = (db.session.query(Anotacion)
                         .outerjoin(AnotacionValorRelacion, Anotacion.id == AnotacionValorRelacion.anotacion_id)
                         .outerjoin(Valor, AnotacionValorRelacion.valor_id == Valor.id)
                         .outerjoin(Atributo, Valor.atributo_id == Atributo.id)
                         .outerjoin(Tratamiento, Atributo.tratamiento_id == Tratamiento.id)
                         .outerjoin(Parrafo, Anotacion.parrafo_id == Parrafo.id)
                         .filter(Parrafo.politica_id == politica_id,
                                 Tratamiento.id == tratamiento_id,
                                 Anotacion.consolidar == True).count())

    return anotaciones_total


def consultar_total_anotaciones_atributo(politica_id, atributo_id):
    """ Número de anotaciones que contiene un atributo"""
    anotaciones_total = (db.session.query(Anotacion)
                         .outerjoin(AnotacionValorRelacion, Anotacion.id == AnotacionValorRelacion.anotacion_id)
                         .outerjoin(Valor, AnotacionValorRelacion.valor_id == Valor.id)
                         .outerjoin(Atributo, Valor.atributo_id == Atributo.id)
                         .outerjoin(Parrafo, Anotacion.parrafo_id == Parrafo.id)
                         .filter(Parrafo.politica_id == politica_id,
                                 Atributo.id == atributo_id,
                                 Anotacion.consolidar == True).count())

    return anotaciones_total


def consultar_total_anotaciones(politica_id):
    """ Total de anotaciones realizadas sobre una política,
        este valor se presenta junto a cada política de privacidad
        en la interfaz donde se listan todas las políticas disponibles"""
    anotaciones = (db.session.query(Anotacion)
                   .outerjoin(Parrafo, Anotacion.parrafo_id == Parrafo.id)
                   .filter(Parrafo.politica_id == politica_id,
                           Anotacion.consolidar == True).count())

    return anotaciones


def consultar_total_anotaciones_valor(politica_id):
    """ Total de tratamientos/atributos/valores anotados,
        este valor se usa para el cálculo del porcentaje que cada tratamiento representa del total de anotaciones"""
    anotaciones = (db.session.query(Anotacion.id)
                   .outerjoin(AnotacionValorRelacion, Anotacion.id == AnotacionValorRelacion.anotacion_id)
                   .outerjoin(Parrafo, Anotacion.parrafo_id == Parrafo.id)
                   .filter(Parrafo.politica_id == politica_id,
                           Anotacion.consolidar == True).count())

    return anotaciones
