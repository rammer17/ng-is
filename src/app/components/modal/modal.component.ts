import { Component, DestroyRef, EventEmitter, Input, Output, TemplateRef, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { fromEvent } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TrapFocusDirective } from "./trap-focus.directive";
import { trigger, state, style, transition, animate } from "@angular/animations";

@Component({
  selector: "is-modal",
  standalone: true,
  imports: [CommonModule, TrapFocusDirective],
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"],
  animations: [
    trigger("defaultAnimation", [
      state("void, false", style({ transform: "scale(0)" })),
      transition("* => true", [
        style({ opacity: 0, transform: "translateY(0%) scale(0.5)" }),
        animate("{{ duration }}ms", style({ opacity: 1, transform: "translateY(0) scale(1)" })),
      ]),
      transition("* => false", [
        style({ opacity: 1, transform: "scale(1)" }),
        animate("{{ duration }}ms", style({ opacity: 0, transform: "scale(0.95)" })),
      ]),
    ]),
    // trigger("deadAreaAnimation", [
    //   state("void, false", style({ opacity: 0 })),
    //   transition("* => true", [style({ opacity: 0 }), animate("{{ duration }}ms", style({ opacity: 1 }))]),
    //   transition("* => false", [style({ opacity: 1 }), animate("{{ duration }}ms", style({ opacity: 0 }))]),
    // ]),
  ],
})
export class ModalComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  @Output() submit: EventEmitter<void> = new EventEmitter<void>();

  @Input({ alias: "header", required: false }) headerTemplate?: TemplateRef<any>;
  @Input({ alias: "content", required: false }) contentTemplate?: TemplateRef<any>;
  @Input({ alias: "open", required: false }) isModalVisible: boolean = true;
  @Input({ alias: "duration", required: false }) duration: number = 150;

  showAnimation: boolean = true;

  ngOnInit() {
    this.initEventListenerObservables();
  }

  onCancel(): void {
    this.closeModal("close");
  }

  onSubmit(): void {
    this.closeModal("submit");
  }

  private closeModal(eventType: "close" | "submit"): void {
    this.showAnimation = false;
    setTimeout(() => {
      this[eventType].emit();
    }, this.duration);
  }

  private initEventListenerObservables(): void {
    fromEvent(window, "wheel", { passive: false })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e: any) => {
        if (e?.ctrlKey) e.preventDefault();
      });
  }
}
