import { Component, DestroyRef, HostListener, Input, InputSignal, TemplateRef, inject, input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { fromEvent, debounceTime } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { TrapFocusDirective } from "./trap-focus.directive";

@Component({
  selector: "is-modal",
  standalone: true,
  imports: [CommonModule, TrapFocusDirective],
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"],
})
export class ModalComponent {
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  @Input({ alias: "header", required: false }) headerTemplate?: TemplateRef<any>;
  @Input({ alias: "content", required: false }) contentTemplate?: TemplateRef<any>;
  @Input({ alias: "open", required: false }) isModalVisible: boolean = true;

  showModal: InputSignal<boolean> = input(true);

  ngOnInit() {
    this.initEventListenerObservables();
  }

  private initEventListenerObservables(): void {
    fromEvent(window, "wheel", { passive: false })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((e: any) => {
        if (e?.ctrlKey) e.preventDefault();
      });
  }
}
