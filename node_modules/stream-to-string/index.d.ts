declare module 'stream-to-string' {
  const streamToString: (stream: NodeJS.ReadableStream) => Promise<string>;
  export = streamToString;
}
