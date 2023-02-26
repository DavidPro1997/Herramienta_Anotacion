import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TratamientoConsultar, TratamientoGuardar, TratamientoEditar } from '../tratamiento';
import { PaletaColoresComponent } from './paleta-colores/paleta-colores.component';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { TratamientoService } from '../tratamiento.service';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import { MatSnackBar } from '@angular/material';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-tratamiento-dialogo',
  templateUrl: './tratamiento-dialogo.component.html',
  styleUrls: ['./tratamiento-dialogo.component.css']
})
export class TratamientoDialogoComponent {

  nuevo: boolean;
  titulo: string;
  formulario: FormGroup;

  tratamientoAux: TratamientoConsultar = {
    id: null,
    descripcion: null,
    color_id: 0,
    color_primario_codigo: ''
  }

  constructor(
    private fb: FormBuilder,
    private openDialog: MatDialog,
    private _dialogoInterno: MatDialogRef<TratamientoDialogoComponent>,
    private _tratamientoService : TratamientoService,
    private _notificacion : MatSnackBar,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any) 
    {
    this.tratamientoAux = data.tratamientoAux
    this.formulario = this.crearFormulario(this.tratamientoAux);
    this.nuevo = data.nuevo;
    if (this.nuevo) {
      this.translate.stream("tratamiento.dialogo.titulo1").subscribe((res: string)=>{
        this.titulo = res;
      });
    } else {
      this.translate.stream("tratamiento.dialogo.titulo2").subscribe((res: string)=>{
        this.titulo = res;
      });
    }

  }

  crearFormulario(tratamientoAux: TratamientoConsultar) {
    return new FormGroup({
      descripcion: new FormControl(tratamientoAux.descripcion, [Validators.required]),
      color_primario_string: new FormControl(tratamientoAux.color_primario_codigo, [Validators.required]),
      color_primario: new FormControl(tratamientoAux.color_id, [Validators.required])
    })
  }

  guardarTratamiento(tratamientoAux : TratamientoGuardar){
    if (this.formulario.valid){
      return this._tratamientoService.crearTratamiento(tratamientoAux).subscribe(
        () =>{
          let mensaje = '';
          this.translate.stream("tratamiento.dialogo.dialogo.exito").subscribe((res: string)=>{
            mensaje = res;
          });
          this.notificacion(mensaje, "exito-snackbar")
          this._dialogoInterno.close()
        }, 
        () => {
          let mensaje = '';
          this.translate.stream("tratamiento.dialogo.dialogo.error").subscribe((res: string)=>{
            mensaje = res;
          });
          this.notificacion(mensaje, "fracaso-snackbar") 
        }
      )
    }else{
      let mensaje = '';
          this.translate.stream("tratamiento.dialogo.dialogo.error_form").subscribe((res: string)=>{
            mensaje = res;
          });
      alert(mensaje)
    }
    
  }

  editarTratamiento(tratamientoAux : TratamientoEditar){
    return this._tratamientoService.editarTratamiento(tratamientoAux).subscribe(
      () =>{
        let mensaje = '';
          this.translate.stream("tratamiento.dialogo.dialogo.exito_editar").subscribe((res: string)=>{
            mensaje = res;
          });
        this.notificacion(mensaje, "exito-snackbar")
        this._dialogoInterno.close()
      }, 
      () => {
        let mensaje = '';
          this.translate.stream("tratamiento.dialogo.dialogo.error_editar").subscribe((res: string)=>{
            mensaje = res;
          });
        this.notificacion(mensaje, "fracaso-snackbar") 
      }
    )
  }

  resetFormulario() {
    this.formulario.reset()
  }

  onNoClick(): void {
    this._dialogoInterno.close();
  }

  estiloAnotacion(colorAux): Object {
    return {
      'color': colorAux,
      'font-weight': 'bold'
    }
  }

  colorPicker(colorOriginal: string) {
    const dialogoEditarColor = new MatDialogConfig();

    dialogoEditarColor.autoFocus = true;
    dialogoEditarColor.width = '30%';
    dialogoEditarColor.height = 'fit-content',
      dialogoEditarColor.data = { color_primario: colorOriginal };

    const dialagoEditarColorAbierto = this.openDialog.open(PaletaColoresComponent, dialogoEditarColor);

    dialagoEditarColorAbierto.afterClosed().subscribe(
      result => {
        this.formulario = this.fb.group({
          descripcion: [this.formulario.value.descripcion],
          color_primario_string: [result.color_primario],
          color_primario: [result.id],
        })
      });
  }

  guardar() {
    if (this.formulario.valid) {
      if (this.nuevo) {
        let tratamiento : TratamientoGuardar= {
          descripcion: this.formulario.value.descripcion,
          color_primario: this.formulario.value.color_primario
        }
        this.guardarTratamiento(tratamiento)
      } else {
        let tratamiento : TratamientoEditar= {
          id : this.tratamientoAux.id,
          descripcion: this.formulario.value.descripcion,
          color_primario: this.formulario.value.color_primario
        }
        this.editarTratamiento(tratamiento)
       
      }

    }else{
      let mensaje = '';
          this.translate.stream("tratamiento.dialogo.dialogo.error_form").subscribe((res: string)=>{
            mensaje = res;
          });
      alert(mensaje)
    }
  }

  notificacion(mensaje : string, estilo : string){
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      panelClass: [estilo],
      duration: 2000,
      verticalPosition: 'top'
    })
  }

}
