import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LegalProcessService } from '../../services/legal-process.service';
import { CommonModule } from '@angular/common';

// IMPORTA ESTOS MÓDULOS DE ANGULAR MATERIAL 👇
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

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

  constructor(
    private route: ActivatedRoute,
    private legalProcessService: LegalProcessService
  ) {}

  ngOnInit() {
    const processId = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    this.loadProcess(processId);
  }

  loadProcess(id: number) {
    this.legalProcessService.getProcessDetails(id).subscribe({
      next: (data) => this.process = data,
      error: (err) => console.error('Error loading process:', err)
    });
  }

  selectedFiles: { [key: string]: File } = {};

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
    alert('Por favor selecciona un archivo primero.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  this.legalProcessService.uploadDocument(procedureId, documentId, formData).subscribe({
    next: (res) => {
      alert('Archivo subido correctamente.');
      // Opcional: actualizar estado visual del documento como "Subido"
    },
    error: (err) => {
      console.error(err);
      alert('Error al subir el archivo.');
    }
  });
}

}
