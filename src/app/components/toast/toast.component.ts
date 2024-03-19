import { trigger, state, style, transition, animate } from "@angular/animations";
import { Component } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@Component({
  selector: "is-toast",
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: "./toast.component.html",
  styleUrl: "./toast.component.scss",
  animations: [
    trigger("createAnimation", [
      transition("* => true", [
        style({ opacity: 0, transform: "translateY(200%)" }),
        animate("250ms", style({ opacity: 1, transform: "translateY(0) scale(1)" })),
      ]),
      transition("* => false", [
        style({ opacity: 1, transform: "scale(1)" }),
        animate("250ms", style({ opacity: 0, transform: "scale(1)" })),
      ]),
    ]),
    trigger("shrinkAnimationFirst", [
      state("true", style({ transform: "scale(.75)", "transform-origin": "top", "margin-bottom": "2rem" })),
      transition("* => true", [
        style({ transform: "scale(1)", "transform-origin": "top" }),
        animate("250ms", style({ transform: "scale(.75)", "margin-bottom": "2rem" })),
      ]),
    ]),
  ],
})
export class ToastComponent {
  toastClass(): any {
    return {};
  }
}
