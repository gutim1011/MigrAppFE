import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LegalProcessService } from '../../services/legal-process.service';
import { CommonModule } from '@angular/common';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-legal-process-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatButtonModule,
    TranslateModule,
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
    private toastr: ToastrService,
    private translate: TranslateService
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
        this.toastr.error(
          this.translate.instant('PROCESS_DETAIL.LOAD_ERROR'),
          this.translate.instant('PROCESS_DETAIL.ERROR')
        );
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
      this.toastr.warning(
        this.translate.instant('PROCESS_DETAIL.NO_FILE_SELECTED'),
        this.translate.instant('PROCESS_DETAIL.WARNING')
      );
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    this.legalProcessService.uploadDocument(procedureId, documentId, formData).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant('PROCESS_DETAIL.UPLOAD_SUCCESS'),
          this.translate.instant('PROCESS_DETAIL.SUCCESS')
        );
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(
          this.translate.instant('PROCESS_DETAIL.UPLOAD_ERROR'),
          this.translate.instant('PROCESS_DETAIL.ERROR')
        );
      }
    });
  }
}
