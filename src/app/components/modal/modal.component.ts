import { Component, HostListener, Input, TemplateRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { fromEvent, debounceTime } from "rxjs";

@Component({
  selector: "is-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.scss"],
})
export class ModalComponent {
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    console.log("Width: " + event.target.innerWidth);
    event.preventDefault()
    event.stopPropagation();
  }
  @Input({ alias: "header", required: false }) headerTemplate?: TemplateRef<any>;
  @Input({ alias: "content", required: false }) contentTemplate?: TemplateRef<any>;
  @Input({ alias: "open", required: false }) isModalVisible: boolean = true;

  // ngOnInit() {
  //   fromEvent(window, "resize").pipe().subscribe((e) => e.preventDefault())
  // }
}
