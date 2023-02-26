import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatSnackBar, MatDialogRef } from '@angular/material';
import { ValorGuardar, Valor, ValorEditar } from '../valor';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { ValorService } from '../valor.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-valor-dialogo',
  templateUrl: './valor-dialogo.component.html',
  styleUrls: ['./valor-dialogo.component.css']
})
export class ValorDialogoComponent implements OnInit {

  valor : Valor;
  nuevo : boolean;
  titulo : string;

  formulario : FormGroup;

  constructor(
    private _fb : FormBuilder,
    private _valorService : ValorService,
    private _notificacion : MatSnackBar,
    private _dialogoInterno : MatDialogRef<ValorDialogoComponent>,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) private data : any
    ) { 
      this.valor = data.valor
      this.nuevo = data.nuevo
      this. formulario = this.crearFormulario(this.valor)
      if (this.nuevo){
        this.translate.stream("valor.dialogo.titulo1").subscribe((res: string)=>{
          this.titulo = res;
       });
      }else{
        this.translate.stream("valor.dialogo.titulo2").subscribe((res: string)=>{
          this.titulo = res;
       });
      }
    }

    
  crearFormulario(valorAux : ValorGuardar) {
    return this._fb.group({
      descripcion: new FormControl(valorAux.descripcion, [Validators.required]),
    })
  }

  guardarValor(valorAux : ValorGuardar){
    this._valorService.crearValor(valorAux).subscribe(
      ()=> {
        let note = '';
        this.translate.stream("valor.dialogo.exito").subscribe((res: string)=>{
          note = res;
        });
        this.notificacion(note, "exito-snackbar")
        this._dialogoInterno.close()
      },
      () => {
        let note = '';
        this.translate.stream("valor.dialogo.error").subscribe((res: string)=>{
          note = res;
        });
        this.notificacion("ERROR creando valor!", "fracaso-snackbar")
      }
    )
  }

  editarValor(valorAux : ValorEditar){
    this._valorService.editarValor(valorAux).subscribe(
      ()=> {
        let note = '';
        this.translate.stream("valor.dialogo.exito_editar").subscribe((res: string)=>{
          note = res;
        });
        this.notificacion(note, "exito-snackbar")
        this._dialogoInterno.close()
      },
      () => {
        let note = '';
        this.translate.stream("valor.dialogo.error_editar").subscribe((res: string)=>{
          note = res;
        });
        this.notificacion(note, "fracaso-snackbar")
      }
    )
  }

  guardar(){
    if(this.formulario.valid){
      if(this.nuevo){
        let valorGuardar : ValorGuardar = {
          descripcion : this.formulario.value.descripcion,
          atributo_id : this.valor.atributo_id
        }
        this.guardarValor(valorGuardar)
      }else{
        let valorEditar : ValorEditar = {
          id: this.valor.id,
          descripcion : this.formulario.value.descripcion
        }
        this.editarValor(valorEditar)
      }
    
    }else{
      let note = '';
        this.translate.stream("valor.dialogo.error_form").subscribe((res: string)=>{
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
