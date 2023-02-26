import { Component, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators, FormBuilder } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBarConfig, MatSnackBar } from "@angular/material";
import { PoliticaGuardar, RespuestaPoliticaVisualizar, PoliticaConsultar } from "../gestion";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import * as moment from "moment";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material";
import { DOCUMENT } from "@angular/common"
import { PoliticaService } from "../gestion.service"
import { PrevisualizacionComponent } from "../previsualizacion/previsualizacion.component"
import { NotificacionComponent } from "src/app/notificacion/notificacion.component";
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
  selector: "app-politica-dialogo",
  templateUrl: "./politica-dialogo.component.html",
  styleUrls: ["./politica-dialogo.component.css"],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})
export class PoliticaDialogoComponent {

  date = new Date().toISOString();
  nombreArchivo = "";
  archivoPolitica: File = null;

  //despliega el boton de guardar
  archivoEscogido: boolean = false;

  id: number;
  politicaAux: PoliticaGuardar = {
    nombre: "",
    url: "",
    fecha: this.date
  }

  fechaMomento;

  //variables del dialogo
  nuevo: boolean;
  titulo: string;

  //variables del formulario
  formulario: FormGroup;
  nombre = new FormControl("", [Validators.required]);
  url = new FormControl("", [Validators.required]);
  fecha = new FormControl("", [Validators.required]);

  constructor(
    private _dialogoInterno: MatDialogRef<PoliticaDialogoComponent>,
    private _dialogo: MatDialog,
    @Inject(MAT_DIALOG_DATA) private data: any,
    @Inject(DOCUMENT) private documento: Document,
    private _politicaService: PoliticaService,
    private fb: FormBuilder,
    private _notificacion : MatSnackBar,
    private translate: TranslateService
  ) {
    this.politicaAux = data.politica  
    this.nuevo = data.nuevo
    this.fechaMomento = moment(this.politicaAux.fecha, "YYYY/MM/DD");
    this.formulario = this.crearFormulario(this.politicaAux);
    
    if (this.nuevo) {
      this.translate.stream("politica.gestion.dialogo.titulo1").subscribe((res: string)=>{
        this.titulo = res;
      }); 
    } else {
      this.id = this.data.politica.id
      this.translate.stream("politica.gestion.dialogo.titulo2").subscribe((res: string)=>{
        this.titulo = res;
      });
    }
  }

  crearFormulario(politica: PoliticaGuardar) {
    return new FormGroup({
      nombre: new FormControl(politica.nombre, [Validators.required]),
      url: new FormControl(politica.url, [Validators.required]),
      fecha: new FormControl(this.fechaMomento, [Validators.required])
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

  onNoClick(): void {
    this._dialogoInterno.close();
  }

  guardarEditar() {
    if (this.formulario.valid) {
      let politicaEditar: PoliticaConsultar = {
        id: this.id,
        nombre: this.formulario.value.nombre,
        url: this.formulario.value.url,
        fecha: this.formulario.value.fecha.toISOString() 
      }
      console.log(politicaEditar)
      this._politicaService.editarPolitica(politicaEditar).subscribe(
        () => {
          let mensaje = '';
          this.translate.stream("politica.gestion.dialogo.exito_editar").subscribe((res: string)=>{
            mensaje = res;
          });
          this.notificacion(mensaje,"exito-snackbar")
          this._dialogoInterno.close()
        },
        error => {
          this.notificacion(error.error.mensaje? error.error.mensaje : "Error", "fracaso-snackbar")
        }
      )
    } else {
      this.translate.stream("politica.gestion.dialogo.error_formulario").subscribe((res: string)=>{
        alert(res)

      });
    }
  }

  escogerArchivo(archivo: FileList) {
    this.archivoPolitica = archivo.item(0);
    this.nombreArchivo = this.archivoPolitica.name;
    this.archivoEscogido = true;
  }

  subirArchivo() {
    this.archivoPolitica = null;
    let archivo = this.documento.getElementById("archivo");
    archivo.click()
  }

  previsualizarPolitica() {
    if (this.formulario.valid) {
      let politicaPrevisualizar ={
        nombre: this.formulario.value.nombre,
        fecha: this.formulario.value.fecha.toISOString(),
        url: this.formulario.value.url
      }

      this._politicaService.previsualizacionPolitica(politicaPrevisualizar, this.archivoPolitica)
        .subscribe(
          resultado => {
            this.dialogoPrevisualizar(resultado, politicaPrevisualizar, this.archivoPolitica)
          },
          error => {
            console.log(error)
            this.notificacion(error.error.mensaje? error.error.mensaje : "Error", "fracaso-snackbar")
          }
        )
    } else {
      this.translate.stream("politica.gestion.dialogo.error_formulario").subscribe((res: string)=>{
        alert(res)
      });
    }
  }

  dialogoPrevisualizar(politicaRespuesta: RespuestaPoliticaVisualizar, politicaGuardarAux: PoliticaGuardar, archivoAux : File) {
    const NuevaPoliticaVisualizar = this._dialogo.open(PrevisualizacionComponent, {
      width: "60%",
      height: "fit-content",
      maxHeight: "80%",
      data: {
        politicaVisualizar: politicaRespuesta,
        politicaGuardar: politicaGuardarAux,
        archivo : archivoAux
      }
    });

    NuevaPoliticaVisualizar.afterClosed().subscribe(
      result => {
        if (result.guardar) {
          this._dialogoInterno.close()
        }
      }
    )
  }


  notificacion(mensaje : string, estilo : string, action?:string){
    let configSuccess: MatSnackBarConfig = {
      panelClass: [estilo],
      duration: 5000,
    };

    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      ...configSuccess
      })
  }
}
