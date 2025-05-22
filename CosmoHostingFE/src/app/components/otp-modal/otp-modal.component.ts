import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import {MfaResponse} from 'src/app/models/mfa-response.model';
import { TranslateModule } from '@ngx-translate/core';
import { transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-otp-modal',
  standalone: true,  // Asegura que usa los módulos necesarios
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatDialogModule,
    MatButtonModule,
    TranslateModule,
  ],
  templateUrl: './otp-modal.component.html',
})
export class OtpModalComponent {
  otpForm = new FormGroup({
    otpCode: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]),
  });

  constructor(
    public dialogRef: MatDialogRef<OtpModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService
  ) {}

  validateOtp() {
    if (this.otpForm.invalid) {
      return;
    }
  
    const mfaCode = this.otpForm.value.otpCode!;
    const payload = {
      email: this.data.email,
      code: mfaCode,
      rememberMe: this.data.rememberMe
    };
  
    this.authService.verifyMfaCode(payload).subscribe({
      next: (response: MfaResponse) => {
        if (response.token && response.userId) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('userId', response.userId.toString());
          console.log('Verificación exitosa');
          this.dialogRef.close(true); // <-- Éxito
        } else {
          console.log("error");
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  
  
  close() {
    this.dialogRef.close();
  }
}
