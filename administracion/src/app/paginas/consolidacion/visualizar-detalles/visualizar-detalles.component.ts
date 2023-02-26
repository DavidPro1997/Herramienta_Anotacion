import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { PoliticaAnotarConsultar } from '../../administracion/politica/gestion/gestion';
import { AnotacionService } from '../../anotacion/anotacion.service';
import { DetallesAnotacion } from '../../anotacion/anotacion';

@Component({
  selector: 'app-visualizar-detalles',
  templateUrl: './visualizar-detalles.component.html',
  styleUrls: ['./visualizar-detalles.component.css']
})
export class VisualizarDetallesComponent {

  displayedColumns = ['id','anotador','total_anotaciones']

  politica : PoliticaAnotarConsultar

  listaInteranotador : DetallesAnotacion;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data : any,
    private _anotacionService : AnotacionService
  ) {
    this.politica = data.politicaAux
    this._anotacionService.obtenerDetallesAnotacionPolitica(this.politica.politica_id).subscribe(
      detalles => this.listaInteranotador = detalles
    )
   }


}
