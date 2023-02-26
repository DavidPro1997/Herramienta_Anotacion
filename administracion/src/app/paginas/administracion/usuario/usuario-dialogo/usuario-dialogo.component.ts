import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material';
import { UsuarioGuardar, RolUsuario, UsuarioEditar } from '../usuario';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import { UsuarioService } from '../usuario.service';
import { UsuarioAnotacion } from 'src/app/paginas/anotacion/anotacion';
import {TranslateService} from "@ngx-translate/core";



@Component({
  selector: 'app-usuario-dialogo',
  templateUrl: './usuario-dialogo.component.html',
  styleUrls: ['./usuario-dialogo.component.css']
})
export class UsuarioDialogoComponent{

  rolUsuario: RolUsuario;
  rolesUsuario: RolUsuario[] = 
  [
    {
      id : 1,
      descripcion: "Administrador"
    },
    {
      id: 2,
      descripcion: "Anotador"
    }
];

  nuevo: boolean;
  titulo: string;
  formulario: FormGroup;
  id : number;
  checkedAux = true;

  email= new FormControl('', [Validators.required]);
  rol_usuario = new FormControl(1, [Validators.required]);
  entrenamiento = new FormControl(true,[Validators.required]);

  usuarioAux: UsuarioGuardar;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private _notificacion : MatSnackBar,
    private _usuarioService : UsuarioService,
    private _dialogoInterno : MatDialogRef<UsuarioDialogoComponent>,
    private translate: TranslateService
  ) {
    this.usuarioAux = data.usuario
    this.nuevo = data.nuevo
    this.formulario = this.crearFormulario(this.usuarioAux)
    if (this.nuevo) {
      this.translate.stream("usuario.dialogo.titulo1").subscribe((res: string)=>{
        this.titulo = res;
      });   
    } else {
      this.id = this.data.usuario.id
      this.translate.stream("usuario.dialogo.titulo2").subscribe((res: string)=>{
        this.titulo = res;
      });
    }
  }

  crearFormulario(usuarioAux: UsuarioGuardar) {
    return this.fb.group({
      email: [usuarioAux.email,Validators.required],
      rol_usuario_id: [usuarioAux.rol_usuario_id,Validators.required],
      entrenamiento: [usuarioAux.entrenamiento,Validators.required],
      activo: [usuarioAux.activo, Validators.required]
    })
  }

  guardar(){
    if (this.formulario.valid) {
      if (this.nuevo){
        let usuarioNuevo : UsuarioGuardar = {
          email : this.formulario.value.email,
          rol_usuario_id : this.formulario.value.rol_usuario_id,
          entrenamiento : this.formulario.value.entrenamiento
        }
        this.guardarUsuario(usuarioNuevo)
        
      }else{
        let usuarioEditar : UsuarioEditar = {
          id: this.id,
          email : this.formulario.value.email,
          rol_usuario_id : this.formulario.value.rol_usuario_id,
          entrenamiento: this.formulario.value.entrenamiento,
          activo: this.formulario.value.activo
        }
        this.editarUsuario(usuarioEditar)
      }
    }else{
      let aux = '';
          this.translate.stream("usuario.dialogo.error").subscribe((res: string)=>{
            aux = res;
          });
      this.notificacion(aux, 'fracaso-snackbar', 4000)
    }
  }

  guardarUsuario(usuarioAux : UsuarioGuardar){
    this._usuarioService.crearUsuario(usuarioAux).subscribe(
      respuesta => {
        this.notificacion(respuesta.mensaje, 'exito-snackbar')
        this._dialogoInterno.close()
      },
      error => {
        this.notificacion(error.error.mensaje? error.error.mensaje : "Error", 'fracaso-snackbar')
      }
    )
  }

  editarUsuario(usuarioAux: UsuarioEditar){
    this._usuarioService.editarUsuario(usuarioAux).subscribe(
      respuesta =>{
        this.notificacion(respuesta.mensaje, 'exito-snackbar')
        this._dialogoInterno.close()
      } ,
      error =>  {
        this.notificacion(error.error.mensaje? error.error.mensaje : "Error", 'fracaso-snackbar')
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
