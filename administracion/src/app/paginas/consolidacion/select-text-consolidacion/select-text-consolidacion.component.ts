import { Component, OnInit, Inject, Output, EventEmitter, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PoliticaService } from '../../administracion/politica/gestion/gestion.service';
import { PoliticaVisualizar } from '../../administracion/politica/gestion/gestion';
import { UsuarioAnotacionService } from '../usuario-anotacion/usuario-anotacion.service';
import { SelectTextConsolidacionService } from './select-text-consolidacion.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { VisualizarAnotacionesComponent } from '../../anotacion/visualizar-anotaciones/visualizar-anotaciones.component';
import { Router } from '@angular/router';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import {TranslateService} from "@ngx-translate/core";
import { not } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-select-text-consolidacion',
  templateUrl: './select-text-consolidacion.component.html',
  styleUrls: ['./select-text-consolidacion.component.css']
})
export class SelectTextConsolidacionComponent implements OnInit {

  @Input() politicaId  : number;
  @Output() guardar_anotacion = new EventEmitter<null>();
  @Output() parrafo_cambiado = new EventEmitter<boolean>();

  politica : PoliticaVisualizar = null;
  parrafoId : number = 0;
  parrafoIndice : number = 0;
  totalParrafos : number = 0;
  parrafoTitulo : string = "";
  parrafoActual : string = "";
  totalAnotacionesParrafo : number = 0;
  textoSelecccionadoHtmlAux : string = "";
  textoSeleccionadoAux : string = "";

  usuario = JSON.parse(localStorage.getItem("usuario"));

  constructor(
    @Inject(DOCUMENT) private documento: Document,
    private _politicaService : PoliticaService,
    private _usuarioAnotacionService : UsuarioAnotacionService,
    private _seleccionarTextoConsolidacionService : SelectTextConsolidacionService,
    private _dialogo : MatDialog,
    private _notificacion: MatSnackBar,
    private _router: Router,
    private translate: TranslateService
    ) {}

  visualizarAnotaciones(){
    const dialogoAnotaciones = this._dialogo.open(VisualizarAnotacionesComponent,{
      width: '50%',
      height: 'fit-content',
      maxHeight: '70%',
      data:{
        parrafoId: this.parrafoId,
        usuarioId: this.usuario.id,
        consolidacion : true
      }
    })

    dialogoAnotaciones.afterClosed().subscribe(
      () => this.consultarTotalAnotacionesParrafo()
    )
  }

  consultarParrafosPolitica(){
    this._politicaService.consultarParrafosPoliticaAnotar(this.politicaId).subscribe(
      resultado => {
        this.politica = resultado;
        this.totalParrafos = this.politica.parrafos.length;
        this.parrafoId = this.politica.parrafos[this.parrafoIndice].id;
        this.parrafoTitulo = this.politica.parrafos[this.parrafoIndice].titulo;
        this.parrafoActual = this.politica.parrafos[this.parrafoIndice].texto_html;
        this._seleccionarTextoConsolidacionService.colocarParrafoId(this.parrafoId);
        this.consultarTotalAnotacionesParrafo()
        this.consultarAnotacionesAnotadoresParrafo()
        let elemento = this.documento.getElementById("texto");
        elemento.innerHTML = this.parrafoActual;
      },
      error => console.log(error)
    )
  }

  consultarAnotacionesAnotadoresParrafo(){
    this._usuarioAnotacionService.consultarAnotacionesParrafo(this.politicaId, this.parrafoIndice)
  }

  consultarTotalAnotacionesParrafo(){
    this._seleccionarTextoConsolidacionService.consultarTotalAnotacionesConsolidadorParrafo(this.parrafoId, this.usuario.id).subscribe(
      totalAnotaciones => this.totalAnotacionesParrafo = totalAnotaciones
    )
  }

  seleccion() {
    this.textoSelecccionadoHtmlAux = "";
    this.textoSeleccionadoAux = "";
    let seleccion = this.documento.getSelection();

    //obtenemos el texto puro y en html 
    seleccion.getRangeAt(0).cloneContents().childNodes.forEach(
      item => {
        if (item.nodeName == "BR") {
          this.textoSelecccionadoHtmlAux += "<br>";
          this.textoSeleccionadoAux += " ";
        }
        else {
          this.textoSelecccionadoHtmlAux += item.textContent;
          this.textoSeleccionadoAux += item.textContent;
        }
      }
    )
  }

  anteriorParrafo() {
    if (this.parrafoIndice !=0){
      this.parrafoIndice -= 1;
      this.parrafoId = this.politica.parrafos[this.parrafoIndice].id;
      this.parrafoTitulo = this.politica.parrafos[this.parrafoIndice].titulo;
      this.parrafoActual = this.politica.parrafos[this.parrafoIndice].texto_html;
      this._seleccionarTextoConsolidacionService.colocarParrafoId(this.politica.parrafos[this.parrafoIndice].id);
      this.consultarAnotacionesAnotadoresParrafo()
      this.consultarTotalAnotacionesParrafo();
      let elemento = this.documento.getElementById("texto");
      elemento.innerHTML = this.parrafoActual;
      this.parrafo_cambiado.emit()
    }
  }

  siguienteParrafo(){
    if (this.parrafoIndice != this.totalParrafos-1){
      this.parrafoIndice += 1;
      this.parrafoId = this.politica.parrafos[this.parrafoIndice].id;
      this.parrafoTitulo = this.politica.parrafos[this.parrafoIndice].titulo;
      this.parrafoActual = this.politica.parrafos[this.parrafoIndice].texto_html;
      this._seleccionarTextoConsolidacionService.colocarParrafoId(this.politica.parrafos[this.parrafoIndice].id);
      this.consultarAnotacionesAnotadoresParrafo();
      this.consultarTotalAnotacionesParrafo()
      let elemento = this.documento.getElementById("texto");
      elemento.innerHTML = this.parrafoActual;
      this.parrafo_cambiado.emit()
    }else{
      let mensaje = '';
      this.translate.stream("consolidar.dialogo.confirmar").subscribe((res: string)=>{
        mensaje = res;
      });
      if (confirm(mensaje)) {
        this.politicaUsuarioFinalizada()
      }
    }
  }

  politicaUsuarioFinalizada() {
    let nota = '';
    this._politicaService.editarPoliticaAnotadorFinalizada(this.politicaId, this.usuario.id, true).subscribe(
      () => {
        this.translate.stream("consolidar.dialogo.exito").subscribe((res: string)=>{
          nota = res;
        });
        this.notificacion(nota, "exito-snackbar")
        this._router.navigate(['/paginas/consolidacion'])
      },
      () => {
        this.translate.stream("consolidar.dialogo.error").subscribe((res: string)=>{
          nota = res;
        });
        this.notificacion(nota, "fracaso-snackbar")
      }
    )
  }

  guardarAnotacion(){
    if(this.textoSeleccionadoAux != ""){
      this._seleccionarTextoConsolidacionService.colocarTextoHtml(this.textoSelecccionadoHtmlAux);
      this._seleccionarTextoConsolidacionService.colocarTexto(this.textoSeleccionadoAux);
      this.guardar_anotacion.emit()
      this.limpiarTextoEscogido()
    }else{
      let nota = '';
      this.translate.stream("consolidar.dialogo.texto").subscribe((res: string)=>{
        nota = res;
      });
      alert(nota);
    }
    
  }

  limpiarTextoEscogido(){
    this.textoSelecccionadoHtmlAux = "";
    this.textoSeleccionadoAux = "";
  }

  notificacion(mensaje: string, estilo: string) {
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      panelClass: [estilo],
      duration: 2000,
      verticalPosition: 'top'
    })
  }
  
  ngOnInit() {
    this.consultarParrafosPolitica()
  }
}
