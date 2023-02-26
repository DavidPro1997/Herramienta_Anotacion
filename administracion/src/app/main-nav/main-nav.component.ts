import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { LoginService } from '../login/login.service';
import { Router } from '@angular/router';
import { UsuarioLogin } from '../login/login';
import {TranslateService} from "@ngx-translate/core";
import { TreeViewComponent} from './tree-view/tree-view.component'



@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.css']
})
export class MainNavComponent implements OnInit{

  ngSelect: string='';
  idioma: string = '';
  langs: string[] = [];
  modulosAux : any = [];
  //moduloAdministradorIngles: any = [""];
  //moduloAdministradorEspañol: any = ["Administracion"];
  usuarioAux : UsuarioLogin = null;
  logueado = false;
  login$ : Observable<boolean>;
  isHandset$: Observable<boolean> = this._breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(
    private _breakpointObserver: BreakpointObserver,
    public _loginService:LoginService,
    private _router :Router,
    private translate: TranslateService,
    ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.translate.addLangs(['en','es'])
    this.login$= new BehaviorSubject<boolean>(false);
    if(this._loginService.estaLogeado()){
      this.logueado = true;
      this.login$= new BehaviorSubject<boolean>(true);
      this.usuarioAux = JSON.parse(localStorage.getItem('usuario'));      
      this.modulosAux = this.usuarioAux.modulos;

    }else{
      this._router.navigate(['/login'])
    }
  }

  logout(){
   this._loginService.logout().subscribe(
     () => {
       localStorage.removeItem('token')
       localStorage.removeItem('usuario')
       this.login$= new BehaviorSubject<boolean>(false);
       this._router.navigate(['/login'])
     },
     () => {
      let mensaje = '';
      this.translate.stream("menu_arbol.error").subscribe((res: string)=>{
        mensaje = res;
     });
     alert(mensaje)
    })
  }

  escogerIdioma(lang: string): void {
    if(lang == "Español" || lang == "Spanish"){
      lang = 'es';
      this.translate.stream("idiomas.espanol").subscribe((res: string)=>{
        this.ngSelect = res;
      });
    }
    else{
      lang = 'en'
      this.translate.stream("idiomas.ingles").subscribe((res: string)=>{
        this.ngSelect = res;
      });
    }
    this.translate.use(lang);   
    //this.tree.dataSource.data[0].nombre = "Hola"
 
  }

  ngOnInit() {
    this.translate.stream("idiomas.espanol").subscribe((res: string)=>{
      this.langs[1] = res;
    });
    this.translate.stream("idiomas.ingles").subscribe((res: string)=>{
      this.langs[0] = res;
    });
  }
}

