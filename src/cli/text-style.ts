// The actual API is documented at the end of this file

const FG_DEFAULT = 39;
const BG_DEFAULT = 49;

/**
 * @see https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters
 */
class TextStyle extends Function {

  //----- Attributes -----

  get Reset(): TextStyleResult { return this._newFunc([0], 0) }
  get Bold(): TextStyleResult { return this._newFunc([1], 22) }
  get Faint(): TextStyleResult { return this._newFunc([2], 22) }
  get Italic(): TextStyleResult { return this._newFunc([3], 23) }
  get Underline(): TextStyleResult { return this._newFunc([4], 24) }
  get SlowBlink(): TextStyleResult { return this._newFunc([5], 25) }
  get RapidBlink(): TextStyleResult { return this._newFunc([6], 25) }
  get ReverseVideo(): TextStyleResult { return this._newFunc([7], 27) }
  get Conceal(): TextStyleResult { return this._newFunc([8], 28) }
  get CrossedOut(): TextStyleResult { return this._newFunc([9], 29) }
  get DoublyUnderlined(): TextStyleResult { return this._newFunc([21], 24) }
  get Overlined(): TextStyleResult { return this._newFunc([53], 55) }

  //----- Foreground colors -----

  get FgBlack(): TextStyleResult { return this._newFunc([30], FG_DEFAULT) }
  get FgRed(): TextStyleResult { return this._newFunc([31], FG_DEFAULT) }
  get FgGreen(): TextStyleResult { return this._newFunc([32], FG_DEFAULT) }
  get FgYellow(): TextStyleResult { return this._newFunc([33], FG_DEFAULT) }
  get FgBlue(): TextStyleResult { return this._newFunc([34], FG_DEFAULT) }
  get FgMagenta(): TextStyleResult { return this._newFunc([35], FG_DEFAULT) }
  get FgCyan(): TextStyleResult { return this._newFunc([36], FG_DEFAULT) }
  get FgWhite(): TextStyleResult { return this._newFunc([37], FG_DEFAULT) }

  FgColorCode(code: number): TextStyleResult { return this._newFunc([38, 5, code], FG_DEFAULT) }

  /** Gray */
  get FgBrightBlack(): TextStyleResult { return this._newFunc([90], FG_DEFAULT) }
  get FgBrightRed(): TextStyleResult { return this._newFunc([91], FG_DEFAULT) }
  get FgBrightGreen(): TextStyleResult { return this._newFunc([92], FG_DEFAULT) }
  get FgBrightYellow(): TextStyleResult { return this._newFunc([93], FG_DEFAULT) }
  get FgBrightBlue(): TextStyleResult { return this._newFunc([94], FG_DEFAULT) }
  get FgBrightMagenta(): TextStyleResult { return this._newFunc([95], FG_DEFAULT) }
  get FgBrightCyan(): TextStyleResult { return this._newFunc([96], FG_DEFAULT) }
  get FgBrightWhite(): TextStyleResult { return this._newFunc([97], FG_DEFAULT) }

  //----- Background colors -----

  get BgBlack(): TextStyleResult { return this._newFunc([40], BG_DEFAULT) }
  get BgRed(): TextStyleResult { return this._newFunc([41], BG_DEFAULT) }
  get BgGreen(): TextStyleResult { return this._newFunc([42], BG_DEFAULT) }
  get BgYellow(): TextStyleResult { return this._newFunc([43], BG_DEFAULT) }
  get BgBlue(): TextStyleResult { return this._newFunc([44], BG_DEFAULT) }
  get BgMagenta(): TextStyleResult { return this._newFunc([45], BG_DEFAULT) }
  get BgCyan(): TextStyleResult { return this._newFunc([46], BG_DEFAULT) }
  get BgWhite(): TextStyleResult { return this._newFunc([47], BG_DEFAULT) }

  BgColorCode(code: number): TextStyleResult { return this._newFunc([48, 5, code], BG_DEFAULT) }

  /** Gray */
  get BgBrightBlack(): TextStyleResult { return this._newFunc([100], BG_DEFAULT) }
  get BgBrightRed(): TextStyleResult { return this._newFunc([101], BG_DEFAULT) }
  get BgBrightGreen(): TextStyleResult { return this._newFunc([102], BG_DEFAULT) }
  get BgBrightYellow(): TextStyleResult { return this._newFunc([103], BG_DEFAULT) }
  get BgBrightBlue(): TextStyleResult { return this._newFunc([104], BG_DEFAULT) }
  get BgBrightMagenta(): TextStyleResult { return this._newFunc([105], BG_DEFAULT) }
  get BgBrightCyan(): TextStyleResult { return this._newFunc([106], BG_DEFAULT) }
  get BgBrightWhite(): TextStyleResult { return this._newFunc([107], BG_DEFAULT) }

  //----- API management -----

  private _startCodes = new Array<number>();
  private _endCodes = new Array<number>();

  /**
   * Returns a function that is both:
   * 1. An instance of `TextStyle` (which is a factory for more `TextStyleResult`
   *    values)
   * 2. A hybrid of a template tag function and a normal function
   */
  private _newFunc(startCodes: Array<number>, endCode: number): TextStyleResult {
    const func = ((templateStrings: string | TemplateStringsArray, ...substitutions: unknown[]): string => {
      let text;
      if (typeof templateStrings === 'string') {
        text = templateStrings;
      } else {
        text = templateStrings[0];
        for (const [index, subst] of substitutions.entries()) {
          text += String(subst);
          text += templateStrings[index + 1];
        }
      }
      return setAttrs(func._startCodes) + text + setAttrs(func._endCodes);
    }) as TextStyleResult;
    func._startCodes = [...this._startCodes, ...startCodes];
    func._endCodes = [endCode, ...this._endCodes];
    Object.setPrototypeOf(func, TextStyle.prototype); // (1)
    return func;
  }
}

function setAttrs(attrs: Array<number>) {
  return `\x1B[` + attrs.join(';') + `m`;
}

export type TextStyleResult = TextStyle & TmplFunc;

type TmplFunc = (templateStrings: string | TemplateStringsArray, ...substitutions: unknown[]) => string;

/**
 * ```js
 * console.log(style.Underline.FgGreen`underlined green`);
 * console.log(style.FgColorCode(51)`turquoise`);
 * console.log(style.Bold('bold'));
 * ```
 * You can set up the template tag dynamically:
 * ```js
 * let style;
 * if (success) {
 *   style = style.FgGreen.Bold;
 * } else {
 *   style = style.FgRed.Bold;
 * }
 * console.log(style`We are finished`);
 * ```
 */
export const style = new TextStyle();
