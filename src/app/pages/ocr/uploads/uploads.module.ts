import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UploadsPageRoutingModule } from './uploads-routing.module';

import { UploadsPage } from './uploads.page';
import { HttpClientModule } from '@angular/common/http';
import { OcrService } from 'src/app/shared/services/ocr.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UploadsPageRoutingModule,
    HttpClientModule
  ],
  providers:[OcrService],
  declarations: [UploadsPage]
})
export class UploadsPageModule {}
