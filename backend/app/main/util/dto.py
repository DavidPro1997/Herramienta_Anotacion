from flask_restplus import Namespace, fields


class AuthDto:
    api = Namespace('auth', description='operaciones relaciones a autenticacion')
    usuario_auth = api.model('detalles_auth', {
        'email': fields.String(required=True, description='email de usuario'),
        'clave': fields.String(required=True, description='clave del usuario'),
    })


class ColorDto:

    api = Namespace('Color', description='Operaciones relacionadas a paleta de colores para anotaciones')
    color = api.model('color', {
        'codigo': fields.String(required=True, description='codigo hexadecimal del color')
    })

    colorEditar = api.model('colorEditar', {
        'id': fields.Integer(required=True, descripcion='id del color'),
        'codigo': fields.String(required=True, description='codigo hexadecimal del color')
    })

    colorConsultar = api.model('colorConsultar', {
        'id': fields.Integer(required=True, descripcion='id del color'),
        'codigo': fields.String(description='codigo hexadecimal del color'),
        'disponible': fields.Boolean(description='color disponible')
    })


class ModuloDto:
    api = Namespace('Modulo', description='Operaciones relacionadas a modulos')

    modulo = api.model('modulo', {
        'nombre': fields.String(required=True, description='nombre del modulo(unico)'),
        'icono': fields.String(required=True, description='icono para menu'),
        'path': fields.String(required=True, description='ruta del modulo'),
        'padre_id': fields.Integer(required=True, description='id del modulo padre, NULL para modulo sin padre')
    })

    moduloEditar = api.model('moduloEditar', {
        'id': fields.Integer(required=True, description='id del modulo'),
        'nombre': fields.String(required=True, description='nombre del modulo'),
        'icono': fields.String(required=True, description='icono para menu'),
        'path': fields.String(required=True, description='ruta del modulo'),
        'padre_id': fields.Integer(required=True, description='id del modulo padre')
    })

    moduloConsultar = api.model('moduloConsultar', {
        'id': fields.Integer(required=True, description='id del modulo'),
        'nombre': fields.String(required=True, description='nombre del modulo'),
        'icono': fields.String(required=True, description='icono para menu'),
        'path': fields.String(required=True, description='ruta del modulo'),
        'padre_id': fields.Integer(required=True, description='id del modulo padre')
    })

    moduloConsultarHijos = api.model('moduloConsultarHijos', {
        'nombre': fields.String,
        'icono': fields.String,
        'path': fields.String,
        'hijos': fields.List(fields.Nested(api.model('hijos', {
            'nombre': fields.String,
            'icono': fields.String,
            'path': fields.String,
            'hijos': fields.List(fields.Nested(api.model('hijos', {
                'nombre': fields.String,
                'icono': fields.String,
                'path': fields.String
            
        })))
            
        })))
    })

    moduloConsultarHijos2 = api.inherit('moduloConsultarHijos2', moduloConsultarHijos, {
        'hijos': fields.List(fields.Nested(moduloConsultarHijos))
    })


class AnotacionDto:
    api = Namespace('Anotacion', description='Operaciones relacionadas a anotaciones')

    anotacionesUsuarioDetalle = api.model('anotacionesUsuarioDetalle', {
        'email': fields.String,
        'total_anotaciones': fields.Integer
    })

    detallesAnotacionPolitica = api.model('detallesAnotacionPolitica', {
        'coeficiente': fields.Float,
        'anotadores': fields.List(fields.Nested(anotacionesUsuarioDetalle))
    })

    anotacionValor = api.model('anotacionValor', {
        'valor_id': fields.Integer(required=True)
    })

    anotacionNotificacion = api.model('anotacionNotificacion', {
        'usuario_id': fields.Integer(required=True),
        'parrafo_id': fields.Integer(required=True),
        'ejecuta': fields.Boolean(required=True),
        'valores': fields.List(fields.Nested(anotacionValor), required=True)
    })

    anotacion = api.model('anotacion', {
        'texto': fields.String(required=True),
        'texto_html': fields.String(required=True),
        'comentario': fields.String,
        'parrafo_id': fields.Integer(required=True),
        'usuario_id': fields.Integer(required=True),
        'consolidar': fields.Boolean(required=True),
        'ejecuta': fields.Boolean(required=True),
        'valores': fields.List(fields.Nested(anotacionValor))
    })

    anotacionConsultar = api.model('anotacionConsultar', {
        'texto_html': fields.String,
        'comentario': fields.String,
        'valor_id': fields.Integer,
        'valor_descripcion': fields.String,
        'atributo_id': fields.Integer,
        'atributo_descripcion': fields.String,
        'tratamiento_id': fields.Integer,
        'tratamiento_descripcion': fields.String,
        'parrafo_id': fields.Integer,
        'usuario_id': fields.Integer,
        'usuario_nombre': fields.String
    })

    anotacionValorConsultar = api.model('anotacionValor', {
        'color_primario': fields.String,
        'tratamiento_descripcion': fields.String,
        'atributo_descripcion': fields.String,
        'valor_descripcion': fields.String,
        'valor_id': fields.Integer
    })

    anotacionNotificacionConsultar = api.model('anotacionNotificacionConsultar', {
        'inconsistencia': fields.Boolean,
        'valores_inconsistentes': fields.List(fields.Nested(anotacionValorConsultar)),
        'valores_sugeridos': fields.List(fields.Nested(anotacionValorConsultar))
    })

    anotacionConsultarAnotadores = api.model('anotacionConsultarAnotadores', {
        'id': fields.Integer,
        'texto': fields.String,
        'ejecuta': fields.Boolean,
        'comentario': fields.String,
        'valores': fields.List(fields.Nested(anotacionValorConsultar))
    })

    usuariosAnotaciones = api.model('usuariosAnotaciones', {
        'email': fields.String(required=True, description='direccion de email de usuario/nombre de usuario'),
        'rol_usuario': fields.String(required=True, description='rol de usuario'),
        'anotaciones': fields.List(fields.Nested(anotacionConsultarAnotadores))
    })

    anotacionesAnotadoresConsultarRespuesta = api.model('anotacionesAnotadoresConsultarRespuesta', {
        'inconsistencia': fields.Boolean,
        'usuarios_anotaciones': fields.List(fields.Nested(usuariosAnotaciones))
    })

    consultarTotalAnotaciones = api.model('consultarTotalAnotaciones', {
        'usuario_id': fields.Integer(required=True),
        'parrafo_id': fields.Integer(required=True),
        'consolidar': fields.Boolean(required=True)
    })


class ParrafoDto:
    api = Namespace('Parrafo', description='Operaciones relacionadas a parrafos')
    parrafoMostrar = api.model('parrafoMostrar', {
        'id': fields.Integer,
        'titulo': fields.String,
        'texto_html': fields.String
    })


class PoliticaDto:
    api = Namespace('Politica', description='Operaciones relacionadas a politicas')
    politica = api.model('Politica', {
        'nombre': fields.String(required=True, description='Nombre de la empresa o compania'),
        'url': fields.String(required=True, description='URL del sitio de donde se obtuvo la politica'),
        'fecha': fields.Date(required=True, description='Fecha en la cual fue publicada la politica de privacidad')
    })

    politicaConsultar = api.model('politicaConsultar', {
        'id': fields.Integer,
        'nombre': fields.String,
        'url': fields.String,
        'fecha': fields.Date,
        'asignada': fields.Boolean
    })

    politicaAnotadaConsultar = api.model('politicaAnotadaConsultar', {
        'id_politica': fields.Integer,
        'id_usuario': fields.Integer,
        'nombre': fields.String,
        'usuario': fields.String,
        'tipo_usuario': fields.String,
        'fecha': fields.Date,
        'anotaciones': fields.Integer
    })

    reporte = api.model('reporte', {
        'reporte': fields.String
    })

    politicaMostrar = api.model('PoliticaMostrar', {
        'nombre': fields.String,
        'url': fields.String,
        'fecha': fields.String,
        'parrafos': fields.List(fields.Nested(ParrafoDto.parrafoMostrar))
    })

    politicaUsuarioGuardar = api.model('politicaUsuarioGuardar', {
        'politica_id': fields.Integer(required=True),
        'usuario_id': fields.Integer(required=True),
        'consolidar': fields.Boolean(required=True)
    })

    politicaAnotarNoFinalizada = api.model('PoliticaAnotarNoFinalizada', {
        'politica_id': fields.Integer(required=True),
        'politica_nombre': fields.String(required=True),
        'progreso': fields.Float(required=True)
    })

    politicaConsultarParrafos = api.model('politicaConsultarParrafos', {
        'nombre': fields.String,
        'parrafos': fields.List(fields.Nested(ParrafoDto.parrafoMostrar))
    })


class RolUsuarioDto:
    api = Namespace('RolUsuario', description='Operaciones relacionadas a roles de usuario')
    rolUsuario = api.model('rolUsuario', {
        'nombre': fields.String(required=True, description='nombre del rol de usuario'),
        'descripcion': fields.String(required=True, description='descripcion del rol en el sistema')
    })

    rolUsuarioEditar = api.model('rolUsuarioEditar', {
        'id': fields.Integer(required=True, description='id del rol'),
        'nombre': fields.String(required=True, description='nombre del rol de usuario'),
        'descripcion': fields.String(required=True, description='descripcion del rol en el sistema')
    })

    rolUsuarioConsultar = api.model('rolUsuarioConsultar', {
        'id': fields.Integer(required=True, description='id del rol'),
        'nombre': fields.String(required=True, description='nombre del rol de usuario'),
        'descripcion': fields.String(required=True, description='descripcion del rol en el sistema')
    })

    rolUsuarioModulo = api.model('rolUsuarioModulo', {
        'rol_id': fields.Integer(required=True, description='id del rol de usuario'),
        'modulo_id':  fields.Integer(required=True, description='id del modulo asignado al rol')
    })

    rolUsuarioModuloCosultar = api.model('rolUsuarioModuloCosultar', {
        'id': fields.Integer(required=True, description='id del rol'),
        'nombre': fields.String(required=True, description='nombre del rol de usuario'),
        'descripcion': fields.String(required=True, description='descripcion del rol en el sistema'),
        'modulos': fields.List(fields.Nested(ModuloDto.moduloConsultarHijos2))
    })


class UsuarioDto:
    api = Namespace('Usuario', description='Operaciones relacionadas a usuarios ')

    usuario = api.model('usuario', {
        'email': fields.String(required=True, description='direccion de email de usuario/nombre de usuario'),
        'rol_usuario_id': fields.Integer(required=True, description='rol de usuario'),
        'entrenamiento': fields.Boolean(required=True, description='el usuario sera sometido a entrenamiento?')
    })

    usuarioConsultar = api.model('usuarioConsultar', {
        'id': fields.Integer,
        'email': fields.String,
        'rol_usuario_id': fields.Integer,
        'rol_usuario': fields.String,
        'activo': fields.Boolean,
        'entrenamiento': fields.Boolean
    })

    usuarioEditar = api.model('usuarioEditar', {
        'id': fields.Integer(required=True),
        'email': fields.String(required=True, description='direccion de email de usuario/nombre de usuario'),
        'rol_usuario_id': fields.Integer(required=True, description='rol de usuario'),
        'entrenamiento': fields.Boolean(required=True, description='el usuario sera sometido a entrenamiento?'),
        'activo': fields.Boolean(required=True, description='el usuario sera sometido a entrenamiento?')
    })

    usuarioConsultarAsignacion = api.model('usuarioConsultarAsignacion', {
        'id': fields.Integer,
        'email': fields.String
    })

    usuarioConsultarLogin = api.model('usuarioConsultarLogin', {
        'id': fields.Integer(description='id de usuario'),
        'email': fields.String(required=True, description='direccion de email de usuario/nombre de usuario'),
        'rol_usuario': fields.String(required=True, description='rol de usuario'),
        'activo': fields.Boolean(description='Usuario activo/inactivo'),
        'entrenamiento': fields.Boolean(description='Usuario en entrenamiento?'),
        'modulos': fields.List(fields.Nested(ModuloDto.moduloConsultarHijos2))

    })


class ValorDto:
    api = Namespace('Valor', description='Operaciones relacionadas a valores de un atributo')
    valor = api.model('valor', {
        'descripcion': fields.String(required=True, description='nombre del valor'),
        'atributo_id': fields.Integer(requried=True, description='id del atributo padre'),
    })

    valorEditar = api.model('valorEditar', {
        'id': fields.Integer(required=True, description='id del atributo'),
        'descripcion': fields.String(required=True, description='nombre del valor')
    })

    valorConsultar = api.model('valorConsultar', {
        'id': fields.Integer(required=True, description='id del atributo'),
        'descripcion': fields.String(required=True, description='nombre del valor'),
        'tratamiento_id': fields.Integer(required=True, description='id del tratamiento padre'),
        'atributo_id': fields.Integer(required=True, description='id del atributo padre'),
        'color_primario': fields.String(requried=True, description='codigo hexadecimal del color')
    })

    valorCompleto = api.model('valorCompleto', {
        'id': fields.Integer(required=True, description='id del atributo'),
        'descripcion': fields.String(required=True, description='nombre del valor'),
        'color_primario': fields.String(requried=True, description='codigo hexadecimal del color')
    })

    valorConsultarCompleto = api.model('valorConsultarCompleto', {
        'id': fields.Integer,
        'descripcion': fields.String,
        'color_primario': fields.String,
        'atributo_id': fields.Integer,
        'atributo_descripcion': fields.String,
        'tratamiento_id': fields.Integer,
        'tratamiento_descripcion': fields.String
    })


class AtributoDto:
    api = Namespace('Atributo', description='Operaciones relacionadas a atributos de tratamientos de datos')
    atributo = api.model('atributo', {
        'descripcion': fields.String(required=True, description='nombre del atributo'),
        'tratamiento_id': fields.Integer(requried=True, description='id del tratamiento padre')
    })

    atributoEditar = api.model('atributoEditar', {
        'id': fields.Integer(required=True, description='id del atributo'),
        'descripcion': fields.String(required=True, description='nombre del atributo')
    })

    atributoConsultar = api.model('atributoConsultar', {
        'id': fields.Integer,
        'descripcion': fields.String,
        'tratamiento_id': fields.Integer,
        'color_primario': fields.String
    })

    atributoCompleto = api.model('atributoCompleto', {
        'id': fields.Integer(required=True, description='id del atributo'),
        'descripcion': fields.String(required=True, description='nombre del atributo'),
        'color_primario': fields.String(requried=True, description='codigo hexadecimal del color'),
        'hijos': fields.List(fields.Nested(ValorDto.valorCompleto))

    })


class TratamientoDto:
    api = Namespace('Tratamiento', description='Operaciones relacionadas a tratamientos')
    tratamiento = api.model('tratamiento', {
        'descripcion': fields.String(required=True, description='descripcion del tratamiento'),
        'color_primario': fields.Integer(required=True, description='id del color')
    })

    tratamientoEditar = api.model('tratamientoEditar', {
        'id': fields.Integer,
        'descripcion': fields.String,
        'color_primario': fields.Integer
    })

    tratamientoConsultar = api.model('tratamientoConsultar', {
        'id': fields.Integer,
        'descripcion': fields.String,
        'color_id': fields.Integer,
        'color_primario_codigo': fields.String
    })

    tratamientoCompleto = api.model('tratamientoCompleto', {
        'id': fields.Integer(required=True),
        'descripcion': fields.String(required=True, description='descripcion del tratamiento'),
        'color_primario': fields.String(required=True, description='Color del tratamiento para anotaciones'),
        'hijos': fields.List(fields.Nested(AtributoDto.atributoCompleto))
    })


class VisualizacionDto:
    api = Namespace('Visualizacion', description='Operaciones relacionadas a visualizacion de políticas')

    listaPoliticas = api.model('listaPoliticas', {
        'id': fields.Integer,
        'nombre': fields.String,
        'fecha': fields.String,
        'total_anotaciones': fields.Integer
    })

    tratamientoVisualizacion = api.model('tratamientoVisualizacion', {
        'tratamiento_id': fields.Integer,
        'tratamiento_descripcion': fields.String,
        'atributo_id': fields.Integer,
        'atributo_descripcion': fields.String,
        'valor_id': fields.Integer,
        'valor_descripcion': fields.String,
        'color_primario': fields.String
    })

    anotacionVisualizacion = api.model('anotacionVisualizacion', {
        'id': fields.Integer,
        'texto_html': fields.String,
        'comentario': fields.String,
        'ejecuta': fields.Boolean,
        'tratamientos': fields.List(fields.Nested(tratamientoVisualizacion))
    })

    parrafoVisualizacion = api.model('parrafoVisualizacion', {
        'id': fields.Integer,
        'titulo': fields.String,
        'texto_html': fields.String,
        'anotaciones': fields.List(fields.Nested(anotacionVisualizacion))
    })

    politicaVisualizacion = api.model('politicaVisualizacion', {
        'id': fields.Integer,
        'nombre': fields.String,
        'fecha': fields.String,
        'parrafos': fields.List(fields.Nested(parrafoVisualizacion))
    })

    atributoVisualizacionLista = api.model('atributoVisualizacionLista', {
        'id': fields.Integer,
        'descripcion': fields.String,
        'color_primario': fields.String,
        'numero_anotaciones': fields.Integer
    })

    tratamientoVisualizacionLista = api.model('tratamientoVisualizacionLista', {
        'id': fields.Integer,
        'descripcion': fields.String,
        'color_primario': fields.String,
        'porcentaje': fields.Float,
        'numero_anotaciones': fields.Integer,
        'atributos': fields.List(fields.Nested(atributoVisualizacionLista))
    })

    politicaPresentacion = api.model('politicaPresentacion', {
        'tratamientos': fields.List(fields.Nested(tratamientoVisualizacionLista)),
        'politica': fields.Nested(politicaVisualizacion)
    })
