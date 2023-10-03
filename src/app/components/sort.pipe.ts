import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
  pure: false,
  standalone: true,
})
export class SortPipe implements PipeTransform {
  static isString(value: any): boolean {
    return typeof value === 'string' || value instanceof String;
  }

  static caseInsensitiveSort(a: any, b: any) {
    if (SortPipe.isString(a) && SortPipe.isString(b)) return a.localeCompare(b);

    return SortPipe.defaultCompare(a, b);
  }

  static defaultCompare(a: any, b: any) {
    if (a && a instanceof Date) a = a.getTime();

    if (b && b instanceof Date) b = b.getTime();

    if (a === b) return 0;

    if (a == null) return 1;

    if (b == null) return -1;

    return a > b ? 1 : -1;
  }

  static parseExpression(expression: string): string[] {
    expression = expression.replace(/\[(\w+)\]/g, '.$1');
    expression = expression.replace(/^\./, '');
    return expression.split('.');
  }

  static getValue(object: any, expression: string[]): any {
    for (let i = 0, n = expression.length; i < n; ++i) {
      if (!object) {
        return;
      }
      const k = expression[i];
      if (!(k in object)) {
        return;
      }
      if (typeof object[k] === 'function') {
        object = object[k]();
      } else {
        object = object[k];
      }
    }

    return object;
  }

  static setValue(object: any, value: any, expression: string[]) {
    let i;
    for (i = 0; i < expression.length - 1; i++) {
      object = object[expression[i]];
    }

    object[expression[i]] = value;
  }

  transform(
    value: any | any[],
    expression?: any,
    reverse?: boolean,
    isCaseInsensitive: boolean = false,
    comparator?: Function
  ): any {
    if (!value) {
      return value;
    }

    if (Array.isArray(expression)) {
      return this.multiExpressionTransform(
        value,
        expression.slice(),
        reverse!,
        isCaseInsensitive,
        comparator
      );
    }

    if (Array.isArray(value)) {
      return this.sortArray(value.slice(), expression, reverse, isCaseInsensitive, comparator);
    }

    if (typeof value === 'object') {
      return this.transformObject(
        Object.assign({}, value),
        expression,
        reverse,
        isCaseInsensitive,
        comparator
      );
    }

    return value;
  }

  private sortArray<Type>(
    array: Type[],
    expression?: any,
    reverse?: boolean,
    isCaseInsensitive?: boolean,
    comparator?: Function
  ): Type[] {
    const isDeepLink = expression && expression.indexOf('.') !== -1;

    if (isDeepLink) {
      expression = SortPipe.parseExpression(expression);
    }

    let compareFn: Function;

    if (comparator && typeof comparator === 'function') {
      compareFn = comparator;
    } else {
      compareFn = isCaseInsensitive ? SortPipe.caseInsensitiveSort : SortPipe.defaultCompare;
    }

    const sortedArray: any[] = array.sort((a: any, b: any): number => {
      if (!expression) {
        return compareFn(a, b);
      }

      if (!isDeepLink) {
        if (a && b) {
          return compareFn(a[expression], b[expression]);
        }
        return compareFn(a, b);
      }

      return compareFn(SortPipe.getValue(a, expression), SortPipe.getValue(b, expression));
    });

    if (reverse) {
      return sortedArray.reverse();
    }

    return sortedArray;
  }

  private transformObject(
    value: any | any[],
    expression?: any,
    reverse?: boolean,
    isCaseInsensitive?: boolean,
    comparator?: Function
  ): any {
    const parsedExpression = SortPipe.parseExpression(expression);
    let lastPredicate: string | null | undefined = parsedExpression.pop();
    let oldValue = SortPipe.getValue(value, parsedExpression);

    if (!Array.isArray(oldValue)) {
      parsedExpression.push(lastPredicate!);
      lastPredicate = null;
      oldValue = SortPipe.getValue(value, parsedExpression);
    }

    if (!oldValue) {
      return value;
    }

    SortPipe.setValue(
      value,
      this.transform(oldValue, lastPredicate, reverse, isCaseInsensitive),
      parsedExpression
    );
    return value;
  }

  private multiExpressionTransform(
    value: any,
    expressions: any[],
    reverse: boolean,
    isCaseInsensitive: boolean = false,
    comparator?: Function
  ): any {
    return expressions.reverse().reduce((result: any, expression: any) => {
      return this.transform(result, expression, reverse, isCaseInsensitive, comparator);
    }, value);
  }
}
