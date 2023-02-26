import { Component, OnInit, Inject } from '@angular/core';
import { UsuarioAsignar } from '../../../usuario/usuario';
import { SelectionModel } from '@angular/cdk/collections';
import { UsuarioService } from '../../../usuario/usuario.service';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material';
import { PoliticaConsultar } from '../gestion';
import { PoliticaService } from '../gestion.service';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import { error } from 'protractor';
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-asignar-politica',
  templateUrl: './asignar-politica.component.html',
  styleUrls: ['./asignar-politica.component.css']
})
export class AsignarPoliticaComponent implements OnInit {

  anotadores : UsuarioAsignar[] = [];
  administradores : UsuarioAsignar[] = [];

  politicaAux : PoliticaConsultar;

  administradorEscogido : UsuarioAsignar;

  constructor(
    private _usuarioService : UsuarioService,
    private _politicaService : PoliticaService,
    private _notificacion : MatSnackBar,
    private _dialogoInterno : MatDialogRef<AsignarPoliticaComponent>,
    @Inject(MAT_DIALOG_DATA) private data : any,
    private translate: TranslateService
  ) {
    this.consultarAnotadores()
    this.consultarAdministradores()
    this.politicaAux = data.politica
   }

  anotadoresSeleccionados = new SelectionModel<UsuarioAsignar>(true /* multiple */);

  seleccionarUsuario(usuarioAux: UsuarioAsignar): void {
    this.anotadoresSeleccionados.toggle(usuarioAux);
    this.anotadoresSeleccionados.isSelected(usuarioAux)
  }

  consultarAnotadores(){
    this._usuarioService.obtenerAnotadoresActivos().subscribe(
      resultado => this.anotadores = resultado,
      error => console.log(error)
    )
  }

  consultarAdministradores(){
    this._usuarioService.obtenerAdministradoresActivos().subscribe(
      resultado => this.administradores = resultado,
      error => console.log(error)
    )
  }

  asignarPoliticaAnotador(politicaId : number, usuarioAux : UsuarioAsignar){
    let politicaUsuario ={
      politica_id : politicaId,
      usuario_id : usuarioAux.id,
      consolidar: false
    }

    this._politicaService.asignarPoliticaUsuario(politicaUsuario).subscribe(
      () => {
        let mensaje = '';
        this.translate.stream("politica.gestion.asignar.exito_anotador",{anotador:usuarioAux.email}).subscribe((res: string)=>{
          mensaje = res;
        });
        this.notificacion(mensaje,'exito-snackbar');

      },
      error => {
        let mensaje = '';
        this.translate.stream("politica.gestion.asignar.error_asignado",{asignado:usuarioAux.email}).subscribe((res: string)=>{
          mensaje = res;
        });
        this.notificacion(mensaje,'fracaso-snackbar')
      }
    )
  }

  asignarPoliticaAdministrador(politicaId : number, usuarioAux : UsuarioAsignar){
    let politicaUsuario ={
      politica_id : politicaId,
      usuario_id : usuarioAux.id,
      consolidar: true
    }

    this._politicaService.asignarPoliticaUsuario(politicaUsuario).subscribe(
      () => {
        let mensaje = '';
        this.translate.stream("politica.gestion.asignar.exito_administrador",{admin:usuarioAux.email}).subscribe((res: string)=>{
          mensaje = res;
        });
        this.notificacion(mensaje,'exito-snackbar')
        this._dialogoInterno.close()
      },
      error => {
        let mensaje = '';
        this.translate.stream("politica.gestion.asignar.error_asignado",{asignado:usuarioAux.email}).subscribe((res: string)=>{
          mensaje = res;
        });
        this.notificacion(mensaje,'fracaso-snackbar')
      }
    )
  }

  editarPoliticaAsignada(politicaId : number){
    this._politicaService.editarPoliticaAsignada(politicaId).subscribe(
      () => {
        let mensaje = '';
        this.translate.stream("politica.gestion.asignar.exito").subscribe((res: string)=>{
          mensaje = res;
        });
        this.notificacion(mensaje,'exito-snackbar')
      },
      error => {
        let mensaje = '';
        this.translate.stream("politica.gestion.asignar.error").subscribe((res: string)=>{
          mensaje = res;
        });
        this.notificacion(mensaje,'fracaso-snackbar')
      }
    )
  }

  guardar(){
    if (this.anotadoresSeleccionados.selected.length >= 2){
      if(this.administradorEscogido != null){
        let mensaje = '';
        this.translate.stream("politica.gestion.asignar.confirmar").subscribe((res: string)=>{
          mensaje = res;
        });
          if (confirm(mensaje)) {
            this.anotadoresSeleccionados.selected.forEach(
              anotador => {
                this.asignarPoliticaAnotador(this.politicaAux.id, anotador)
              }
            )
    
            this.asignarPoliticaAdministrador(this.politicaAux.id, this.administradorEscogido)
    
            this.editarPoliticaAsignada(this.politicaAux.id)
            
          } 

        
      }else{
        let mensaje = '';
        this.translate.stream("politica.gestion.asignar.error_consolidador").subscribe((res: string)=>{
          mensaje = res;
        });
        alert(mensaje)
      }
    }else{
      let mensaje = '';
        this.translate.stream("politica.gestion.asignar.error_anotador").subscribe((res: string)=>{
          mensaje = res;
        });
      alert(mensaje)
    }
   
  }

  notificacion(mensaje : string, estilo : string){
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      verticalPosition: 'top',
      panelClass: [estilo],
      duration: 2000})
  }
  ngOnInit() {
  }

}
