import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GetsetService } from 'src/app/shared/services/getset.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-resultcotizacion',
  templateUrl: './resultcotizacion.page.html',
  styleUrls: ['./resultcotizacion.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterLink
  ]
})
export class ResultcotizacionPage implements OnInit {
  cotizaciones: any[] = [];
  ultimaCotizacion: any = null;
  dataUsuario: any = null;

  constructor(private cotizacionService: GetsetService) { }

  ngOnInit() {
    this.ultimaCotizacion = this.cotizacionService.dataCotizador;
    this.dataUsuario = this.cotizacionService.dataUser
  }

  formatCurrency(value: number): string {
    return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }
}