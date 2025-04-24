import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-help',
  imports: [CommonModule],
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
})
export class HelpComponent {
  helpData = {
    title: 'Help Center',
    categories: [
      {
        title: 'Common Procedures in the U.S.',
        articles: [
          {
            id: 'ssn-application',
            title: 'How to Apply for a Social Security Number (SSN)',
            content:
              'To apply for an SSN, visit your local Social Security office with documents proving your identity, age, and work eligibility.',
          },
          {
            id: 'driver-license',
            title: "Getting a Driver's License",
            content:
              "Visit your state's DMV website for requirements. Usually you'll need proof of residence, identification, and to pass written and driving tests.",
          },
          {
            id: 'health-insurance',
            title: 'How to Apply for Health Insurance',
            content:
              'You can apply for health insurance through the Health Insurance Marketplace at healthcare.gov or via your state’s Medicaid program if eligible.',
          },
        ],
      },
      {
        title: 'Account & Usage',
        articles: [
          {
            id: 'login-help',
            title: 'How to Log In',
            content:
              "Click the 'Login' button on the top right and enter your email and password. If you forgot your password, use the 'Forgot Password' option.",
          },
          {
            id: 'upload-document',
            title: 'How to Upload a Document',
            content:
              "Navigate to the 'Documents' section in your profile, click 'Upload', select your file and confirm. Only PDFs and images are allowed.",
          },
          {
            id: 'access-profile',
            title: 'How to Access Your Profile',
            content:
              "Click on your name or avatar on the top menu and select 'My Profile' to view and edit your personal information.",
          },
        ],
      },
    ],
  };
}
