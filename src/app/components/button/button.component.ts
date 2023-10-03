import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconName, IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'is-button',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input('type') type: string = 'button';
  @Input('label') label?: string;
  @Input('labelColor') labelColor?: string;
  @Input('icon') icon?: IconName;
  //TODO Add and sizes
  @Input('iconPos') iconPos: 'right' | 'left' = 'left';
  @Input('iconColor') iconColor?: string;
  @Input('iconSize') iconSize?: '2xs' | 'xs' | 'sm' | 'lg' | 'xl' | '2xl';

  @Input('disabled') disabled?: boolean;
  @Input('loading') loading: boolean = false;
  @Input('styleClass') class: ButtonStyles[] = [];

  @Output('onClick') onClick: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output('onFocus') onFocus: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();
  @Output('onBlur') onBlur: EventEmitter<FocusEvent> = new EventEmitter<FocusEvent>();

  loadingIcon: IconProp = faCircleNotch;

  buttonClass(): Object {
    return {
      'is-button': true,
      'is-button-primary': this.class.includes('primary'),
      'is-button-secondary': this.class.includes('secondary'),
      'is-button-destructive': this.class.includes('destructive'),
      'is-button-outlined': this.class.includes('outlined'),
      'is-button-ghost': this.class.includes('ghost'),
      'is-button-loading': this.loading,
      'is-button-dashed': this.class.includes('dashed')
    };
  }
}

export type ButtonStyles = 'primary' | 'secondary' | 'destructive' | 'outlined' | 'ghost' | 'dashed' | '';
