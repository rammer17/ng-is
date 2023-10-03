import { CommonModule, NgTemplateOutlet } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  HostBinding,
  Injector,
  Input,
  Renderer2,
  TemplateRef,
  inject,
} from '@angular/core';
import { Observable, ReplaySubject, fromEvent, merge, takeUntil, throttleTime } from 'rxjs';
import { trigger, style, transition, animate, state } from '@angular/animations';

@Directive({
  selector: '[isPopover]',
  standalone: true,
})
export class PopoverDirective {
  private readonly el: ElementRef = inject(ElementRef);
  private readonly appRef: ApplicationRef = inject(ApplicationRef);
  private readonly injector: Injector = inject(Injector);
  private readonly componentFactoryResolver: ComponentFactoryResolver =
    inject(ComponentFactoryResolver);

  @Input() popupTemplate?: HTMLElement;
  @Input() popupNgTemplate?: TemplateRef<any>;
  @Input() data: any;

  @Input('appendTo') target: 'body' | undefined;
  @Input('isPopover') showPopover: boolean = true;
  @Input('template') popoverTemplate?: any;
  @Input('templateContext') popoverTemplateContext?: any;
  @Input('position') position: 'left' | 'right' | 'top' | 'bottom' = 'top';
  @Input('animationDuration') animationDuration: number = 150;

  private _popoverComponentRef?: ComponentRef<PopoverComponent>;

  // Obs for recalculating position of popover component
  private resize$?: Observable<any>;
  // Notifier obs for closing popover component
  private destroy$: ReplaySubject<void> = new ReplaySubject<void>(1);

  ngOnChanges(): void {
    if (!this.showPopover && this._popoverComponentRef) {
      this.removeComponent();
    } else if (this.showPopover && !this._popoverComponentRef) {
      this.initResizeObs();
      this.initPopover();
    }
  }

  private initPopover(): void {
    let translateDir: 'X' | 'Y';
    let translateVal: '' | '-';

    //Set direction from which the popover appears depending on its position
    switch (this.position) {
      case 'top':
        translateDir = 'Y';
        translateVal = '';
        break;
      case 'bottom':
        translateDir = 'Y';
        translateVal = '-';
        break;
      case 'left':
        translateDir = 'X';
        translateVal = '';
        break;
      case 'right':
        translateDir = 'X';
        translateVal = '-';
        break;
      default:
        break;
    }
    setTimeout(() => {
      this._popoverComponentRef = this.appendComponent({
        template: this.popoverTemplate,
        context: this.popoverTemplateContext,
        position: this.position,
        target: this.getLocationViewContainer(),
        translateDirection: translateDir,
        translateValue: translateVal,
        animationDuration: this.animationDuration,
      });
    }, 0);
    this.destroy$ = new ReplaySubject<any>(1);
    this.resize$!.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this._popoverComponentRef) this._popoverComponentRef.instance.positionPopover();
    });
  }

  private initResizeObs() {
    this.resize$ = merge(
      fromEvent(window, 'resize', { capture: true }),
      fromEvent(window, 'scroll', { capture: true }).pipe(throttleTime(15))
    );
  }

  private appendComponent(options: any): ComponentRef<any> {
    const componentFactory =
      this.componentFactoryResolver.resolveComponentFactory(PopoverComponent);
    const componentRef = componentFactory.create(this.injector);
    const componentRootNode = this.getComponentRootNode(componentRef);
    const location = this.target === 'body' ? document.body : this.getLocationViewContainer();

    this.projectComponentVariables(componentRef, options);

    this.appRef.attachView(componentRef.hostView);

    location.appendChild(componentRootNode);

    return componentRef;
  }

  private getLocationViewContainer(): HTMLElement {
    return this.el.nativeElement as HTMLElement;
  }

  private getComponentRootNode(componentRef: ComponentRef<any>): HTMLElement {
    return (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
  }

  private projectComponentVariables(component: ComponentRef<any>, options: any): void {
    if (options) {
      const props = Object.getOwnPropertyNames(options);
      for (const prop of props) {
        component.instance[prop] = options[prop];
      }
    }
  }

  private removeComponent(): void {
    if (!this._popoverComponentRef) return;

    this._popoverComponentRef.instance.close();
    setTimeout(() => {
      this._popoverComponentRef!.destroy();
      this._popoverComponentRef = undefined;
      this.destroy$.next();
    }, this.animationDuration);
  }
}

@Component({
  selector: 'is-popover',
  template: `
    <ng-container *ngTemplateOutlet="template!; context: { $implicit: context }"></ng-container>
  `,
  styles: [
    `
      :host {
        position: fixed;
        top: 0;
        left: 0;
        word-break: keep-all;
        line-break: strict;
        min-width: 100px;
        max-width: 400px;
        overflow: hidden;
      }
    `,
  ],
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('defaultAnimation', [
      state('void, false', style({ transform: 'scale(0)' })),
      transition('* => true', [
        style({ opacity: 0, transform: 'translate{{ td }}({{ tv }}30%) scale(0.5)' }),
        animate('{{ ad }}ms', style({ opacity: 1, transform: 'translate{{ td }}(0) scale(1)' })),
      ]),
      transition('* => false', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate('{{ ad }}ms', style({ opacity: 0, transform: 'scale(0.95)' })),
      ]),
    ]),
  ],
})
class PopoverComponent {
  private readonly renderer: Renderer2 = inject(Renderer2);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef<HTMLElement>);

  template!: TemplateRef<any>;
  context?: object;
  position: 'left' | 'right' | 'top' | 'bottom' = 'top';
  target!: HTMLElement;

  showLeaveAnimation: boolean = true;
  translateDirection: 'X' | 'Y' = 'Y';
  translateValue: '-' | '' = '';
  animationDuration?: number;

  // Bind animation to host element
  @HostBinding('@defaultAnimation') get getToggleDrawer(): any {
    return {
      value: this.showLeaveAnimation,
      params: { td: this.translateDirection, tv: this.translateValue, ad: this.animationDuration },
    };
  }

  ngAfterViewInit(): void {
    this.positionPopover();
  }

  // Start exit animation before component is destroyed
  close(): void {
    this.showLeaveAnimation = false;
    // this.cdr.detectChanges();
  }

  // Position tooltip component relative to targetElement
  positionPopover(): void {
    // Template dimensions
    const popoverRect = this.host.nativeElement.getBoundingClientRect();
    // Directive's host dimensions
    const targetRect = this.target.getBoundingClientRect();

    let x = 0;
    let y = 0;

    switch (this.position) {
      case 'top':
        x = (targetRect.right + targetRect.left) / 2 - popoverRect.width / 2;
        y = targetRect.top - popoverRect.height;
        break;

      case 'bottom':
        x = (targetRect.right + targetRect.left) / 2 - popoverRect.width / 2;
        y = targetRect.bottom;
        break;

      case 'left':
        x = targetRect.left - popoverRect.width;
        y = targetRect.top + targetRect.height / 2 - popoverRect.height / 2;
        break;

      case 'right':
        x = targetRect.left + targetRect.width;
        y = targetRect.top + targetRect.height / 2 - popoverRect.height / 2;
        break;

      default:
        return;
    }

    this.renderer.setStyle(this.host.nativeElement, 'top', `${y}px`);
    this.renderer.setStyle(this.host.nativeElement, 'left', `${x}px`);

    // Set transition only after init, so the :enter animation does not break
    if (!this.host.nativeElement.style.transition)
      setTimeout(() => {
        this.renderer.setStyle(this.host.nativeElement, 'transition', `top 75ms linear 0s`);
      }, this.animationDuration);
  }
}
