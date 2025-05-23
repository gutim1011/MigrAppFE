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
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { CommonModule } from '@angular/common';
import { TextToSpeechService } from 'src/app/services/text-to-speech.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-side-register',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, NgxIntlTelInputModule, CommonModule,TranslateModule,],
  templateUrl: './side-register.component.html',
})
export class AppSideRegisterComponent {
  options = this.settings.getOptions();

  constructor(
    private settings: CoreService,
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog,
    private tts: TextToSpeechService,
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.minLength(10)]),
    phonePrefix: new FormControl('', [Validators.required, Validators.minLength(2)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get f() {
    return this.form.controls;
  }

  leer(texto: string) {
    this.tts.speak(texto);
  }

  submit() {
    if (this.form.invalid) {
      this.toastr.warning(
        this.translate.instant('REGISTER.INVALID_FORM'),
        this.translate.instant('REGISTER.WARNING')
      );
      return;
    }

    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.toastr.error(
        this.translate.instant('REGISTER.PASSWORD_MISMATCH'),
        this.translate.instant('REGISTER.VALIDATION_ERROR')
      );
      return;
    }

    const userData = {
      Email: this.form.value.email,
      Phone: this.form.value.phone,
      PhonePrefix: this.form.value.phonePrefix,
      PasswordHash: this.form.value.password,
    };

    this.authService.register(userData).subscribe(
      () => {
        const loginData = {
          Email: userData.Email,
          Password: this.form.value.password,
          PreferredMfaMethod: 'email',
          RememberMe: true
        };
  
        this.authService.login(loginData).subscribe((res: any) => {
          if (res?.message === 'Código de verificaciï¿½n enviado') {
            const dialogRef = this.dialog.open(OtpModalComponent, {
              width: '500px',
              data: { email: userData.Email, rememberMe: true },
            });
  
            dialogRef.afterClosed().subscribe((result: boolean) => {
              if (result === true) {
                this.toastr.success(
                  this.translate.instant('REGISTER.SUCCESS'),
                  this.translate.instant('REGISTER.WELCOME')
                );
                this.router.navigate(['/profile']);
              } else {
                this.toastr.info(
                  this.translate.instant('REGISTER.OTP_CANCELLED'),
                  this.translate.instant('REGISTER.VERIFICATION_INCOMPLETE')
                );
              }
            });
          } else {
            this.toastr.error(
              this.translate.instant('REGISTER.OTP_FAILED'),
              this.translate.instant('REGISTER.ERROR')
            );
          }
        },
          () => {
            this.toastr.error(
              this.translate.instant('REGISTER.POST_LOGIN_FAILED'),
              this.translate.instant('REGISTER.ERROR')
            );
          }
        );
      },
      (error) => {
        console.error(error);
        this.toastr.error(
          this.translate.instant('REGISTER.REGISTRATION_FAILED'),
          this.translate.instant('REGISTER.ERROR')
        );
      }
    );
  }
}