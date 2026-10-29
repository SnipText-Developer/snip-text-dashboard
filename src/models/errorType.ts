class FetchError {
  constructor(
    public status: number,
    public message: string,
    public code?: string
  ) {}
}

export { FetchError };
