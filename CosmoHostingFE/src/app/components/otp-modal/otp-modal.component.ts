import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import {MfaResponse} from 'src/app/models/mfa-response.model'

@Component({
  selector: 'app-otp-modal',
  standalone: true,  // Asegura que usa los módulos necesarios
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    MatDialogModule,
    MatButtonModule
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
      alert('Por favor, ingresa un código OTP válido.');
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
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          console.log('Verificación exitosa');
          this.dialogRef.close(true); // <-- Éxito
        } else {
          alert('Código incorrecto');
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error al verificar código');
      }
    });
  }
  
  
  close() {
    this.dialogRef.close();
  }
}
