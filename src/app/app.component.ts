import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './components/button/button.component';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { InputComponent } from './components/input/input.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverDirective } from './components/popover/popover.directive';
import { TooltipDirective } from './components/tooltip/tooltip.directive';
import { DataTableComponent } from './components/data-table/data-table.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    InputComponent,
    FormsModule,
    ReactiveFormsModule,
    PopoverDirective,
    TooltipDirective,
    DataTableComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ng-is';
  a: any = '';
  b: boolean = false;
  test() {
    console.log('test');
  }
  
  ngOnInit() {
    setTimeout(() => {
      // console.log(this.a);
    }, 4000);
  }

  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas, far);
  }
}
