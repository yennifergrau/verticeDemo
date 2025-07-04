import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImagePageRoutingModule } from './image-routing.module';

import { ImagePage } from './image.page';
import { OcrService } from 'src/app/shared/services/ocr.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImagePageRoutingModule,
    ReactiveFormsModule
  ],
  providers:[OcrService],
  declarations: [ImagePage]
})
export class ImagePageModule {}
