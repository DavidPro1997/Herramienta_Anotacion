import { Component } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { TratamientoNodoPlano } from '../tree-view-tratamientos/tree-view-tratamientos.component';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Anotacion, AnotacionValor, AnotacionNotificacion, AnotacionNotificacionConsultar, } from 'src/app/paginas/anotacion/anotacion';
import { SelectTextBoxService } from '../seleccionar texto/seleccionar-texto.service';
import { AnotacionService } from '../anotacion.service';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import { UsuarioService } from '../../administracion/usuario/usuario.service';
import { NotificacionIncosistenciaComponent } from '../notificacion-incosistencia/notificacion-incosistencia.component';
import { TreeViewCheckService } from '../tree-view-tratamientos/tree-view-tratamientos.service';
import { UsuarioConsultar } from '../../administracion/usuario/usuario';
import {TranslateService} from "@ngx-translate/core";


export class NodoSeleccionado {
  id: number;
}

@Component({
  selector: 'app-anotacion-politica',
  templateUrl: './anotacion-politica.component.html',
  styleUrls: ['./anotacion-politica.component.css']
})
export class AnotacionPoliticaComponent {

  politicaId: number;
  parrafoId: number = 0;
  ejecuta: boolean;
  usuario: UsuarioConsultar = JSON.parse(localStorage.getItem("usuario"));
  usuarioConsultado: UsuarioConsultar = null;
  anotacionResultado: AnotacionNotificacionConsultar = null;

  listaValores: NodoSeleccionado[] = [];
  valores: AnotacionValor[] = [];
  lista = new SelectionModel<TratamientoNodoPlano>(true /* multiple */);
  textoHtml: string = "";
  texto: string = "";


  constructor(
    private _router: Router,
    private _anotacionService: AnotacionService,
    private _seleccionarTextoService: SelectTextBoxService,
    private _treeViewService: TreeViewCheckService,
    private _usuarioService: UsuarioService,
    private _dialogo: MatDialog,
    private _notificacion: MatSnackBar,
    private translate: TranslateService
  ) {
    this.politicaId = this._router.getCurrentNavigation().extras.state.politica_id;

    this._seleccionarTextoService.obtenerTexto().subscribe(
      texto => this.texto = texto
    )
    this._seleccionarTextoService.obtenerTextoHmtl().subscribe(
      textoHtml => this.textoHtml = textoHtml
    )

    this._treeViewService.obtenerEjecuta().subscribe(
      ejecutaAux => this.ejecuta = ejecutaAux
    )
  }


  parrafoCambiado() {
    this.lista.clear()
    this.listaValores = []
    this._treeViewService.colocarEjecuta(false)
  }

  obtenerLista($event) {
    this.listaValores = []
    this.lista = $event;
    if (this.lista != null) {
      this.lista.selected.forEach(
        item => {
          if (item.level == 2) {
            this.listaValores.push(item)

          }
        }
      )
    }
  }

  obtenerParrafoId($event) {
    this.parrafoId = $event
  }

  guardarAnotacion() {
    this.valores = [];
    if (this.listaValores.length == 0) {
      let mensaje = '';
      this.translate.stream("anotar.dialogo.advertencia").subscribe((res: string)=>{
        mensaje = res;
      });
      alert(mensaje)
    } else {
      this.listaValores.forEach(
        valor => {
          let valor_aux = new AnotacionValor(valor.id)
          this.valores.push(valor_aux)
        }
      )

      let anotacion = new Anotacion(this.texto, this.textoHtml, '', this.parrafoId, this.usuario.id, false, !this.ejecuta, this.valores)

      this._usuarioService.obtenerUsuario(this.usuario.id).subscribe(
        usuario => {
          if (usuario.entrenamiento) {
            let anotacionNotificacion = new AnotacionNotificacion(this.usuario.id, this.parrafoId, !this.ejecuta, this.valores)
            this._anotacionService.notificacionAnotacion(anotacionNotificacion).subscribe(
              (notificacion: AnotacionNotificacionConsultar) => {
                if (notificacion.inconsistencia) {
                  let dialogoNotificacion = this._dialogo.open(NotificacionIncosistenciaComponent, {
                    width: '50%',
                    height: 'fit-content',
                    data: {
                      anotacion: anotacion,
                      notificacion: notificacion
                    }
                  })

                  dialogoNotificacion.afterClosed().subscribe(
                    guardado => {
                      if (guardado) {
                        this.parrafoCambiado()
                        this._seleccionarTextoService.colocarTexto("")
                        this._seleccionarTextoService.colocarTextoHtml("")
                        this._seleccionarTextoService.consultarTotalAnotacionesAnotadorParrafoServicio(this.parrafoId, this.usuario.id)
                      } else {
                        this._seleccionarTextoService.colocarTexto(this.texto)
                        this._seleccionarTextoService.colocarTextoHtml(this.textoHtml)
                        this.lista.clear()
                        this.listaValores = []
                      }
                    }
                  )

                } else {
                  this.enviarAnotacion(anotacion)
                }
              }
            )
          } else {
            this.enviarAnotacion(anotacion)
          }
        },
        () => {
          let nota = '';
          this.translate.stream("anotar.dialogo.anotacion_error").subscribe((res: string)=>{
            nota = res;
          });
          this.notificacion(nota, "fracaso-snackbar")
        }
      )
    };
  }

  enviarAnotacion(anotacion: Anotacion) {
    this._anotacionService.guardarAnotacion(anotacion).subscribe(
      () => {
        let nota = '';
          this.translate.stream("anotar.dialogo.anotacion_exito").subscribe((res: string)=>{
            nota = res;
          });
        this.notificacion(nota, "exito-snackbar")
        setTimeout(
          () => {
            //Simular un cambio de parrafo y limpiar todos los campos
            this.parrafoCambiado()
            this._seleccionarTextoService.colocarTexto("")
            this._seleccionarTextoService.colocarTextoHtml("")
            this._seleccionarTextoService.consultarTotalAnotacionesAnotadorParrafoServicio(this.parrafoId, this.usuario.id)
          },
          1000
        )
      },
      () => {
        let nota = '';
          this.translate.stream("anotar.dialogo.anotacion_error").subscribe((res: string)=>{
            nota = res;
          });
        this.notificacion(nota, "fracaso-snackbar")
      }
    )
  }


  notificacion(mensaje: string, estilo: string, duracion?: number) {
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      panelClass: [estilo],
      duration: duracion | 2000,
      verticalPosition: 'top'
    })
  }
}
