import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from 'src/app/services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  standalone: true,
  selector: 'app-complete-profile',
  imports: [
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class CompleteProfileComponent {
  fb = inject(FormBuilder);
  userService = inject(AuthService);
  toastr = inject(ToastrService);
  translate = inject(TranslateService);

  profileForm = this.fb.group({
    name: ['', Validators.required],
    lastName: ['', Validators.required],
    phonePrefix: ['+57'],
    phone: ['', Validators.required],
    country: [''],
    birthDate: ['']
  });

  isEditMode = false;
  hasInfo = false;
  userId: number = 0;
  userImageUrl: string = 'assets/images/default-avatar.jpg';

  ngOnInit() {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      this.userId = +storedId;
    }

    if (!this.userId) return;

    this.fetchUserProfile();

    this.userService.getUserInfo(this.userId).subscribe({
      next: (data) => {
        this.hasInfo = true;
        const [name, lastName] = data.fullName.split(' ');
        this.profileForm.patchValue({
          name,
          lastName,
          phonePrefix: data.phone?.substring(0, 3) || '+57',
          phone: data.phone?.substring(3),
          country: data.country,
          birthDate: data.birthDate?.split('T')[0] || '',
        });
        this.profileForm.disable();
      },
      error: () => {
        this.hasInfo = false;
        this.profileForm.disable();
        this.toastr.info(
          this.translate.instant('PROFILE.LOAD_INFO_FAILED'),
          this.translate.instant('PROFILE.INCOMPLETE')
        );
      }
    });
  }

  fetchUserProfile() {
    this.userService.getUserProfile(this.userId).subscribe({
      next: (data: any) => {
        this.userImageUrl = data.image || this.userImageUrl;
      },
      error: (err: any) => {
        console.error('Error loading profile image:', err);
        this.toastr.error(
          this.translate.instant('PROFILE.IMAGE_ERROR'),
          this.translate.instant('PROFILE.ERROR')
        );
      }
    });
  }

  enableEdit() {
    this.isEditMode = true;
    this.profileForm.enable();
  }

  onSubmit() {
    if (this.profileForm.invalid) {
      this.toastr.warning(
        this.translate.instant('PROFILE.FILL_REQUIRED_FIELDS'),
        this.translate.instant('PROFILE.INVALID_FORM')
      );
      return;
    }

    const storedId = localStorage.getItem('userId');
    if (storedId) {
      this.userId = +storedId;
    }

    const formData = this.profileForm.value;

    this.userService.updateUser(this.userId, formData).subscribe({
      next: () => {
        this.toastr.success(
          this.translate.instant('PROFILE.UPDATE_SUCCESS'),
          this.translate.instant('PROFILE.SUCCESS')
        );
        this.isEditMode = false;
        this.profileForm.disable();
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('PROFILE.UPDATE_ERROR'),
          this.translate.instant('PROFILE.ERROR')
        );
      }
    });
  }
}
