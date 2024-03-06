import { Component, InputSignal, input } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@Component({
  selector: "is-toast",
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: "./toast.component.html",
  styleUrl: "./toast.component.scss",
})
export class ToastComponent {
  position: InputSignal<any> = input("bottom-right");

  toastClass(): any {}
}
