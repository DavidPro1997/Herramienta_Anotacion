import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PoliticaAnotarConsultar, Reportes, ReportesRespuesta } from './reporte'


@Injectable({
  providedIn: 'root'
})
export class PoliticaService {

  url = environment.url + 'Politica/';


  constructor(
    private http: HttpClient
  ) { }

  //consulta politicas anotadas finalizadas o no finalizadas
  consultarPoliticasAnotadas(tipo: number): Observable<PoliticaAnotarConsultar[]>{
    return this.http.get<PoliticaAnotarConsultar[]>(this.url+"Anotada/"+tipo)
  }

  //crear reporte
  generarReporte(politicasAnotadas: Reportes): Observable<ReportesRespuesta>{
    return this.http.post<ReportesRespuesta>(this.url+"Reporte",politicasAnotadas)
  }

}
