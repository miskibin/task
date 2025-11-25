declare module "papaparse" {
  export interface ParseResult<T> {
    data: T[]
    errors: Array<{ row: number; index: number; message: string }>
    meta: {
      delimiter: string
      linebreak: string
      aborted: boolean
      truncated: boolean
      cursor: number
    }
  }

  export interface ParseConfig {
    header?: boolean
    dynamicTyping?: boolean
    skipEmptyLines?: boolean
    complete?: (results: ParseResult<any>) => void
    error?: (error: Error) => void
    [key: string]: any
  }

  export function parse(csv: string, config: ParseConfig): ParseResult<any>

  const Papa: {
    parse: (csv: string, config: ParseConfig) => ParseResult<any>
  }
  export default Papa
}
