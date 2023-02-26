import { Component, Input } from '@angular/core';
import { AnotacionResultado, UsuarioAnotacion, AnotacionValor, Anotacion } from 'src/app/paginas/anotacion/anotacion'
import { AnotacionService } from '../../anotacion/anotacion.service';
import { UsuarioAnotacionService } from './usuario-anotacion.service';
import { SelectTextConsolidacionService } from '../select-text-consolidacion/select-text-consolidacion.service';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import { MatSnackBar } from '@angular/material';
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-usuario-anotacion',
  templateUrl: './usuario-anotacion.component.html',
  styleUrls: ['./usuario-anotacion.component.css']
})
export class UsuarioAnotacionComponent{

  @Input() politicaId :number;
  @Input() secuencia : number;

  anotaciones: AnotacionResultado = new AnotacionResultado(null, null);
  usuario = JSON.parse(localStorage.getItem("usuario"));
  parrafoId : number = 0;

  constructor(
    private _usuarioAnotacionService: UsuarioAnotacionService,
    private _seleccionarTextoConsolidacionService : SelectTextConsolidacionService,
    private _anotacionService : AnotacionService,
    private _notificacion : MatSnackBar,
    private translate: TranslateService
  ) {
    this._usuarioAnotacionService.obtenerAnotaciones().subscribe(
      anotacionesAux => this.anotaciones = anotacionesAux
    )
    this._seleccionarTextoConsolidacionService.obtenerParrafoId().subscribe(
      id => this.parrafoId =id
    )
  }

  copiarAnotacion(anotacion : UsuarioAnotacion){
    let valores : AnotacionValor[] = [];
    anotacion.valores.forEach(
      valor => {
        let valor_aux = new AnotacionValor(valor.valor_id)
        valores.push(valor_aux)
      }  
    )
    let texto_html = anotacion.texto.replace("  ", "<br><br>")
    let anotacionGuardar = new Anotacion(anotacion.texto, texto_html, '',this.parrafoId,this.usuario.id, true, anotacion.ejecuta, valores);
    let nota = '';
    this._anotacionService.guardarAnotacion(anotacionGuardar).subscribe(
      () => {
        this.translate.stream("consolidar.dialogo.duplicado").subscribe((res: string)=>{
          nota = res;
       });
        this.notificacion(nota,"exito-snackbar")
        this._seleccionarTextoConsolidacionService.consultarTotalAnotacionesConsolidadorParrafo(this.parrafoId, this.usuario.id)
      },
      () => {
        this.translate.stream("consolidar.dialogo.anotacion_error").subscribe((res: string)=>{
          nota = res;
       });
        this.notificacion("ERROR creando anotacion!", "fracaso-snackbar")
      }
    )
  }

  notificacion(mensaje: string, estilo: string) {
    this._notificacion.openFromComponent(NotificacionComponent, {
      data: mensaje,
      panelClass: [estilo],
      duration: 2000,
      verticalPosition: 'top'
    })
  }

}
