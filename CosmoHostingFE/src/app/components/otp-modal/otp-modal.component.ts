import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';

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

    const otpData = {
        Email: this.data.Email, 
        PasswordHash: this.data.PasswordHash, 
        OtpCode: this.otpForm.value.otpCode,
    };

    console.log(otpData);

    this.authService.validateOtp(otpData).subscribe(
      (isValid) => {
        if (isValid) {
          alert('OTP validado correctamente');
          this.dialogRef.close(true);
        } else {
          alert('Código OTP incorrecto');
        }
      },
      (error) => {
        alert('Error al validar OTP');
        console.error(error);
      }
    );
  }

  close() {
    this.dialogRef.close(false);
  }
}
