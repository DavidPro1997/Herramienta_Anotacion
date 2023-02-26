import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GestionComponent } from './gestion/gestion.component';
import { InsertarComponent } from './insertar/insertar.component';
import { PoliticaComponent } from './politica.component';


const routes: Routes = [{
    path: '',
    component: PoliticaComponent,
    children:[
        {
            path: 'gestion',
            component:GestionComponent
        },
        {
            path: 'insertar',
            component: InsertarComponent
        },
        
    ]
}]

@NgModule({
    imports:[RouterModule.forChild(routes)],
    exports:[RouterModule]
})

export class PoliticaRoutingModule{

}
