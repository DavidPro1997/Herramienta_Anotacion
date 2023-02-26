import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PoliticaGuardar, RespuestaPoliticaVisualizar,RespuestaExtraccionTexto } from './insertar'
import { UsuarioLogin } from 'src/app/login/login'

@Injectable({
  providedIn: 'root'
})
export class PoliticaService {

  url = environment.url + 'Politica/';
  usuarioAux: UsuarioLogin = null;


  constructor(
    private http: HttpClient
  ) { }

  guardarPolitica2(politicaAux: PoliticaGuardar):Observable<RespuestaPoliticaVisualizar> {
    const formData: FormData = new FormData();
    formData.append('texto', politicaAux.texto);
    formData.append('nombre', politicaAux.nombre);
    formData.append('url', politicaAux.url)
    formData.append('fecha', politicaAux.fecha)
    return this.http.post<RespuestaPoliticaVisualizar>(this.url + "Guardar", formData)
  }


  contarUrls(archivo: File):Observable<RespuestaPoliticaVisualizar> {
    const formData: FormData = new FormData();
    formData.append('politica', archivo);
    return this.http.post<RespuestaPoliticaVisualizar>(this.url + "Archivo" , formData)
  }

  extraerTexto(linea: number):Observable<RespuestaExtraccionTexto> {
    let url = {
      num : linea
    }
    return this.http.post<RespuestaExtraccionTexto>(this.url + "Extraer" , url)
  }

}
