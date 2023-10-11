import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  TemplateRef,
  inject,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IconDefinition, IconName } from "@fortawesome/fontawesome-svg-core";
import {
  faEllipsis,
  faHandDots,
  faListDots,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { PopoverDirective } from "../popover/popover.directive";
import { ButtonComponent } from "../button/button.component";
import {
  BehaviorSubject,
  Observable,
  Subject,
  from,
  merge,
  of,
  switchMap,
  map,
  shareReplay,
  tap,
  distinct,
  concatMap,
  toArray,
  reduce,
  mergeMap,
  ReplaySubject,
} from "rxjs";
import { InputComponent } from "../input/input.component";

@Component({
  selector: "is-data-table",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    PopoverDirective,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: "./data-table.component.html",
  styleUrls: ["./data-table.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  @Input("headerTemplate") headerTemplate?: TemplateRef<any>;
  @Input("footerTemplate") footerTemplate?: TemplateRef<any>;
  @Input("data") data: any[] = [
    {
      task: "TASK-8782",
      title:
        "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
      status: "B",
    },
    {
      task: "TASK-7878",
      title: "We need to bypass the neural TCP card!",
      status: "A",
    },
    {
      task: "TASK-8686",
      title:
        "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: "B",
    },
    {
      task: "TASK-8782",
      title:
        "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
      status: "C",
    },
    {
      task: "TASK-7878",
      title: "We need to bypass the neural TCP card!",
      status: "A",
    },
    {
      task: "TASK-8686",
      title:
        "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: "D",
    },
    {
      task: "TASK-8782",
      title:
        "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
      status: "B",
    },
    {
      task: "TASK-7878",
      title: "We need to bypass the neural TCP card!",
      status: "S",
    },
    {
      task: "TASK-8686",
      title:
        "I'll parse the wireless SSL protocol, that should driver the API panel!",
      status: "Y",
    },
  ];

  fields: any;
  data$?: Observable<any>;
  sort$: BehaviorSubject<null> = new BehaviorSubject<null>(null);
  filter$: BehaviorSubject<null> = new BehaviorSubject<null>(null);
  availableFilters$?: Observable<any>;
  refetchFilters$: ReplaySubject<string> = new ReplaySubject<string>(1);

  ngOnInit(): void {
    // Transform field names to title case
    this.fields = Object.keys(this.data[0]).map((x: string) => {
      return {
        name: x[0].toUpperCase() + x.slice(1),
        type: x,
        showInTable: true,
        sort: true,
      };
    });

    this.data$ = merge(this.sort$, this.filter$).pipe(
      switchMap(() => {
        if (this.sortIndex !== -1) {
          this.data.sort((a, b) => {
            return a[this.fields[this.sortIndex].name.toLowerCase()] <
              b[this.fields[this.sortIndex].name.toLowerCase()]
              ? this.sortOrder === "ASC"
                ? -1
                : 1
              : this.sortOrder === "ASC"
              ? 1
              : -1;
          });
        }
        const filteredData = this.filterValues.size
          ? this.filterData(this.data)
          : this.data;

        return of(filteredData);
      }),
      shareReplay(1)
    );
  }
  actionIcon: IconDefinition = faEllipsis;

  sortOrder?: "ASC" | "DESC";
  tempSortIndex: number = -1;
  sortIndex: number = -1;
  actionIndex: number = -1;
  filterIndex: number = -1;

  showActions: boolean = false;
  showTableHeadSorting: boolean = false;
  showToggleColumns: boolean = false;
  showFilter: boolean = false;

  filters: any[] = [
    {
      name: "Status",
      type: "status",
    },
    {
      name: "Task",
      type: "task",
    },
  ];
  filterValues: Map<string, Set<any>> = new Map<string, Set<any>>();
  activeFilters: { [key: string]: boolean } = {};

  onTogglePopover(type: PopoverType, index?: number, filterType?: any): void {
    switch (type) {
      case "SORT":
        // Toggle sort popover
        this.showTableHeadSorting =
          this.tempSortIndex !== index ? true : !this.showTableHeadSorting;
        this.tempSortIndex = index!;
        // Close all other popovers
        this.showActions = false;
        this.actionIndex = -1;
        this.showToggleColumns = false;
        this.showFilter = false;
        this.filterIndex = -1;
        break;
      case "ACTION":
        // Toggle actions popover
        this.showActions =
          this.actionIndex !== index ? true : !this.showActions;
        this.actionIndex = index!;
        // Close all other popovers
        this.showTableHeadSorting = false;
        this.tempSortIndex = -1;
        this.showToggleColumns = false;
        this.showFilter = false;
        this.filterIndex = -1;
        break;
      case "TOGGLE_COLUMN":
        // Toggle columns popover
        this.showToggleColumns = !this.showToggleColumns;
        // Close all other popovers
        this.showTableHeadSorting = false;
        this.tempSortIndex = -1;
        this.showActions = false;
        this.actionIndex = -1;
        this.showFilter = false;
        this.filterIndex = -1;
        break;
      case "FILTER":
        // Toggle columns popover
        this.showFilter = this.filterIndex !== index ? true : !this.showFilter;
        this.filterIndex = index!;
        // Close all other popovers
        this.showTableHeadSorting = false;
        this.tempSortIndex = -1;
        this.showActions = false;
        this.actionIndex = -1;
        this.showToggleColumns = false;

        this.availableFilters$ = this.refetchFilters$.pipe(
          switchMap((activeFilterValue: string) =>
            of(this.data).pipe(
              map((data: any[]) => {
                const uniques = new Set();
                const uniqueData = data.reduce((arr: any, current: any) => {
                  if (!uniques.has(current[filterType])) {
                    arr.push(current);
                    uniques.add(current[filterType]);
                  }
                  return arr;
                }, []);
                return uniqueData
                  .map((x: any) => x[filterType])
                  .filter((fieldValue: any) => fieldValue === activeFilterValue);
              })
            )
          )
        );
        break;
      default:
        break;
    }
  }

  onSortTableRows(order: "ASC" | "DESC"): void {
    this.sortOrder = order;
    this.sortIndex = this.tempSortIndex;
    this.sort$.next(null);
    this.showTableHeadSorting = false;
  }

  onToggleTableField(index: number): void {
    this.showTableHeadSorting = false;
    this.tempSortIndex = -1;
    this.showToggleColumns = false;
    this.cdr.detectChanges();
    this.fields[index].showInTable = !this.fields[index].showInTable;
    this.cdr.detectChanges();
  }

  onFilterChange(key: string, value: any) {
    if (!this.activeFilters[key] && this.filterValues.has(value.type))
      this.removeFilter(value.type, key);

    if (this.activeFilters[key]) this.addFilter(value.type, key);

    this.filter$.next(null);
  }

  onFilterAutocomplete(inputValue: string): void {
    this.refetchFilters$.next(inputValue);
    console.log("FILTER");
    console.log(inputValue);
  }

  private addFilter(key: string, value: any): void {
    if (!this.filterValues.has(key)) {
      this.filterValues.set(key, new Set<any>());
    }
    this.filterValues.get(key)?.add(value);
  }

  private removeFilter(key: string, valueToRemove: any): void {
    if (this.filterValues.has(key)) {
      const values = this.filterValues.get(key) as Set<any>;
      values.delete(valueToRemove);
      if (values.size === 0) {
        this.filterValues.delete(key);
      }
    }
  }

  private filterData(data: any[]): any {
    const activeFiltersValues = Array.from(this.filterValues.values()).flatMap(
      (x) => Array.from(x)
    );
    const activeFilterKeys = Array.from(this.filterValues.keys());

    return data.filter((x: any) => {
      for (let index = 0; index < activeFilterKeys.length; index++) {
        if (!activeFiltersValues.includes(x[activeFilterKeys[index]])) {
          return false;
        }
      }
      return true;
    });
  }
}

export type PopoverType = "SORT" | "ACTION" | "TOGGLE_COLUMN" | "FILTER";
