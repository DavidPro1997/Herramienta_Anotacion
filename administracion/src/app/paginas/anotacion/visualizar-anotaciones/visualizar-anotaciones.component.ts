import { Component, OnInit, Inject } from '@angular/core';
import { UsuarioAnotacion } from '../anotacion';
import { AnotacionService } from '../anotacion.service';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialog } from '@angular/material';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import { ComentarioAnotacionComponent } from '../comentario-anotacion/comentario-anotacion.component';
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-visualizar-anotaciones',
  templateUrl: './visualizar-anotaciones.component.html',
  styleUrls: ['./visualizar-anotaciones.component.css']
})
export class VisualizarAnotacionesComponent implements OnInit {

  usuarioId : number;
  parrafoId : number;
  consolidacion : boolean;

  anotaciones : UsuarioAnotacion[];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data : any,
    private _anotacionService : AnotacionService,
    private _notificacion : MatSnackBar,
    private _dialogo : MatDialog,
    private translate: TranslateService
  ) { 
    this.usuarioId = this.data.usuarioId
    this.parrafoId = this.data.parrafoId
    this.consolidacion = this.data.consolidacion
  }

  consultarAnotaciones(){
    this._anotacionService.obtenerAnotacionesUsuarioParrafo(this.parrafoId, this.usuarioId, this.consolidacion).subscribe(
      resultado => {
        this.anotaciones = resultado
      },
      error => this.anotaciones = []
    )
  }

  eliminarAnotacion(anotacionAux : UsuarioAnotacion){
    let mensaje = '';
    let nota = '';
    this.translate.stream("anotar.dialogo.confirmar_eliminar").subscribe((res: string)=>{
      mensaje = res;
    });
    if(confirm(mensaje)){
      this._anotacionService.eliminarAnotacion(anotacionAux.id).subscribe(
        ()=> {
          this.translate.stream("anotar.dialogo.exito_eliminar").subscribe((res: string)=>{
            nota = res;
          });
          this.notificacion(nota, "exito-snackbar")
          this.consultarAnotaciones()
        },
        () => {
          this.translate.stream("anotar.dialogo.error_eliminar").subscribe((res: string)=>{
            nota = res;
          });
          this.notificacion(nota, "fracaso-snackbar")
        }
      )
    }
  }

  editarAnotacion(anotacionAux : UsuarioAnotacion){
    this._dialogo.open(ComentarioAnotacionComponent, {
      width: '45%',
      height: 'fit-content',
      maxHeight: '80%' ,
      data:{
        anotacionAux: anotacionAux,
      }
    })
  }

  notificacion(mensaje : string, estilo : string){
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      panelClass: [estilo],
      duration: 2000,
      verticalPosition: 'top'
    })
  }

  ngOnInit() {
    this.consultarAnotaciones()
  }

}
