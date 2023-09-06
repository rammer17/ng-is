import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewEncapsulation,
  forwardRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, IconName } from '@fortawesome/free-solid-svg-icons';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'is-input',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  template: `
    <div [ngClass]="wrapperClass()">
      <input
        #input
        id="input"
        [disabled]="disabled"
        [type]="type"
        [placeholder]="placeholder"
        title=""
        [ngModel]="value"
        (ngModelChange)="onInputChange($event)"
        [accept]="allowedExtensions"
        [ngClass]="inputClass()" />
      <fa-icon *ngIf="inputIcon" [ngClass]="iconClass()" [icon]="inputIcon"></fa-icon>
    </div>
  `,
  styles: [
    `
      * {
        box-sizing: border-box;
      }
      .is-input {
        padding: 0.5rem 0.75rem;
        border-radius: calc(0.5rem - 2px);
        height: 2.5rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        border: 1px solid hsl(var(--input));
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
        position: relative;
        z-index: 51;
        width: 500px;
        transition: 0.15s border;
      }
      .is-input:disabled:hover {
        cursor: not-allowed;
      }
      .is-input:focus-visible {
        box-shadow: hsl(var(--background));
        outline: 2px solid hsl(var(--foreground));
        outline-offset: 1px;
      }
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type='number'] {
        -moz-appearance: textfield;
        appearance: textfield;
      }
      .input-wrapper {
        position: relative;
        display: flex;
        justify-content: center;
        flex-direction: column !important;
      }
      .input-wrapper:focus-within {
        .is-input::placeholder {
          opacity: 0;
        }
      }
      .input-destructive {
        .is-input {
          transition: 0.15s;
          box-shadow: hsl(var(--background));
          outline: 2px solid hsl(var(--destructive));
        }
      }
      .input-success {
        .is-input {
          transition: 0.15s;
          box-shadow: hsl(var(--background));
          outline: 2px solid hsl(var(--success));
        }
      }
      .is-input::file-selector-button {
        background: hsl(var(--background));
        color: hsl(var(--foreground));
        outline: none;
        border: none;
      }
      .input-file-icon {
        .is-input::file-selector-button {
          margin-left: 20px;
        }
      }
      .is-input::file-selector-button:hover,
      input[type='file']:hover {
        cursor: pointer;
      }
      fa-icon {
        color: hsl(var(--foreground));
        position: absolute;
        z-index: 51;
        transform: translateX(50%);
      }
      .is-input-icon-right {
        right: 0;
        transform: translateX(-50%);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() value?: any;
  @Input('type') type: InputTypes = 'text';
  @Input('placeholder') placeholder: string = '';
  @Input('invalid') invalid: boolean = false;
  @Input('valid') valid: boolean = false;
  @Input('disabled') disabled: boolean = false;
  @Input('allowedExtensions') allowedExtensions: string[] = [];
  @Input('icon') inputIcon?: IconName | IconDefinition;
  @Input('iconPos') iconPos: 'left' | 'right' = 'left';

  @ViewChild('input') input?: ElementRef<HTMLInputElement>;

  onChange: any = () => {};
  onTouched: any = () => {};

  inputClass(): Object {
    return {
      'is-input': true,
    };
  }

  wrapperClass(): Object {
    return {
      'input-wrapper': true,
      'input-destructive': this.invalid,
      'input-success': this.valid,
      'input-file-icon': this.type === 'file' && this.iconPos === 'left' && this.inputIcon,
    };
  }

  iconClass(): Object {
    return {
      'is-input-icon-right': this.iconPos === 'right',
    };
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    console.log(fn);
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInputChange(value: any): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
  }
}

export type InputTypes = 'text' | 'number' | 'password' | 'file';
