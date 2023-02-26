import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NodoSeleccionado } from '../../anotacion/anotacion-politica/anotacion-politica.component';
import { SelectionModel } from '@angular/cdk/collections';
import { TratamientoNodoPlano } from '../../anotacion/tree-view-tratamientos/tree-view-tratamientos.component';
import { AnotacionService } from '../../anotacion/anotacion.service';
import { Anotacion, AnotacionValor } from '../../anotacion/anotacion';
import { NotificacionComponent } from 'src/app/notificacion/notificacion.component';
import { MatSnackBar } from '@angular/material';
import { SelectTextConsolidacionService } from '../select-text-consolidacion/select-text-consolidacion.service';
import { TreeViewConsolidacionService } from '../tree-view-consolidacion/tree-view-consolidacion.service';
import {TranslateService} from "@ngx-translate/core";


@Component({
  selector: 'app-consolidacion-politica',
  templateUrl: './consolidacion-politica.component.html',
  styleUrls: ['./consolidacion-politica.component.css']
})
export class ConsolidacionPoliticaComponent implements OnInit {

  politicaId: number;
  parrafoId: number = 0;

  usuario = JSON.parse(localStorage.getItem("usuario"));

  listaValores: NodoSeleccionado[] = [];
  valores: AnotacionValor[] = [];
  lista = new SelectionModel<TratamientoNodoPlano>(true /* multiple */);
  textoHtml: string = "";
  texto: string = "";

  ejecuta: boolean = false;

  constructor(
    private _router: Router,
    private _anotacionService: AnotacionService,
    private _seleccionarTextoService: SelectTextConsolidacionService,
    private _treeViewService: TreeViewConsolidacionService,
    private _notificacion: MatSnackBar,
    private translate: TranslateService
  ) {
    this.politicaId = this._router.getCurrentNavigation().extras.state.politica_id;
    this._seleccionarTextoService.obtenerTexto().subscribe(
      texto => this.texto = texto
    )
    this._seleccionarTextoService.obtenerTextoHmtl().subscribe(
      textoHtml => this.textoHtml = textoHtml
    )
    this._treeViewService.obtenerEjecuta().subscribe(
      ejecuta => this.ejecuta = ejecuta
    )
    this._seleccionarTextoService.obtenerParrafoId().subscribe(
      parrafoId => this.parrafoId = parrafoId
    )
  }

  parrafoCambiado() {
    this.lista.clear()
    this.listaValores = []
    this._treeViewService.colocarEjecuta(false)
  }

  obtenerEjecuta($event) {
    this.ejecuta = $event
  }

  obtenerLista($event) {
    this.listaValores = []
    this.lista = $event;
    if (this.lista != null) {
      this.lista.selected.forEach(
        item => {
          if (item.level == 2) {
            this.listaValores.push(item)
          }
        }
      )
    }
  }

  guardarAnotacion() {
    this.valores = [];
    if (this.listaValores.length == 0) {
      let mensaje = '';
      this.translate.stream("consolidar.dialogo.advertencia").subscribe((res: string)=>{
        mensaje = res;
      });
      alert(mensaje)
    } else {
      this.listaValores.forEach(
        valor => {
          let valor_aux = new AnotacionValor(valor.id)
          this.valores.push(valor_aux)
        }
      )

      let anotacion = new Anotacion(this.texto, this.textoHtml, '', this.parrafoId, this.usuario.id, true, !this.ejecuta, this.valores)

      this._anotacionService.guardarAnotacion(anotacion).subscribe(
        () => {
          let nota = '';
          this.translate.stream("consolidar.dialogo.anotacion_exito").subscribe((res: string)=>{
            nota = res;
          });
          this.notificacion(nota, "exito-snackbar")
          setTimeout(
            () => {

              //Simular un cambio de parrafo y limpiar todos los campos
              this.parrafoCambiado()
              this._seleccionarTextoService.colocarTexto("")
              this._seleccionarTextoService.colocarTextoHtml("")
              this._seleccionarTextoService.consultarTotalAnotacionesConsolidadorParrafo(this.parrafoId, this.usuario.id)
            },
            1000
          )
        },
        () => {
          let nota = '';
          this.translate.stream("consolidar.dialogo.anotacion_error").subscribe((res: string)=>{
            nota = res;
          });
          this.notificacion(nota, "fracaso-snackbar")
        }
      )
    };
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
  }

}
