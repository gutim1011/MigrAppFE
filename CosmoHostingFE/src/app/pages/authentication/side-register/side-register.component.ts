import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { OtpModalComponent } from '../../../components/otp-modal/otp-modal.component';

@Component({
  selector: 'app-side-register',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './side-register.component.html',
})
export class AppSideRegisterComponent {
  options = this.settings.getOptions();

  constructor(
    private settings: CoreService,
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog
  ) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.minLength(10)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid) {
      alert('Por favor, completa todos los campos correctamente.');
      return;
    }

    if (this.form.value.password !== this.form.value.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    const userData = {
      Email: this.form.value.email,
      PhoneNumber: this.form.value.phone,
      PasswordHash: this.form.value.password,
    };

    this.authService.register(userData).subscribe(
      () => {
        this.authService.generateOtp(userData).subscribe(() => {
          const dialogRef = this.dialog.open(OtpModalComponent, {
            width: '500px',
            data: userData,
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              alert('Registro exitoso');
              this.router.navigate(['/dashboard']);
            }
          });
        });
      },
      (error) => {
        alert('Error al registrar usuario');
        console.error(error);
      }
    );
  }
}
