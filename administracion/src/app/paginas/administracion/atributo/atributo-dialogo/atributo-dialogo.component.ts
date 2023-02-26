import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material';
import { Atributo, AtributoGuardar, AtributoEditar } from '../atributo';
import { AtributoService } from '../atributo.service';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import {TranslateService} from "@ngx-translate/core";
import { not } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-atributo-dialogo',
  templateUrl: './atributo-dialogo.component.html',
  styleUrls: ['./atributo-dialogo.component.css']
})
export class AtributoDialogoComponent implements OnInit {

  atributoAux : Atributo;
  formulario: FormGroup;
  nuevo:boolean;
  titulo:string;

  constructor(
    private fb: FormBuilder,
    private _atributoService : AtributoService,
    private _notificacion : MatSnackBar,
    private _dialogoInterno : MatDialogRef<AtributoDialogoComponent>,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.atributoAux = data.atributo
    this.formulario = this.crearFormulario(this.atributoAux);
    this.nuevo = data.nuevo;
    if (this.nuevo) {
        this.translate.stream("atributo.dialogo.titulo1").subscribe((res: string)=>{
          this.titulo = res;
        });
    } else {
      this.translate.stream("atributo.dialogo.titulo2").subscribe((res: string)=>{
        this.titulo = res;
      });
    }
  }

  crearFormulario(atributoAux : Atributo) {
    return this.fb.group({
      descripcion: new FormControl(atributoAux.descripcion, [Validators.required]),
    })
  }

  guardarAtributo(atributoAux : AtributoGuardar){
    return this._atributoService.crearAtributo(atributoAux).subscribe(
      ()=>  {
        let note = '';
        this.translate.stream("atributo.dialogo.exito").subscribe((res: string)=>{
          note = res;
        });
        this.notificacion(note, "exito-snackbar")
        this._dialogoInterno.close()
      },
      () => {
        let note = '';
        this.translate.stream("atributo.dialogo.error").subscribe((res: string)=>{
          note = res;
        });
        this.notificacion(note, "fracaso-snackbar")}
    )
  }

  editarAtributo(atributoAux : AtributoEditar){
    return this._atributoService.editarAtributo(atributoAux).subscribe(
      ()=>  {
        let note = '';
        this.translate.stream("atributo.dialogo.exito_editar").subscribe((res: string)=>{
          note = res;
        });
        this.notificacion(note, "exito-snackbar")
        this._dialogoInterno.close()
      },
      () => {
        let note = '';
        this.translate.stream("atributo.dialogo.error_editar").subscribe((res: string)=>{
          note = res;
        });
        this.notificacion(note, "fracaso-snackbar")}
    )
  }

  guardar(){
    if(this.formulario.valid){
      if(this.nuevo){
        let atributoNuevo : AtributoGuardar= {
          tratamiento_id : this.atributoAux.tratamiento_id,
          descripcion : this.formulario.value.descripcion
        }
        this.guardarAtributo(atributoNuevo)
      }else{
        let atributoEditar : AtributoEditar= {
          id : this.atributoAux.id,
          descripcion : this.formulario.value.descripcion
        }
        this.editarAtributo(atributoEditar)
      }
    }else{
      let note = '';
        this.translate.stream("atributo.dialogo.error_form").subscribe((res: string)=>{
          note = res;
        });
      alert(note)
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

  ngOnInit() {
  }
}
