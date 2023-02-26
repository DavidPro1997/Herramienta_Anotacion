import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/common'
import { PoliticaService } from 'src/app/paginas/administracion/politica/gestion/gestion.service'
import { PoliticaVisualizar } from '../../administracion/politica/gestion/gestion';
import { SelectTextBoxService } from './seleccionar-texto.service'
import { MatDialog, MatSnackBar } from '@angular/material';
import { VisualizarAnotacionesComponent } from '../visualizar-anotaciones/visualizar-anotaciones.component';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import { Router } from '@angular/router';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-seleccionar-texto',
  templateUrl: './seleccionar-texto.component.html',
  styleUrls: ['./seleccionar-texto.component.css']
})

export class SeleccionarTextoComponent implements OnInit {

  @Input() politicaId: number;
  @Output() parrafo_id = new EventEmitter<number>();
  @Output() guardar_anotaciones = new EventEmitter<null>();
  @Output() parrafo_cambiado = new EventEmitter<boolean>();

  politica: PoliticaVisualizar = null;
  usuarioAux = JSON.parse(localStorage.getItem('usuario'))

  parrafoIndice = 0;
  parrafoId = 0;
  totalParrafos = 0;
  parrafoTitulo = '';
  parrafoActual = '';
  textoSeleccionado = "";
  textoSeleccionadoHtml = "";

  totalAnotacionesParrafo = 0;

  constructor(
    @Inject(DOCUMENT) private documento: Document,
    private _politicaService: PoliticaService,
    private _seleccionarTextoService: SelectTextBoxService,
    private _dialogo: MatDialog,
    private _notificacion: MatSnackBar,
    private _router: Router,
    private translate: TranslateService
  ) { }

  visualizarAnotaciones() {
    const dialogoAnotaciones = this._dialogo.open(VisualizarAnotacionesComponent, {
      width: '50%',
      height: 'fit-content',
      maxHeight: '70%',
      data: {
        parrafoId: this.parrafoId,
        usuarioId: this.usuarioAux.id,
        consolidacion: false
      }
    })

    dialogoAnotaciones.afterClosed().subscribe(
      () => this._seleccionarTextoService.consultarTotalAnotacionesAnotadorParrafoServicio(this.parrafoId, this.usuarioAux.id)
    )
  }

  consultarParrafosPolitica(politicaIdAux: number) {
    this._politicaService.consultarParrafosPoliticaAnotar(politicaIdAux).subscribe(
      resultado => {
        this.politica = resultado;
        this.totalParrafos = this.politica.parrafos.length;
        this.parrafoId = this.politica.parrafos[this.parrafoIndice].id;
        this.parrafoTitulo = this.politica.parrafos[this.parrafoIndice].titulo;
        this.parrafoActual = this.politica.parrafos[this.parrafoIndice].texto_html;
        this._seleccionarTextoService.consultarTotalAnotacionesAnotadorParrafoServicio(this.parrafoId, this.usuarioAux.id).subscribe(
          totalAnotaciones => this.totalAnotacionesParrafo = totalAnotaciones
        )
        let elemento = this.documento.getElementById("texto");
        elemento.innerHTML = this.parrafoActual;
      },
      error => console.log(error)
    )
  }

  politicaUsuarioFinalizada() {
    this._politicaService.editarPoliticaAnotadorFinalizada(this.politicaId, this.usuarioAux.id, false).subscribe(
      () => {
        let nota = '';
        this.translate.stream("anotar.dialogo.exito").subscribe((res: string)=>{
          nota = res;
        });
        this.notificacion(nota, "exito-snackbar")
        this._router.navigate(['/paginas/anotacion'])
      },
      () => {
        let nota = '';
        this.translate.stream("anotar.dialogo.error").subscribe((res: string)=>{
          nota = res;
        });
        this.notificacion(nota, "fracaso-snackbar")
      }
    )
  }

  seleccion() {

    this.limpiarTextoEscogido()

    let seleccion = this.documento.getSelection();

    seleccion.getRangeAt(0).cloneContents().childNodes.forEach(
      item => {
        if (item.nodeName == "BR") {
          this.textoSeleccionadoHtml += "<br>";
          this.textoSeleccionado += " ";
        }
        else {
          this.textoSeleccionadoHtml += item.textContent;
          this.textoSeleccionado += item.textContent;
        }
      }
    )

    if (this.textoSeleccionado != "") {
      this._seleccionarTextoService.colocarTexto(this.textoSeleccionado)
      this._seleccionarTextoService.colocarTextoHtml(this.textoSeleccionadoHtml)
    }
  }

  anteriorParrafo() {
    if (this.parrafoIndice != 0) {
      this.parrafoIndice -= 1;
      this.parrafoTitulo = this.politica.parrafos[this.parrafoIndice].titulo;
      this.parrafoActual = this.politica.parrafos[this.parrafoIndice].texto_html;
      this.parrafoId = this.politica.parrafos[this.parrafoIndice].id;
      this._seleccionarTextoService.consultarTotalAnotacionesAnotadorParrafoServicio(this.parrafoId, this.usuarioAux.id)
      let elemento = this.documento.getElementById("texto");
      elemento.innerHTML = this.parrafoActual;
      this.limpiarTextoEscogido();
      this.parrafo_cambiado.emit()
    }

  }

  siguienteParrafo() {
    if (this.parrafoIndice != this.totalParrafos - 1) {
      this.parrafoIndice += 1;
      this.parrafoTitulo = this.politica.parrafos[this.parrafoIndice].titulo;
      this.parrafoActual = this.politica.parrafos[this.parrafoIndice].texto_html;
      this.parrafoId = this.politica.parrafos[this.parrafoIndice].id;
      this._seleccionarTextoService.consultarTotalAnotacionesAnotadorParrafoServicio(this.parrafoId, this.usuarioAux.id)
      let elemento = this.documento.getElementById("texto");
      elemento.innerHTML = this.parrafoActual;
      this.limpiarTextoEscogido();
      this.parrafo_cambiado.emit()
    } else {
      let nota = '';
        this.translate.stream("anotar.dialogo.confirmar").subscribe((res: string)=>{
          nota = res;
        });
      if (confirm(nota)) {
        this.politicaUsuarioFinalizada()
      }
    }
  }

  limpiarTextoEscogido() {
    this.textoSeleccionado = ""
    this.textoSeleccionadoHtml = ""
    this._seleccionarTextoService.colocarTexto("")
    this._seleccionarTextoService.colocarTextoHtml("")
  }

  emitirGuardarAnotaciones() {
    if (this.textoSeleccionado != "") {
      this.guardar_anotaciones.emit();
    } else {
      let nota = '';
        this.translate.stream("anotar.dialogo.seccion").subscribe((res: string)=>{
          nota = res;
        });
      this.notificacion(nota, "advertencia-snackbar")
    }
  }

  emitirParrafoId() {
    this.parrafo_id.emit(this.parrafoId);
  }

  notificacion(mensaje: string, estilo: string, duracion?: number) {
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      panelClass: [estilo],
      duration: duracion | 2000,
      verticalPosition: 'top'
    })
  }

  ngOnInit() {
    this.consultarParrafosPolitica(this.politicaId)
  }

}
