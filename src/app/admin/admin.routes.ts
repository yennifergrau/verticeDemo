import { Routes } from "@angular/router";
import { FormcotizadorPage } from "./formcotizador/formcotizador.page";
import { ResultcotizacionPage } from "./resultcotizacion/resultcotizacion.page";
import { SypagoPage } from "./sypago/sypago.page";
import { SypagotpPage } from "./sypagotp/sypagotp.page";
import { ConfirmedPage } from "./confirmed/confirmed.page";

export const ADMIN_ROUTES : Routes = [
    {
        path:'form/cotizacion/vertice/data',
        component:FormcotizadorPage
    },
    {
        path:'result/cotizacion/vertice/data',
        component:ResultcotizacionPage
    },
    {
        path:'sypago/data/vertice/user',
        component:SypagoPage
    },
    {
        path:'sypago/otp/vetice/data',
        component:SypagotpPage
    },
    {
        path:'confirmed/data/rcv/download',
        component:ConfirmedPage
    },
    {
        path:'',
        redirectTo:'',
        pathMatch:'full'
    }
]