import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LegalProcessService } from '../../services/legal-process.service';
import { CommonModule } from '@angular/common';

// Módulos Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

import { ToastrService } from 'ngx-toastr'; // ✅ Importar Toastr

@Component({
  selector: 'app-legal-process-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule
  ],
  templateUrl: './legal-process-detail.page.html',
  styleUrls: ['./legal-process-detail.page.scss'],
})
export class LegalProcessDetailPage implements OnInit {
  process: any;
  selectedFiles: { [key: string]: File } = {};

  constructor(
    private route: ActivatedRoute,
    private legalProcessService: LegalProcessService,
    private toastr: ToastrService // ✅ Inyectar Toastr
  ) {}

  ngOnInit() {
    const processId = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    this.loadProcess(processId);
  }

  loadProcess(id: number) {
    this.legalProcessService.getProcessDetails(id).subscribe({
      next: (data) => this.process = data,
      error: (err) => {
        console.error('Error loading process:', err);
        this.toastr.error('No se pudo cargar el proceso legal.', 'Error');
      }
    });
  }

  onFileSelected(event: any, procedureId: number, documentId: number) {
    const file: File = event.target.files[0];
    if (file) {
      const key = `${procedureId}_${documentId}`;
      this.selectedFiles[key] = file;
    }
  }

  uploadFile(procedureId: number, documentId: number) {
    const key = `${procedureId}_${documentId}`;
    const file = this.selectedFiles[key];

    if (!file) {
      this.toastr.warning('Por favor selecciona un archivo primero.', 'Advertencia');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.legalProcessService.uploadDocument(procedureId, documentId, formData).subscribe({
      next: () => {
        this.toastr.success('Archivo subido correctamente.', 'Éxito');
        // Aquí puedes actualizar el estado visual si lo deseas
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Error al subir el archivo.', 'Error');
      }
    });
  }
}
