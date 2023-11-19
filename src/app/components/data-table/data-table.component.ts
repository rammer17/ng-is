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
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { PopoverDirective } from "../popover/popover.directive";
import { ButtonComponent } from "../button/button.component";
import {
  BehaviorSubject,
  Observable,
  merge,
  of,
  switchMap,
  map,
  shareReplay,
  ReplaySubject,
  tap,
  distinct,
  from,
  toArray,
  filter,
  scan,
  startWith,
  combineLatest,
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
      status: "AB",
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
  sortAction$: BehaviorSubject<null> = new BehaviorSubject<null>(null);
  filterAction$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  availableFilters$?: Observable<any>;
  refetchFilters$: BehaviorSubject<string> = new BehaviorSubject<string>("");

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

    this.data$ = merge(this.sortAction$, this.filterAction$).pipe(
      switchMap((currentActiveFilters: object[]) => {
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

        // console.log(currentActiveFilters);

        // return of(this.data);

        const filteredData = currentActiveFilters?.length
          ? this.filterData(this.data, currentActiveFilters)
          : this.data;

        return of(filteredData);
      })
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
  // activeFilters: { [key: string]: boolean } = {};

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

        //Reset input value
        this.refetchFilters$.next("");

        // Get all available distinct values for filtering based on the input data
        this.availableFilter$ = combineLatest([
          this.activeFilter$,
          this.refetchFilters$.pipe(
            switchMap((filterInputValue: string) =>
              from(this.data).pipe(
                distinct((x: any) => x[filterType]),
                filter((x: any) =>
                  this.doesValueContainFilterInputValue(
                    x[filterType],
                    filterInputValue
                  )
                ),
                map((x: any) => x[filterType]),
                toArray()
              )
            )
          ),
        ]).pipe(
          map((x: any[]) => [...new Set(x.flat(1)).values()])
          // tap((x) => console.log(x))
        );
        break;
      default:
        break;
    }
  }

  onSortTableRows(order: "ASC" | "DESC"): void {
    this.sortOrder = order;
    this.sortIndex = this.tempSortIndex;
    this.sortAction$.next(null);
    this.showTableHeadSorting = false;
  }

  onToggleTableField(index: number): void {
    this.showTableHeadSorting = false;
    this.tempSortIndex = -1;
    // this.showToggleColumns = false;
    this.cdr.detectChanges();
    this.fields[index].showInTable = !this.fields[index].showInTable;
    this.cdr.detectChanges();
  }

  onFilterAutocomplete(inputValue: string): void {
    this.refetchFilters$.next(inputValue);
  }

  onFilterChange(filterValue: any, filterType: string): void {
    // console.log(filterType);
    this.activeFilterSource$.next({ [filterType]: filterValue });
  }

  availableFilter$?: Observable<any>;
  activeFilterSource$: ReplaySubject<any> = new ReplaySubject<any>(1);
  activeFilter$: Observable<any> = this.activeFilterSource$.pipe(
    scan(
      (accumulator: any[], currentValue: any) => {
        return accumulator.some(
          (e) =>
            e[Object.keys(currentValue)[0]] === Object.values(currentValue)[0]
        )
          ? [
              ...accumulator.filter(
                (x: any) =>
                  Object.keys(x).length &&
                  Object.values(x)[0] !== Object.values(currentValue)[0]
              ),
            ]
          : [
              ...accumulator.filter((x: any) => Object.keys(x).length),
              currentValue,
            ];
      },
      [{}]
    ),
    tap((x) => {
      // console.log(x);
      this.filterAction$.next(x);
    }),
    startWith([]),
    shareReplay(1)
  );

  determineIfFilterIsChecked(
    activeFiltersArr: object[],
    filterToCheck: any
  ): boolean {
    return activeFiltersArr.some((e) => Object.values(e)[0] === filterToCheck);
  }

  private doesValueContainFilterInputValue(
    string: string,
    substring: string
  ): boolean {
    return string.toLowerCase().includes(substring.toLowerCase());
  }

  private filterData(data: any[], currentActiveFilters: any[]): any {
    let filteredData: any[] = data;

    const allActiveFilterValues = [
      ...new Set(currentActiveFilters.map((x) => Object.values(x)[0])),
    ];

    currentActiveFilters.forEach((activeFilter: any) => {
      filteredData = filteredData.filter((value: any) => {
        return allActiveFilterValues.includes(
          value[Object.keys(activeFilter)[0]]
        );
      });
    });

    return filteredData;
  }
}

export type PopoverType = "SORT" | "ACTION" | "TOGGLE_COLUMN" | "FILTER";
