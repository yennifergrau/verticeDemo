import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DetectDocumentTextCommand, TextractClient } from '@aws-sdk/client-textract';
import { NavController, ToastController } from '@ionic/angular';
import { catchError, throwError } from 'rxjs';
import { OcrService } from 'src/app/shared/services/ocr.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-uploads',
  templateUrl: './uploads.page.html',
  styleUrls: ['./uploads.page.scss'],
})
export class UploadsPage implements OnInit {

  isDisabled: boolean = false;
  imageUrl: string | null = null;
  private toastController = inject(ToastController);
  private navCtrl = inject(NavController);
  private textractClient: TextractClient;
  showLoading: boolean = false;
  text: string = ''; 
  pdfUrl: SafeResourceUrl | null = null;
  isPdf: boolean = false; 
  public messageInformation:boolean= false
  public messageInformationError:boolean= false
  
  constructor(private ocrService: OcrService,private domSanitizer: DomSanitizer) {
    this.textractClient = new TextractClient({
      region: environment.awsConfig.region,
      credentials: {
        accessKeyId: environment.awsConfig.credentials.accessKeyId,
        secretAccessKey: environment.awsConfig.credentials.secretAccessKey
      }
    });
  }

  ngOnInit() {}

  async presentToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      color: color
    });
    await toast.present();
  }

  processDocumentText(text: any) {
    const currentScanType = localStorage.getItem('CURRENT_ADJUNTO');
    if (currentScanType && text) {
      const jsonString = JSON.stringify(text);
      if (currentScanType === 'licencia') {
       localStorage.setItem('OCR_LICENCIA', jsonString);
      } else if (currentScanType === 'carnet') {
       localStorage.setItem('OCR_CARNET', jsonString);
      } else if (currentScanType === 'cedula') { localStorage.setItem('OCR_CEDULA', jsonString);
      }      
        this.presentToast('Documento escaneado exitosamente.😁 Puede proceder al siguiente paso.', 'success');
      } else {
        this.handleValidationError(currentScanType);
      }
    
  }

  validateJsonFields(jsonObject: any): boolean {
    for (const key in jsonObject) {
      if (jsonObject.hasOwnProperty(key) && !jsonObject[key]) {
        return false; // Retorna false si algún campo está vacío
      }
    }
    return true; // Retorna true si todos los campos están completos
  }

  async handleValidationError(scanType: string | null) {
    await this.presentToast('La imagen no se procesó correctamente.😰 Por favor, intente nuevamente.', 'warning');    
    
    if (scanType) {
      switch(scanType) {
        case 'carnet':
          localStorage.removeItem('OCR_CARNET');
          break;
        case 'licencia':
          localStorage.removeItem('OCR_LICENCIA');
          break;
        case 'cedula':
          localStorage.removeItem('OCR_CEDULA');
          break;
      }
      setTimeout(() => {
        window.location.reload();
      }, 2800);  
    }
  }
  async performOcr(file: Blob): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);     
      const command = new DetectDocumentTextCommand({
        Document: { Bytes: uint8Array }
      }); 
      const response = await this.textractClient.send(command);
      
      const text = response.Blocks
        ?.filter(block => block.BlockType === 'LINE')
        .map(block => block.Text)
        .join(' ') || ''; 
      
      return this.cleanText(text); 
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      throw new Error('Se produjo un error al procesar la imagen. Por favor, intente nuevamente.');
    }
  }
  

  cleanText(text: string): string {
    return text.replace(/\s+/g, '').trim();
  }
  
  async validateDocumentType(file: Blob, currentScanType: string | null): Promise<boolean> {
    if (!currentScanType) {
      return false;
    }

    const text = await this.performOcr(file);

    if (currentScanType === 'licencia') {
      return /LICENCIA/.test(text) || /Licencia/.test(text);
    } else if (currentScanType === 'cedula') {
      return /VENEZOLANO/.test(text);
    } else if (currentScanType === 'carnet') {
      return /CERTIFICADO/.test(text) || /Certificado/.test(text);
    }

    return false;
  }


  async processImage(file: Blob) {
    const currentScanType = localStorage.getItem('CURRENT_ADJUNTO');
    this.showLoading = true;
    const isValid = await this.validateDocumentType(file, currentScanType);
    if (!isValid) {
      this.showLoading = false;
      this.messageInformationError =true
      this.messageInformation = false
      this.presentToast('La imagen capturada no coincide con el tipo de documento esperado.😞 Por favor, intente nuevamente.', 'warning');
      return;
    }
    this.ocrService.fileUpload(file).pipe(
      catchError((error: HttpErrorResponse) => {
        this.showLoading = false;
        if (error.status === 400) {
          this.presentToast('El archivo seleccionado no es un documento válido.😞 Por favor, suba un documento en el formato correcto.', 'danger');
          this.clearPreviousData();
        } else {
          this.presentToast('Se produjo un error inesperado.😰 Por favor, inténtelo de nuevo.', 'danger');
          this.clearPreviousData();
        }
        return throwError(error);
      })
    ).subscribe(
      (response: any) => {
        this.showLoading = false;        
        this.text = response; 
        this.processDocumentText(this.text);
      }
    );
  }


  clearPreviousData() {
    this.text = '';
  }

  async handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        this.displayImage(file);
        this.isPdf = false;
      } else if (file.type === 'application/pdf') {
        this.displayPdf(file);
        this.isPdf = true;
      }
      this.processImage(file); // Supongo que esta función procesa la imagen de alguna manera
    }
  }

  displayImage(file: Blob) {
    this.messageInformation = true
    this.messageInformationError = false
    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrl = reader.result as string;
      this.isDisabled = true;
    };
    reader.readAsDataURL(file);
  }

  displayPdf(file: Blob) {
    // Verifica si el archivo tiene contenido
    if (!file || file.size === 0) {
      console.error('El archivo PDF está vacío o no es válido.');
      return;
    }
    this.messageInformation = true
    this.messageInformationError = false
    // Crear el Blob correctamente con el tipo de contenido adecuado
    const blob = new Blob([file], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob); // Crear una URL del Blob
    
    // Sanitizar la URL del Blob para usarla en el iframe
    this.pdfUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(blobUrl);
    this.isDisabled = true;
  }

  public RoutingNavigate(){
    this.navCtrl.navigateRoot('2d4b8e3c1a7f9d5e6c9a4d8f3b1a7e2').then(() => {
      window.location.reload();
    })
  }

}
