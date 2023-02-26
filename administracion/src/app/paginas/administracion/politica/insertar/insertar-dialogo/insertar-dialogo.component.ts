import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar } from "@angular/material";
import { PoliticaGuardar } from "../insertar";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import * as moment from "moment";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import { DOCUMENT } from "@angular/common"
import { PoliticaService } from "../insertar.service"
import { NotificacionComponent } from "src/app/notificacion/notificacion.component";
import { ConfirmacionDialogoComponent } from "../confirmacion-dialogo/confirmacion-dialogo.component"
import { InformacionComponent} from "../informacion/informacion.component"
import {TranslateService} from "@ngx-translate/core";



export const MY_FORMATS = {
  parse: {
    dateInput: "LL",
  },
  display: {
    dateInput: "YYYY-MM-DD",
    monthYearLabel: "YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "YYYY",
  },
};

@Component({
  selector: 'app-insertar-dialogo',
  templateUrl: './insertar-dialogo.component.html',
  styleUrls: ['./insertar-dialogo.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})

export class InsertarDialogoComponent implements OnInit{

  politicaTexto = '';  
  date = new Date().toISOString();
  archivoEscogido: boolean = false;
  id: number;
  aux: boolean = false;
  politicaAux: PoliticaGuardar = {
    nombre: "",
    url: "",
    fecha: this.date,
    texto: "",
  }
  mensajes: string[] = ['0','1','o']
  fechaMomento;
  //variables del formulario
  formulario: FormGroup;
  nombre = new FormControl("", [Validators.required]);
  url = new FormControl("", [Validators.required]);
  fecha = new FormControl("", [Validators.required]);
  contenido = new FormControl("", [Validators.required]);

  constructor(
    private _dialogoInterno: MatDialogRef<InsertarDialogoComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    @Inject(DOCUMENT) private documento: Document,
    private _notificacion : MatSnackBar,
    private _fb : FormBuilder,
    private _politicaService : PoliticaService,
    public dialogo: MatDialog,
    private translate: TranslateService

  ) { 
    this.fechaMomento = moment(this.politicaAux.fecha, "YYYY/MM/DD");
    _dialogoInterno.disableClose = true;
    this.politicaAux.url = data.url;
    this.politicaAux.texto = data.texto;
    this.politicaTexto = data.texto;
  }

  crearFormulario(politica: PoliticaGuardar) {
    return new FormGroup({
      nombre: new FormControl(politica.nombre, [Validators.required]),
      url: new FormControl(politica.url, [Validators.required]),
      fecha: new FormControl(this.fechaMomento, [Validators.required]),
    })
  }

  resetFormulario() {
    this.formulario.reset();
  }

  errorNombre() {
    let error
    this.translate.stream("politica.gestion.dialogo.error_nombre").subscribe((res: string)=>{
      error = res
    });
    return this.nombre.hasError("required") ? error : "";
  }

  errorUrl() {
    let error
    this.translate.stream("politica.gestion.dialogo.error_url").subscribe((res: string)=>{
      error = res
    });
    return this.nombre.hasError("required") ? error : "";
  }

  errorFecha() {
    let error
    this.translate.stream("politica.gestion.dialogo.error_fecha").subscribe((res: string)=>{
      error = res
    });
    return this.nombre.hasError("required") ? error : "";
  }

  errorContenido() {
    let error
    this.translate.stream("politica.insertar.dialogo.error_contenido").subscribe((res: string)=>{
      error = res
    });
    return this.contenido.hasError("required") ? error : "";
  }

  onNoClick(): void {
    this._dialogoInterno.close();
  }

  ngOnInit() {
    this.formulario = this.crearFormulario(this.politicaAux);
    let texto = this.documento.getElementById("politicaTexto") as HTMLTextAreaElement;
    texto.innerHTML = this.politicaTexto;
  }

  guardarPolitica(){
    let texto = this.documento.getElementById("politicaTexto") as HTMLTextAreaElement;
    if (this.formulario.valid && texto.value != "") {
      let datosPolitica ={
        nombre: this.formulario.value.nombre,
        fecha: this.formulario.value.fecha.toISOString(),
        url: this.formulario.value.url,
        texto: texto.value
      }
      this.formulario = this._fb.group({
        guardar: true
      })
      //this.mostrarConfirmacion(4);
      this._politicaService.guardarPolitica2(datosPolitica).subscribe(
        resultado => {
          let nota
          this.translate.stream("politica.insertar.dialogo.exito").subscribe((res: string)=>{
            nota = res
          });
          this.notificacion(nota,'exito-snackbar')
          this._dialogoInterno.close(1)
          console.log(resultado.mensaje)
        },
        error => {
          let nota
          this.translate.stream("politica.gestion.previsualizacion.error").subscribe((res: string)=>{
            nota = res
          });
          this.notificacion(nota,'fracaso-snackbar')
          console.log(error)
        }
      
      )
        
    }
    else {
      this.aux= true
      let nota
          this.translate.stream("politica.gestion.dialogo.error_formulario").subscribe((res: string)=>{
            nota = res
          });
      alert(nota)
    }    
  }

  notificacion(mensaje : string, estilo : string){
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      panelClass: [estilo],
      duration: 3000,
      verticalPosition: 'top'
    })
  }

  mostrarConfirmacion(id: number) {
    const confirmar = this.dialogo.open(ConfirmacionDialogoComponent, {
      data: {
        mensaje: id,
      }
    });
    confirmar.afterClosed().subscribe((
      confirmado: Boolean) => {
        if (confirmado) {
          if(id == 0){
            this.onNoClick()
          }
          if(id == 1){
            this.guardarPolitica();
          }
          if(id == 2){
            this._dialogoInterno.close(1);
          }
        } 
      });
    }

    mostrarAyuda(tipo: boolean) {
      const ayuda = this.dialogo.open(InformacionComponent,{
        data: tipo,
        
      });
      ayuda.afterClosed().subscribe(res=>{console.log(res)});
    }
  
  }