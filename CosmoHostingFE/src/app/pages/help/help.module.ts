import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpComponent } from './help.component';
import { RouterModule } from '@angular/router';
import { HelpRoutes } from './help.routes';

@NgModule({
  declarations: [HelpComponent],
  imports: [CommonModule, RouterModule.forChild(HelpRoutes)],
})
export class HelpModule {}
